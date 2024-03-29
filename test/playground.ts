const calculateAmountOfTokensToClaimAtTimestamp = (
    startTimestampAbsolute: bigint,
    endTimestampRelative: bigint,
    linearStartTimestampsRelative: bigint[],
    claimTimestampAbsolute: bigint,
    linearBips: bigint[],
    numOfUnlocksForEachLinear: bigint[],
    bipsPrecision: bigint,
    totalAmount: bigint,
    amountClaimed: bigint,
    stream: boolean
): bigint => {
    const tokenPrecisionDecimals = 10n ** 5n
    const timePrecisionDecimals = stream ? 10n ** 5n : 1n
    let claimableBips = 0n
    const claimTimestampRelative =
        claimTimestampAbsolute -
        startTimestampAbsolute -
        linearStartTimestampsRelative[0]
    if (claimTimestampRelative < 0) return 0n
    let latestIncompleteLinearIndex = 0
    if (
        claimTimestampAbsolute <
        startTimestampAbsolute + linearStartTimestampsRelative[0]
    ) {
        return amountClaimed
    }
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
        claimableBips += linearBips[i] * tokenPrecisionDecimals
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
    if (latestIncompleteLinearDuration == 0n) latestIncompleteLinearDuration++

    const latestIncompleteLinearIntervalForEachUnlock =
        latestIncompleteLinearDuration /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex]

    const latestIncompleteLinearClaimableTimestampRelative =
        claimTimestampRelative -
        linearStartTimestampsRelative[latestIncompleteLinearIndex]
    const numOfClaimableUnlocksInIncompleteLinear =
        (latestIncompleteLinearClaimableTimestampRelative *
            timePrecisionDecimals) /
        latestIncompleteLinearIntervalForEachUnlock

    const latestIncompleteLinearClaimableBips =
        (linearBips[latestIncompleteLinearIndex] *
            tokenPrecisionDecimals *
            numOfClaimableUnlocksInIncompleteLinear) /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex] /
        timePrecisionDecimals

    claimableBips += latestIncompleteLinearClaimableBips
    if (claimableBips > bipsPrecision * tokenPrecisionDecimals) {
        claimableBips = bipsPrecision * tokenPrecisionDecimals
    }
    let updatedAmountClaimed =
        (claimableBips * totalAmount) / bipsPrecision / tokenPrecisionDecimals
    if (amountClaimed > updatedAmountClaimed) {
        updatedAmountClaimed = amountClaimed
    }
    return updatedAmountClaimed
}

const result = calculateAmountOfTokensToClaimAtTimestamp(
    0n,
    10000n,
    [5000n, 10000n],
    999n,
    [10000n, 0n],
    [10n, 1n],
    10000n,
    10000n,
    0n,
    false
)

// const result = calculateAmountOfTokensToClaimAtTimestamp(
//     1705160360n,
//     18144000n,
//     [0n, 18144000n],
//     1718120360n,
//     [10000n, 0n],
//     [7n, 1n],
//     10000n,
//     100n,
//     false
// )

console.log(result)
