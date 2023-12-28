/* eslint-disable multiline-comment-style */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
import hre, {ethers} from 'hardhat'
import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {before} from 'mocha'
import '@nomicfoundation/hardhat-chai-matchers'
import {
    TokenTableUnlockerV2,
    MockERC20,
    TTFutureTokenV2,
    TTUDeployerLite,
    TTUV2BeaconManager,
    TTTrackerTokenV2
} from '../typechain-types'
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers'
import {id, ZeroAddress, AbiCoder, encodeBytes32String} from 'ethers'
import {time, mine} from '@nomicfoundation/hardhat-network-helpers'
import {setNextBlockTimestamp} from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time'

chai.use(chaiAsPromised)

const randomIntegerBetween = (min: bigint, max: bigint): bigint =>
    BigInt(Math.floor(Math.random() * Number(max - min + 1n))) + min

const calculateAmountOfTokensToClaimAtTimestamp = (
    startTimestampAbsolute: bigint,
    endTimestampRelative: bigint,
    linearStartTimestampsRelative: bigint[],
    claimTimestampAbsolute: bigint,
    linearBips: bigint[],
    numOfUnlocksForEachLinear: bigint[],
    bipsPrecision: bigint,
    totalAmount: bigint
): bigint => {
    const precisionDecimals = 10n ** 10n
    let claimableBips = 0n
    const claimTimestampRelative =
        claimTimestampAbsolute - startTimestampAbsolute
    let latestIncompleteLinearIndex = 0
    let k
    for (k = 0; k < linearStartTimestampsRelative.length; k++) {
        if (linearStartTimestampsRelative[k] <= claimTimestampRelative) {
            latestIncompleteLinearIndex = k
        } else {
            break
        }
    }
    // 1. calculate completed linear index claimables in bips
    for (let i = 0; i < latestIncompleteLinearIndex; i++) {
        claimableBips += linearBips[i] * precisionDecimals
    }
    // 2. calculate incomplete linear index claimable in bips
    let latestIncompleteLinearDuration = 0n
    if (
        latestIncompleteLinearIndex ===
        linearStartTimestampsRelative.length - 1
    ) {
        latestIncompleteLinearDuration =
            endTimestampRelative -
            linearStartTimestampsRelative[
                linearStartTimestampsRelative.length - 1
            ]
    } else {
        latestIncompleteLinearDuration =
            linearStartTimestampsRelative[latestIncompleteLinearIndex + 1] -
            linearStartTimestampsRelative[latestIncompleteLinearIndex]
    }
    if (latestIncompleteLinearDuration === 0n) {
        latestIncompleteLinearDuration = 1n
    }

    const latestIncompleteLinearIntervalForEachUnlock =
        latestIncompleteLinearDuration /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex]

    const latestIncompleteLinearClaimableTimestampRelative =
        claimTimestampRelative -
        linearStartTimestampsRelative[latestIncompleteLinearIndex]
    const numOfClaimableUnlocksInIncompleteLinear =
        latestIncompleteLinearClaimableTimestampRelative /
        latestIncompleteLinearIntervalForEachUnlock

    const latestIncompleteLinearClaimableBips =
        (linearBips[latestIncompleteLinearIndex] *
            precisionDecimals *
            numOfClaimableUnlocksInIncompleteLinear) /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex]

    claimableBips += latestIncompleteLinearClaimableBips
    if (claimableBips > bipsPrecision * precisionDecimals) {
        claimableBips = bipsPrecision * precisionDecimals
    }

    return (claimableBips * totalAmount) / bipsPrecision / precisionDecimals
}

describe('V2', () => {
    let s0: HardhatEthersSigner,
        founder: HardhatEthersSigner,
        investor: HardhatEthersSigner
    let projectToken: MockERC20, futureToken: TTFutureTokenV2

    before(async () => {
        ;[s0, founder, investor] = await ethers.getSigners()
    })

    beforeEach(async () => {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: []
        })
        const MockERC20Factory = await ethers.getContractFactory('MockERC20')
        const TTFutureTokenV2Factory =
            await ethers.getContractFactory('TTFutureTokenV2')
        projectToken = await MockERC20Factory.deploy()
        futureToken = await TTFutureTokenV2Factory.deploy()
    })

    describe('Unlocker', () => {
        let unlocker: TokenTableUnlockerV2

        const BIPS_PRECISION = 10n ** 4n,
            presetId = id('PRESET 1'),
            linearStartTimestampsRelative = [0n, 10n, 11n, 30n, 31n, 60n, 100n],
            linearEndTimestampRelative = 400n,
            linearBips = [0n, 1000n, 0n, 2000n, 0n, 4000n, 3000n],
            numOfUnlocksForEachLinear = [1n, 1n, 1n, 1n, 1n, 4n, 3n],
            totalAmount = BIPS_PRECISION,
            preset = {
                linearStartTimestampsRelative,
                linearEndTimestampRelative,
                linearBips,
                numOfUnlocksForEachLinear,
                stream: false
            }

        let startTimestampAbsolute: bigint,
            amountSkipped: bigint,
            amountDepositingNow: bigint

        beforeEach(async () => {
            unlocker = await ethers.deployContract('TokenTableUnlockerV2', s0)
            await futureToken.initialize(await projectToken.getAddress(), true)
            await futureToken.setAuthorizedMinterSingleUse(
                await unlocker.getAddress()
            )
            await unlocker.initialize(
                await projectToken.getAddress(),
                await futureToken.getAddress(),
                ZeroAddress,
                true,
                true,
                true
            )
            await projectToken.mint(founder.address, BIPS_PRECISION * 2n)
            await projectToken
                .connect(founder)
                .approve(await unlocker.getAddress(), BIPS_PRECISION)
            await unlocker.transferOwnership(founder.address)
            startTimestampAbsolute = BigInt(Date.now()) / 1000n + 20n
            amountSkipped = 0n
            amountDepositingNow = totalAmount / 2n
        })

        describe('Core', () => {
            it('should initialize correctly', async () => {
                expect(await unlocker.getProjectToken()).to.equal(
                    await projectToken.getAddress()
                )
            })

            it('should create a preset and enforce permissions', async () => {
                await expect(
                    unlocker
                        .connect(investor)
                        .createPresets([presetId], [preset], 0, '0x')
                ).to.be.revertedWithCustomError(
                    unlocker,
                    'OwnableUnauthorizedAccount'
                )
                await expect(
                    await unlocker
                        .connect(founder)
                        .createPresets([presetId], [preset], 0, '0x')
                )
                    .to.emit(unlocker, 'PresetCreated')
                    .withArgs(presetId, 0)
                const encodedPreset = await unlocker.getEncodedPreset(presetId)
                const decodedPreset = AbiCoder.defaultAbiCoder().decode(
                    ['uint256[]', 'uint256', 'uint256[]', 'uint256[]'],
                    encodedPreset
                )
                expect(decodedPreset).to.deep.equal([
                    linearStartTimestampsRelative,
                    linearEndTimestampRelative,
                    linearBips,
                    numOfUnlocksForEachLinear
                ])
            })

            it('should create an actual and enforce permissions, no skipping', async () => {
                await unlocker
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await expect(
                    unlocker.connect(investor).createActuals(
                        [investor.address],
                        [
                            {
                                presetId,
                                startTimestampAbsolute,
                                amountClaimed: amountSkipped,
                                totalAmount
                            }
                        ],
                        [0],
                        0,
                        '0x'
                    )
                ).to.be.revertedWithCustomError(
                    unlocker,
                    'OwnableUnauthorizedAccount'
                )
                await expect(
                    unlocker.connect(founder).createActuals(
                        [investor.address],
                        [
                            {
                                presetId: encodeBytes32String(''),
                                startTimestampAbsolute,
                                amountClaimed: amountSkipped,
                                totalAmount
                            }
                        ],
                        [0],
                        0,
                        '0x'
                    )
                ).to.be.revertedWithCustomError(unlocker, 'InvalidPresetFormat')
                await expect(
                    unlocker.connect(founder).createActuals(
                        [investor.address],
                        [
                            {
                                presetId,
                                startTimestampAbsolute,
                                amountClaimed: totalAmount,
                                totalAmount
                            }
                        ],
                        [0],
                        0,
                        '0x'
                    )
                ).to.be.revertedWithCustomError(unlocker, 'InvalidSkipAmount')
                const createActualTx = await unlocker
                    .connect(founder)
                    .createActuals(
                        [investor.address],
                        [
                            {
                                presetId,
                                startTimestampAbsolute,
                                amountClaimed: amountSkipped,
                                totalAmount
                            }
                        ],
                        [0],
                        0,
                        '0x'
                    )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                await expect(createActualTx)
                    .to.emit(unlocker, 'ActualCreated')
                    .withArgs(presetId, actualId, investor.address, 0, 0)
            })

            it('should let founder withdraw deposit and enforce permissions', async () => {
                await unlocker
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await unlocker.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await projectToken
                    .connect(founder)
                    .transfer(await unlocker.getAddress(), amountDepositingNow)
                await expect(
                    unlocker
                        .connect(investor)
                        .withdrawDeposit(amountDepositingNow, '0x')
                ).to.be.revertedWithCustomError(
                    unlocker,
                    'OwnableUnauthorizedAccount'
                )
                await expect(
                    unlocker
                        .connect(founder)
                        .withdrawDeposit(totalAmount + 1n, '0x')
                ).to.be.revertedWithCustomError(
                    projectToken,
                    'ERC20InsufficientBalance'
                )
                const balanceOfFounderBefore = await projectToken.balanceOf(
                    founder.address
                )
                await expect(
                    await unlocker
                        .connect(founder)
                        .withdrawDeposit(amountDepositingNow, '0x')
                )
                    .to.emit(unlocker, 'TokensWithdrawn')
                    .withArgs(founder.address, amountDepositingNow)
                const balanceOfFounderAfter = await projectToken.balanceOf(
                    founder.address
                )
                expect(balanceOfFounderAfter - balanceOfFounderBefore).to.equal(
                    amountDepositingNow
                )
            })

            describe('should calculate the correct claimable amount', () => {
                const validateOnChainResults = async (
                    timeSkipped: bigint,
                    actualId: bigint
                ) => {
                    await time.setNextBlockTimestamp(
                        startTimestampAbsolute + timeSkipped
                    )
                    await mine()
                    const onchainResult =
                        await unlocker.calculateAmountClaimable(actualId)
                    const offchainResult =
                        calculateAmountOfTokensToClaimAtTimestamp(
                            startTimestampAbsolute,
                            linearEndTimestampRelative,
                            linearStartTimestampsRelative,
                            startTimestampAbsolute + timeSkipped,
                            linearBips,
                            numOfUnlocksForEachLinear,
                            BIPS_PRECISION,
                            totalAmount
                        )
                    expect(onchainResult.updatedAmountClaimed).to.equal(
                        offchainResult
                    )
                }

                beforeEach(async () => {
                    await unlocker.connect(founder).createPresets(
                        [presetId],
                        [
                            {
                                linearStartTimestampsRelative,
                                linearEndTimestampRelative,
                                linearBips,
                                numOfUnlocksForEachLinear,
                                stream: false
                            }
                        ],
                        0,
                        '0x'
                    )
                })

                describe('no skip', () => {
                    let actualId: bigint

                    beforeEach(async () => {
                        amountSkipped = 0n
                        await unlocker.connect(founder).createActuals(
                            [investor.address],
                            [
                                {
                                    presetId,
                                    startTimestampAbsolute,
                                    amountClaimed: amountSkipped,
                                    totalAmount
                                }
                            ],
                            [0],
                            0,
                            '0x'
                        )
                        actualId = (
                            await futureToken.tokensOfOwner(investor.address)
                        )[0]
                    })

                    it('key timestamps', async () => {
                        for (const timeSkipped of linearStartTimestampsRelative) {
                            await validateOnChainResults(timeSkipped, actualId)
                        }
                    })

                    it('random timestamps', async () => {
                        const randomTimestamps = Array.from({length: 50}, () =>
                            randomIntegerBetween(0n, 500n)
                        )
                        const randomUniqueTimestamps = [
                            ...new Set(randomTimestamps)
                        ].sort((a, b) => Number(a - b))
                        for (const timeSkipped of randomUniqueTimestamps) {
                            await validateOnChainResults(timeSkipped, actualId)
                        }
                    })
                })

                describe('random skip', () => {
                    let actualId: bigint

                    beforeEach(async () => {
                        amountSkipped = randomIntegerBetween(0n, BIPS_PRECISION)
                        console.log(
                            `           Random amount skipped: ${amountSkipped}`
                        )
                        await unlocker.connect(founder).createActuals(
                            [investor.address],
                            [
                                {
                                    presetId,
                                    startTimestampAbsolute,
                                    amountClaimed: amountSkipped,
                                    totalAmount
                                }
                            ],
                            [0],
                            0,
                            '0x'
                        )
                        actualId = (
                            await futureToken.tokensOfOwner(investor.address)
                        )[0]
                    })

                    it('key timestamps', async () => {
                        for (const timeSkipped of linearStartTimestampsRelative) {
                            await validateOnChainResults(timeSkipped, actualId)
                        }
                    })

                    it('random timestamps', async () => {
                        const randomTimestamps = Array.from({length: 50}, () =>
                            randomIntegerBetween(0n, 500n)
                        )
                        const randomUniqueTimestamps = [
                            ...new Set(randomTimestamps)
                        ].sort((a, b) => Number(a - b))
                        for (const timeSkipped of randomUniqueTimestamps) {
                            await validateOnChainResults(timeSkipped, actualId)
                        }
                    })
                })
            })

            it('should let investor claim the correct amount', async () => {
                amountDepositingNow = 0n
                await unlocker
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await unlocker.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                let deltaAmountClaimable,
                    amountClaimed = 0n,
                    balanceBefore,
                    balanceAfter,
                    claimTimestampAbsolute =
                        startTimestampAbsolute +
                        linearStartTimestampsRelative[2]
                // Time jump to first cliff (should fail)
                await setNextBlockTimestamp(claimTimestampAbsolute)
                await mine()
                deltaAmountClaimable =
                    calculateAmountOfTokensToClaimAtTimestamp(
                        startTimestampAbsolute,
                        linearEndTimestampRelative,
                        linearStartTimestampsRelative,
                        claimTimestampAbsolute,
                        linearBips,
                        numOfUnlocksForEachLinear,
                        BIPS_PRECISION,
                        totalAmount
                    )
                amountClaimed += deltaAmountClaimable
                await expect(
                    unlocker
                        .connect(investor)
                        .claim([actualId], [ZeroAddress], 0, '0x')
                ).to.be.revertedWithCustomError(
                    projectToken,
                    'ERC20InsufficientBalance'
                )
                // Deposit more, should now claim
                await projectToken
                    .connect(founder)
                    .transfer(await unlocker.getAddress(), totalAmount)
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim([actualId], [ZeroAddress], 0, '0x')
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable,
                        0,
                        0
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
                // Time jump to beginning of second to last linear, should claim OK
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[5]
                await setNextBlockTimestamp(claimTimestampAbsolute)
                // await mine()
                deltaAmountClaimable =
                    calculateAmountOfTokensToClaimAtTimestamp(
                        startTimestampAbsolute,
                        linearEndTimestampRelative,
                        linearStartTimestampsRelative,
                        claimTimestampAbsolute,
                        linearBips,
                        numOfUnlocksForEachLinear,
                        BIPS_PRECISION,
                        totalAmount
                    ) - amountClaimed
                amountClaimed += deltaAmountClaimable
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim([actualId], [ZeroAddress], 0, '0x')
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable,
                        0,
                        0
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
                // Time jump to start of final linear
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[6]
                await setNextBlockTimestamp(claimTimestampAbsolute)
                // await mine()
                deltaAmountClaimable =
                    calculateAmountOfTokensToClaimAtTimestamp(
                        startTimestampAbsolute,
                        linearEndTimestampRelative,
                        linearStartTimestampsRelative,
                        claimTimestampAbsolute,
                        linearBips,
                        numOfUnlocksForEachLinear,
                        BIPS_PRECISION,
                        totalAmount
                    ) - amountClaimed
                amountClaimed += deltaAmountClaimable
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim([actualId], [ZeroAddress], 0, '0x')
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable,
                        0,
                        0
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
                // Time jump to after unlocking is finished
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearEndTimestampRelative + 100n
                await setNextBlockTimestamp(claimTimestampAbsolute)
                // await mine()
                deltaAmountClaimable =
                    calculateAmountOfTokensToClaimAtTimestamp(
                        startTimestampAbsolute,
                        linearEndTimestampRelative,
                        linearStartTimestampsRelative,
                        claimTimestampAbsolute,
                        linearBips,
                        numOfUnlocksForEachLinear,
                        BIPS_PRECISION,
                        totalAmount
                    ) - amountClaimed
                amountClaimed += deltaAmountClaimable
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim([actualId], [ZeroAddress], 0, '0x')
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable,
                        0,
                        0
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
            })

            it('should let founders or cancelables cancel and refund the correct amount', async () => {
                await unlocker
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await unlocker.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await projectToken
                    .connect(founder)
                    .transfer(await unlocker.getAddress(), totalAmount)
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                // Should revert when calling without permission
                await expect(
                    unlocker
                        .connect(investor)
                        .cancel([actualId], [false], 0, '0x')
                ).to.be.revertedWithCustomError(
                    unlocker,
                    'OwnableUnauthorizedAccount'
                )
                // Time jump to beginning of third linear and claim
                let claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[2]
                await setNextBlockTimestamp(claimTimestampAbsolute)
                // await mine()
                const amountSentToInvestor =
                    calculateAmountOfTokensToClaimAtTimestamp(
                        startTimestampAbsolute,
                        linearEndTimestampRelative,
                        linearStartTimestampsRelative,
                        claimTimestampAbsolute,
                        linearBips,
                        numOfUnlocksForEachLinear,
                        BIPS_PRECISION,
                        totalAmount
                    )
                await unlocker
                    .connect(investor)
                    .claim([actualId], [ZeroAddress], 0, '0x')
                // Time jump to beginning of second to last linear and cancel
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[5]
                await setNextBlockTimestamp(claimTimestampAbsolute)
                // await mine()
                const amountShouldSendToInvestor =
                    calculateAmountOfTokensToClaimAtTimestamp(
                        startTimestampAbsolute,
                        linearEndTimestampRelative,
                        linearStartTimestampsRelative,
                        claimTimestampAbsolute,
                        linearBips,
                        numOfUnlocksForEachLinear,
                        BIPS_PRECISION,
                        totalAmount
                    ) - amountSentToInvestor
                const cancelTx = await unlocker
                    .connect(founder)
                    .cancel([actualId], [false], 0, '0x')
                await expect(cancelTx)
                    .to.emit(unlocker, 'ActualCancelled')
                    .withArgs(actualId, amountShouldSendToInvestor, false, 0)
            })

            /**
            it('debug', async () => {
                const presetIdDebug =
                    '0x8d61cd4af1543185657c1e7505cdbd081a06053ebdce17a4edc137f270aeed9c'
                const linearStartTimestampsRelativeDebug = [0, 31536000]
                const linearEndTimestampRelativeDebug = 31536001
                const linearBipsDebug = [0, 10000]
                const numOfUnlocksForEachLinearDebug = [1, 1]
                const amountSkippedDebug = 0n
                const totalAmountDebug = 500000000000000000000n
                const amountDepositingNowDebug = 0n
                await unlocker
                    .connect(founder)
                    .createPreset(
                        presetIdDebug,
                        linearStartTimestampsRelativeDebug,
                        linearEndTimestampRelativeDebug,
                        linearBipsDebug,
                        numOfUnlocksForEachLinearDebug
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetIdDebug,
                        startTimestampAbsolute,
                        amountSkippedDebug,
                        totalAmountDebug,
                        amountDepositingNowDebug
                    )
                const actualIdDebug = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                // Time jump and cancel
                const claimTimestampAbsoluteDebug = startTimestampAbsolute + 100
                await setNextBlockTimestamp(claimTimestampAbsoluteDebug)
                await mine()
                await unlocker
                    .connect(founder)
                    .cancel(actualIdDebug, founder.address)
            })
             */
        })

        describe('trackerToken', () => {
            it('should reflect the correct claimable amount', async () => {
                const TrackerFactory =
                    await ethers.getContractFactory('TTTrackerTokenV2')
                const trackerToken = await TrackerFactory.deploy()
                await trackerToken.initialize(await unlocker.getAddress())
                // Set up two actuals
                await unlocker
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await unlocker.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await unlocker.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await projectToken
                    .connect(founder)
                    .transfer(await unlocker.getAddress(), totalAmount * 2n)
                const actualIds = await futureToken.tokensOfOwner(
                    investor.address
                )
                const actualId0 = actualIds[0]
                const actualId1 = actualIds[1]
                // Time skip
                await setNextBlockTimestamp(
                    startTimestampAbsolute +
                        linearStartTimestampsRelative[
                            Number(randomIntegerBetween(0n, 3n))
                        ]
                )
                await mine()
                let ttuDeltaClaimables =
                    (await unlocker.calculateAmountClaimable(actualId0))
                        .deltaAmountClaimable +
                    (await unlocker.calculateAmountClaimable(actualId1))
                        .deltaAmountClaimable
                expect(ttuDeltaClaimables).to.equal(
                    await trackerToken.balanceOf(investor.address)
                )
                await unlocker
                    .connect(investor)
                    .claim([actualId0], [ZeroAddress], 0, '0x')
                await unlocker
                    .connect(investor)
                    .claim([actualId1], [ZeroAddress], 0, '0x')
                // Skip again
                await setNextBlockTimestamp(
                    startTimestampAbsolute +
                        linearStartTimestampsRelative[
                            Number(randomIntegerBetween(4n, 6n))
                        ]
                )
                await mine()
                ttuDeltaClaimables =
                    (await unlocker.calculateAmountClaimable(actualId0))
                        .deltaAmountClaimable +
                    (await unlocker.calculateAmountClaimable(actualId1))
                        .deltaAmountClaimable
                expect(ttuDeltaClaimables).to.equal(
                    await trackerToken.balanceOf(investor.address)
                )
            })
        })

        describe('Deployer', () => {
            let deployer: TTUDeployerLite,
                beaconManager: TTUV2BeaconManager,
                trackerToken: TTTrackerTokenV2
            const projectId = 'adoaisdaposdmpoaindopi'

            beforeEach(async () => {
                const DeployerFactory =
                    await ethers.getContractFactory('TTUDeployerLite')
                deployer = await DeployerFactory.deploy()
                await projectToken.mint(founder.address, BIPS_PRECISION * 2n)
                startTimestampAbsolute = BigInt(Date.now()) / 1000n + 20n
                amountSkipped = 0n
                amountDepositingNow = totalAmount / 2n

                const TrackerFactory =
                    await ethers.getContractFactory('TTTrackerTokenV2')
                trackerToken = await TrackerFactory.deploy()

                const BeaconManagerFactory =
                    await ethers.getContractFactory('TTUV2BeaconManager')
                beaconManager = await BeaconManagerFactory.deploy(
                    await unlocker.getAddress(),
                    await futureToken.getAddress(),
                    await trackerToken.getAddress()
                )

                await deployer.setBeaconManager(
                    await beaconManager.getAddress()
                )
            })

            it('should deploy suite and complete beacon upgrade', async () => {
                const [
                    unlockerAddress,
                    futureTokenAddress,
                    trackerTokenAddress
                ] = await deployer
                    .connect(founder)
                    .deployTTSuite.staticCall(
                        await projectToken.getAddress(),
                        projectId,
                        true,
                        true,
                        true,
                        true,
                        true
                    )
                await deployer
                    .connect(founder)
                    .deployTTSuite(
                        await projectToken.getAddress(),
                        projectId,
                        true,
                        true,
                        true,
                        true,
                        true
                    )
                const unlocker_ = await hre.ethers.getContractAt(
                    'TokenTableUnlockerV2',
                    unlockerAddress
                )
                const futureToken_ = await hre.ethers.getContractAt(
                    'TTFutureTokenV2',
                    futureTokenAddress
                )
                const trackerToken_ = await hre.ethers.getContractAt(
                    'TTTrackerTokenV2',
                    trackerTokenAddress
                )
                // Setting stuff up to see if they work
                await projectToken
                    .connect(founder)
                    .approve(await unlocker_.getAddress(), BIPS_PRECISION)
                await unlocker_
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await unlocker_.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await unlocker_.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                const [actualId0, actualId1] = await futureToken_.tokensOfOwner(
                    investor.address
                )
                // Time skip
                const newStartTimestampAbsolute =
                    startTimestampAbsolute +
                    linearStartTimestampsRelative[
                        Number(randomIntegerBetween(0n, 3n))
                    ]
                await setNextBlockTimestamp(newStartTimestampAbsolute)
                await mine()
                const ttuDeltaClaimables =
                    (await unlocker_.calculateAmountClaimable(actualId0))
                        .deltaAmountClaimable +
                    (await unlocker_.calculateAmountClaimable(actualId1))
                        .deltaAmountClaimable
                expect(ttuDeltaClaimables).to.equal(
                    await trackerToken_.balanceOf(investor.address)
                )
                // Deliberately upgrading to wrong address to test beacon, should fail everything
                const beaconManager_ = await hre.ethers.getContractAt(
                    'TTUV2BeaconManager',
                    await deployer.beaconManager()
                )
                await beaconManager_.upgradeUnlocker(
                    await projectToken.getAddress()
                )
                await beaconManager_.upgradeFutureToken(
                    await projectToken.getAddress()
                )
                await expect(
                    unlocker_.connect(founder).createActuals(
                        [investor.address],
                        [
                            {
                                presetId,
                                startTimestampAbsolute:
                                    newStartTimestampAbsolute * 2n,
                                amountClaimed: amountSkipped,
                                totalAmount
                            }
                        ],
                        [0],
                        0,
                        '0x'
                    )
                ).to.be.revertedWithoutReason()
                await expect(
                    futureToken_.tokensOfOwner(investor.address)
                ).to.be.revertedWithoutReason()
            })

            it('should deploy as clone and not upgrade', async () => {
                // Testing clone instead of beacon proxy
                const [
                    unlockerAddress2,
                    futureTokenAddress2,
                    trackerTokenAddress2
                ] = await deployer
                    .connect(founder)
                    .deployTTSuite.staticCall(
                        await projectToken.getAddress(),
                        projectId + projectId,
                        false,
                        true,
                        true,
                        true,
                        true
                    )
                await deployer
                    .connect(founder)
                    .deployTTSuite(
                        await projectToken.getAddress(),
                        projectId + projectId,
                        false,
                        true,
                        true,
                        true,
                        true
                    )
                const unlocker2 = await hre.ethers.getContractAt(
                    'TokenTableUnlockerV2',
                    unlockerAddress2
                )
                const futureToken2 = await hre.ethers.getContractAt(
                    'TTFutureTokenV2',
                    futureTokenAddress2
                )
                const trackerToken2 = await hre.ethers.getContractAt(
                    'TTTrackerTokenV2',
                    trackerTokenAddress2
                )
                // Set things up for clone
                await projectToken
                    .connect(founder)
                    .approve(await unlocker2.getAddress(), BIPS_PRECISION)
                await unlocker2
                    .connect(founder)
                    .createPresets([presetId], [preset], 0, '0x')
                await unlocker2.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await unlocker2.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                const [actualId02, actualId12] =
                    await futureToken2.tokensOfOwner(investor.address)
                // Time skip
                const newStartTimestampAbsolute =
                    startTimestampAbsolute +
                    linearStartTimestampsRelative[
                        Number(randomIntegerBetween(0n, 3n))
                    ]
                await setNextBlockTimestamp(newStartTimestampAbsolute)
                await mine()
                // Clone
                const ttuDeltaClaimables2 =
                    (await unlocker2.calculateAmountClaimable(actualId02))
                        .deltaAmountClaimable +
                    (await unlocker2.calculateAmountClaimable(actualId12))
                        .deltaAmountClaimable
                expect(ttuDeltaClaimables2).to.equal(
                    await trackerToken2.balanceOf(investor.address)
                )
                // Deliberately upgrading to wrong address to test beacon, should fail everything
                const beaconManager_ = await hre.ethers.getContractAt(
                    'TTUV2BeaconManager',
                    await deployer.beaconManager()
                )
                await beaconManager_.upgradeUnlocker(
                    await projectToken.getAddress()
                )
                await beaconManager_.upgradeFutureToken(
                    await projectToken.getAddress()
                )
                // Clone should not revert
                await unlocker2.connect(founder).createActuals(
                    [investor.address],
                    [
                        {
                            presetId,
                            startTimestampAbsolute:
                                newStartTimestampAbsolute * 2n,
                            amountClaimed: amountSkipped,
                            totalAmount
                        }
                    ],
                    [0],
                    0,
                    '0x'
                )
                await futureToken2.tokensOfOwner(investor.address)
            })
        })
    })
})
