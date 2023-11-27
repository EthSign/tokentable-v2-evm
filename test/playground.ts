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
    if (latestIncompleteLinearDuration == 0n) latestIncompleteLinearDuration++

    const latestIncompleteLinearIntervalForEachUnlock =
        latestIncompleteLinearDuration /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex]

    const latestIncompleteLinearClaimableTimestampRelative =
        claimTimestampRelative -
        linearStartTimestampsRelative[latestIncompleteLinearIndex]
    const numOfClaimableUnlocksInIncompleteLinear =
        (latestIncompleteLinearClaimableTimestampRelative * precisionDecimals) /
        latestIncompleteLinearIntervalForEachUnlock

    const latestIncompleteLinearClaimableBips =
        (linearBips[latestIncompleteLinearIndex] *
            precisionDecimals *
            numOfClaimableUnlocksInIncompleteLinear) /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex] /
        precisionDecimals

    claimableBips += latestIncompleteLinearClaimableBips
    if (claimableBips > bipsPrecision * precisionDecimals) {
        claimableBips = bipsPrecision * precisionDecimals
    }

    return (claimableBips * totalAmount) / bipsPrecision / precisionDecimals
}

const result = calculateAmountOfTokensToClaimAtTimestamp(
    0n,
    126240000n,
    [0n, 126240000n],
    2630000n * 1n + 1n,
    [10000n, 0n],
    [48n, 1n],
    10000n,
    566666n
)

console.log(result)
