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
    TTUDeployer
} from '../typechain-types'
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers'
import {id, ZeroAddress, AbiCoder, encodeBytes32String} from 'ethers'
import {time, mine} from '@nomicfoundation/hardhat-network-helpers'
import {setNextBlockTimestamp} from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time'

chai.use(chaiAsPromised)

const randomIntegerBetween = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min

const calculateAmountOfTokensToClaimAtTimestamp = (
    startTimestampAbsolute: number,
    endTimestampRelative: number,
    linearStartTimestampsRelative: number[],
    claimTimestampAbsolute: number,
    linearBips: number[],
    numOfUnlocksForEachLinear: number[],
    bipsPrecision: number,
    totalAmount: number
): number => {
    let claimableBips = 0
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
        claimableBips += linearBips[i]
    }
    // 2. calculate incomplete linear index claimable in bips
    let latestIncompleteLinearDuration = 0
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
    const latestIncompleteLinearIntervalForEachUnlock =
        latestIncompleteLinearDuration /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex]
    const latestIncompleteLinearClaimableTimestampRelative =
        claimTimestampRelative -
        linearStartTimestampsRelative[latestIncompleteLinearIndex]
    const numOfClaimableUnlocksInIncompleteLinear = Math.floor(
        latestIncompleteLinearClaimableTimestampRelative /
            latestIncompleteLinearIntervalForEachUnlock
    )
    const latestIncompleteLinearClaimableBips =
        (linearBips[latestIncompleteLinearIndex] *
            numOfClaimableUnlocksInIncompleteLinear) /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex]

    claimableBips += latestIncompleteLinearClaimableBips
    if (claimableBips > bipsPrecision) {
        claimableBips = bipsPrecision
    }

    return (claimableBips * totalAmount) / bipsPrecision
}

describe('V2', () => {
    let s0: HardhatEthersSigner,
        founder: HardhatEthersSigner,
        investor: HardhatEthersSigner
    let projectToken: MockERC20, futureToken: TTFutureTokenV2

    before(async () => {
        ;[s0, founder, investor] = await ethers.getSigners()
        console.log(s0.address, founder.address, investor.address)
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

        const BIPS_PRECISION = 10 ** 4,
            presetId = id('PRESET 1'),
            linearStartTimestampsRelative = [0, 10, 11, 30, 31, 60, 100],
            linearEndTimestampRelative = 400,
            linearBips = [0, 1000, 0, 2000, 0, 4000, 3000],
            numOfUnlocksForEachLinear = [1, 1, 1, 1, 1, 4, 3],
            totalAmount = BIPS_PRECISION

        let startTimestampAbsolute: number,
            amountSkipped: number,
            amountDepositingNow: number

        beforeEach(async () => {
            unlocker = await ethers.deployContract('TokenTableUnlockerV2', s0)
            await futureToken.initialize(await projectToken.getAddress(), true)
            await futureToken.setAuthorizedMinterSingleUse(
                await unlocker.getAddress()
            )
            await unlocker.initialize(
                await projectToken.getAddress(),
                await futureToken.getAddress(),
                ZeroAddress
            )
            await projectToken.mint(founder.address, BIPS_PRECISION)
            await projectToken
                .connect(founder)
                .approve(await unlocker.getAddress(), BIPS_PRECISION)
            await unlocker.transferOwnership(founder.address)
            startTimestampAbsolute = Math.round(Date.now() / 1000) + 20
            amountSkipped = 0
            amountDepositingNow = totalAmount / 2
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
                        .createPreset(
                            presetId,
                            linearStartTimestampsRelative,
                            linearEndTimestampRelative,
                            linearBips,
                            numOfUnlocksForEachLinear
                        )
                ).to.be.revertedWithCustomError(unlocker, 'NotPermissioned')
                await expect(
                    await unlocker
                        .connect(founder)
                        .createPreset(
                            presetId,
                            linearStartTimestampsRelative,
                            linearEndTimestampRelative,
                            linearBips,
                            numOfUnlocksForEachLinear
                        )
                )
                    .to.emit(unlocker, 'PresetCreated')
                    .withArgs(presetId)
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
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await expect(
                    unlocker
                        .connect(investor)
                        .createActual(
                            investor.address,
                            presetId,
                            startTimestampAbsolute,
                            amountSkipped,
                            totalAmount,
                            amountDepositingNow
                        )
                ).to.be.revertedWithCustomError(unlocker, 'NotPermissioned')
                await expect(
                    unlocker
                        .connect(founder)
                        .createActual(
                            investor.address,
                            encodeBytes32String(''),
                            startTimestampAbsolute,
                            amountSkipped,
                            totalAmount,
                            amountDepositingNow
                        )
                ).to.be.revertedWithCustomError(unlocker, 'InvalidPresetFormat')
                await expect(
                    unlocker
                        .connect(founder)
                        .createActual(
                            investor.address,
                            presetId,
                            startTimestampAbsolute,
                            totalAmount,
                            totalAmount,
                            amountDepositingNow
                        )
                ).to.be.revertedWithCustomError(unlocker, 'InvalidSkipAmount')
                const createActualTx = await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                await expect(createActualTx)
                    .to.emit(unlocker, 'ActualCreated')
                    .withArgs(presetId, actualId)
                await expect(createActualTx)
                    .to.emit(unlocker, 'TokensDeposited')
                    .withArgs(actualId, amountDepositingNow)
            })

            it('should deposit okay and enforce permissions', async () => {
                await unlocker
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                await expect(
                    unlocker
                        .connect(investor)
                        .deposit(actualId, amountDepositingNow)
                ).to.be.revertedWithCustomError(unlocker, 'NotPermissioned')
                const balanceBefore = await projectToken.balanceOf(
                    await unlocker.getAddress()
                )
                await expect(
                    await unlocker
                        .connect(founder)
                        .deposit(actualId, amountDepositingNow)
                )
                    .to.emit(unlocker, 'TokensDeposited')
                    .withArgs(actualId, amountDepositingNow)
                const balanceAfter = await projectToken.balanceOf(
                    await unlocker.getAddress()
                )
                expect(balanceAfter - balanceBefore).to.equal(
                    amountDepositingNow
                )
            })

            it('should let founder withdraw deposit and enforce permissions', async () => {
                await unlocker
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                await unlocker
                    .connect(founder)
                    .deposit(actualId, amountDepositingNow)
                await expect(
                    unlocker
                        .connect(investor)
                        .withdrawDeposit(actualId, amountDepositingNow)
                ).to.be.revertedWithCustomError(unlocker, 'NotPermissioned')
                await expect(
                    unlocker
                        .connect(founder)
                        .withdrawDeposit(actualId, totalAmount + 1)
                ).to.be.revertedWithPanic('0x11')

                const balanceOfFounderBefore = await projectToken.balanceOf(
                    founder.address
                )
                await expect(
                    await unlocker
                        .connect(founder)
                        .withdrawDeposit(actualId, amountDepositingNow)
                )
                    .to.emit(unlocker, 'TokensWithdrawn')
                    .withArgs(actualId, founder.address, amountDepositingNow)
                const balanceOfFounderAfter = await projectToken.balanceOf(
                    founder.address
                )
                expect(balanceOfFounderAfter - balanceOfFounderBefore).to.equal(
                    amountDepositingNow
                )
            })

            describe('should calculate the correct claimable amount', () => {
                const validateOnChainResults = async (
                    timeSkipped: number,
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
                    await unlocker
                        .connect(founder)
                        .createPreset(
                            presetId,
                            linearStartTimestampsRelative,
                            linearEndTimestampRelative,
                            linearBips,
                            numOfUnlocksForEachLinear
                        )
                })

                describe('no skip', () => {
                    let actualId: bigint

                    beforeEach(async () => {
                        amountSkipped = 0
                        await unlocker
                            .connect(founder)
                            .createActual(
                                investor.address,
                                presetId,
                                startTimestampAbsolute,
                                amountSkipped,
                                totalAmount,
                                amountDepositingNow
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
                            randomIntegerBetween(0, 500)
                        )
                        const randomUniqueTimestamps = [
                            ...new Set(randomTimestamps)
                        ].sort((a, b) => a - b)
                        for (const timeSkipped of randomUniqueTimestamps) {
                            await validateOnChainResults(timeSkipped, actualId)
                        }
                    })
                })

                describe('random skip', () => {
                    let actualId: bigint

                    beforeEach(async () => {
                        amountSkipped = randomIntegerBetween(0, BIPS_PRECISION)
                        console.log(
                            `           Random amount skipped: ${amountSkipped}`
                        )
                        await unlocker
                            .connect(founder)
                            .createActual(
                                investor.address,
                                presetId,
                                startTimestampAbsolute,
                                amountSkipped,
                                totalAmount,
                                amountDepositingNow
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
                            randomIntegerBetween(0, 500)
                        )
                        const randomUniqueTimestamps = [
                            ...new Set(randomTimestamps)
                        ].sort((a, b) => a - b)
                        for (const timeSkipped of randomUniqueTimestamps) {
                            await validateOnChainResults(timeSkipped, actualId)
                        }
                    })
                })
            })

            it('should let investor claim the correct amount', async () => {
                amountDepositingNow = 0
                await unlocker
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                let deltaAmountClaimable,
                    amountClaimed = 0,
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
                    unlocker.connect(investor).claim(actualId, ZeroAddress)
                )
                    .to.be.revertedWithCustomError(
                        unlocker,
                        'InsufficientDeposit'
                    )
                    .withArgs(deltaAmountClaimable, amountDepositingNow)
                // Deposit more, should now claim
                await unlocker.connect(founder).deposit(actualId, totalAmount)
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim(actualId, ZeroAddress)
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
                // Time jump to beginning of second to last linear, should claim OK
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[5]
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
                    ) - amountClaimed
                amountClaimed += deltaAmountClaimable
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim(actualId, ZeroAddress)
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
                // Time jump to start of final linear
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[6]
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
                    ) - amountClaimed
                amountClaimed += deltaAmountClaimable
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim(actualId, ZeroAddress)
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
                // Time jump to after unlocking is finished
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearEndTimestampRelative + 100
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
                    ) - amountClaimed
                amountClaimed += deltaAmountClaimable
                balanceBefore = await projectToken.balanceOf(investor.address)
                await expect(
                    await unlocker
                        .connect(investor)
                        .claim(actualId, ZeroAddress)
                )
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        deltaAmountClaimable
                    )
                balanceAfter = await projectToken.balanceOf(investor.address)
                expect(balanceAfter - balanceBefore).to.equal(
                    deltaAmountClaimable
                )
            })

            it('should let founders or cancelables cancel and refund the correct amount', async () => {
                await unlocker
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        totalAmount
                    )
                const actualId = (
                    await futureToken.tokensOfOwner(investor.address)
                )[0]
                // Should revert when calling without permission
                await expect(
                    unlocker.connect(investor).cancel(actualId, founder.address)
                ).to.be.revertedWithCustomError(unlocker, 'NotPermissioned')
                // Time jump to beginning of third linear and claim
                let claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[2]
                await setNextBlockTimestamp(claimTimestampAbsolute)
                await mine()
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
                await unlocker.connect(investor).claim(actualId, ZeroAddress)
                // Time jump to beginning of second to last linear and cancel
                claimTimestampAbsolute =
                    startTimestampAbsolute + linearStartTimestampsRelative[5]
                await setNextBlockTimestamp(claimTimestampAbsolute)
                await mine()
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
                const amountRefundedToFounder =
                    totalAmount -
                    amountSentToInvestor -
                    amountShouldSendToInvestor
                const cancelTx = await unlocker
                    .connect(founder)
                    .cancel(actualId, founder.address)
                await expect(cancelTx)
                    .to.emit(unlocker, 'ActualCancelled')
                    .withArgs(
                        actualId,
                        amountShouldSendToInvestor,
                        amountRefundedToFounder,
                        founder.address
                    )
                const claimCancelledTx = await unlocker
                    .connect(investor)
                    .claimCancelledActual(actualId, ZeroAddress)
                await expect(claimCancelledTx)
                    .to.emit(unlocker, 'TokensClaimed')
                    .withArgs(
                        actualId,
                        investor.address,
                        investor.address,
                        amountShouldSendToInvestor
                    )
            })

            it('debug', async () => {
                const presetIdDebug =
                    '0x8d61cd4af1543185657c1e7505cdbd081a06053ebdce17a4edc137f270aeed9c'
                const linearStartTimestampsRelativeDebug = [0, 31536000]
                const linearEndTimestampRelativeDebug = 31536001
                const linearBipsDebug = [0, 10000]
                const numOfUnlocksForEachLinearDebug = [1, 1]
                const amountSkippedDebug = 0
                const totalAmountDebug = '500000000000000000000'
                const amountDepositingNowDebug = 0
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
        })

        describe('PreviewToken', () => {
            it('should reflect the correct claimable amount', async () => {
                const TrackerFactory =
                    await ethers.getContractFactory('TTTrackerTokenV2')
                const trackerToken = await TrackerFactory.deploy()
                await trackerToken.initialize(await unlocker.getAddress())
                // Set up two actuals
                await unlocker
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                await unlocker
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const actualIds = await futureToken.tokensOfOwner(
                    investor.address
                )
                const actualId0 = actualIds[0]
                const actualId1 = actualIds[1]
                // Time skip
                await setNextBlockTimestamp(
                    startTimestampAbsolute +
                        linearStartTimestampsRelative[
                            randomIntegerBetween(0, 3)
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
                await unlocker.connect(investor).claim(actualId0, ZeroAddress)
                await unlocker.connect(investor).claim(actualId1, ZeroAddress)
                // Skip again
                await setNextBlockTimestamp(
                    startTimestampAbsolute +
                        linearStartTimestampsRelative[
                            randomIntegerBetween(4, 6)
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
            let deployer: TTUDeployer
            const projectId = 'adoaisdaposdmpoaindopi'

            beforeEach(async () => {
                const DeployerFactory =
                    await ethers.getContractFactory('TTUDeployer')
                deployer = await DeployerFactory.deploy()
                await projectToken.mint(founder.address, BIPS_PRECISION)
                startTimestampAbsolute = Math.round(Date.now() / 1000) + 20
                amountSkipped = 0
                amountDepositingNow = totalAmount / 2
            })

            it('should deploy suite and complete beacon upgrade', async () => {
                const [
                    unlockerAddress,
                    futureTokenAddress,
                    previewTokenAddress
                ] = await deployer
                    .connect(founder)
                    .deployTTSuite.staticCall(
                        await projectToken.getAddress(),
                        projectId,
                        false,
                        true
                    )
                await deployer
                    .connect(founder)
                    .deployTTSuite(
                        await projectToken.getAddress(),
                        projectId,
                        false,
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
                const trackerToken = await hre.ethers.getContractAt(
                    'TTTrackerTokenV2',
                    previewTokenAddress
                )
                // Setting stuff up to see if they work
                await projectToken
                    .connect(founder)
                    .approve(await unlocker_.getAddress(), BIPS_PRECISION)
                await unlocker_
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker_
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                await unlocker_
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const [actualId0, actualId1] = await futureToken_.tokensOfOwner(
                    investor.address
                )
                // Time skip
                const newStartTimestampAbsolute =
                    startTimestampAbsolute +
                    linearStartTimestampsRelative[randomIntegerBetween(0, 3)]
                await setNextBlockTimestamp(newStartTimestampAbsolute)
                await mine()
                const ttuDeltaClaimables =
                    (await unlocker_.calculateAmountClaimable(actualId0))
                        .deltaAmountClaimable +
                    (await unlocker_.calculateAmountClaimable(actualId1))
                        .deltaAmountClaimable
                expect(ttuDeltaClaimables).to.equal(
                    await trackerToken.balanceOf(investor.address)
                )
                // Deliberately upgrading to wrong address to test beacon, should fail everything
                const beaconManager = await hre.ethers.getContractAt(
                    'TTUV2BeaconManager',
                    await deployer.beaconManager()
                )
                await beaconManager.upgradeUnlocker(
                    await projectToken.getAddress()
                )
                await beaconManager.upgradeFutureToken(
                    await projectToken.getAddress()
                )
                await expect(
                    unlocker_
                        .connect(founder)
                        .createActual(
                            investor.address,
                            presetId,
                            newStartTimestampAbsolute * 2,
                            amountSkipped,
                            totalAmount,
                            0
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
                    previewTokenAddress2
                ] = await deployer
                    .connect(founder)
                    .deployTTSuite.staticCall(
                        await projectToken.getAddress(),
                        projectId + projectId,
                        true,
                        true
                    )
                await deployer
                    .connect(founder)
                    .deployTTSuite(
                        await projectToken.getAddress(),
                        projectId + projectId,
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
                    previewTokenAddress2
                )
                // Set things up for clone
                await projectToken
                    .connect(founder)
                    .approve(await unlocker2.getAddress(), BIPS_PRECISION)
                await unlocker2
                    .connect(founder)
                    .createPreset(
                        presetId,
                        linearStartTimestampsRelative,
                        linearEndTimestampRelative,
                        linearBips,
                        numOfUnlocksForEachLinear
                    )
                await unlocker2
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                await unlocker2
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        startTimestampAbsolute,
                        amountSkipped,
                        totalAmount,
                        amountDepositingNow
                    )
                const [actualId02, actualId12] =
                    await futureToken2.tokensOfOwner(investor.address)
                // Time skip
                const newStartTimestampAbsolute =
                    startTimestampAbsolute +
                    linearStartTimestampsRelative[randomIntegerBetween(0, 3)]
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
                const beaconManager = await hre.ethers.getContractAt(
                    'TTUV2BeaconManager',
                    await deployer.beaconManager()
                )
                await beaconManager.upgradeUnlocker(
                    await projectToken.getAddress()
                )
                await beaconManager.upgradeFutureToken(
                    await projectToken.getAddress()
                )
                // Clone should not revert
                await unlocker2
                    .connect(founder)
                    .createActual(
                        investor.address,
                        presetId,
                        newStartTimestampAbsolute * 2,
                        amountSkipped,
                        totalAmount,
                        0
                    )
                await futureToken2.tokensOfOwner(investor.address)
            })
        })
    })
})
