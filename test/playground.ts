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
        claimableBips += linearBips[i]
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

    const precisionDecimals = 10n ** 5n

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
            numOfClaimableUnlocksInIncompleteLinear) /
        numOfUnlocksForEachLinear[latestIncompleteLinearIndex] /
        precisionDecimals

    claimableBips += latestIncompleteLinearClaimableBips
    if (claimableBips > bipsPrecision) {
        claimableBips = bipsPrecision
    }

    return (claimableBips * totalAmount) / bipsPrecision
}

const result = calculateAmountOfTokensToClaimAtTimestamp(
    0n,
    100n,
    [0n, 100n],
    12n,
    [10000n, 0n],
    [3n, 1n],
    10000n,
    100n
)

console.log(result)
