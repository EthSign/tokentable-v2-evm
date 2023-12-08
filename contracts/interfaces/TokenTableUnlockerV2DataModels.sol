// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title TokenTableUnlockerV2DataModels.Preset
 * @author Jack Xu @ EthSign
 * @notice A `Preset` is an unlocking schedule template that contains information that's shared across all stakeholders within a single round.
 *
 * In this system, cliff unlocks are considered linear as well. This enables us to mix and match cliffs and linears at will, providing full customizability. Cliff waiting periods have a linear bip of 0 and cliff unlocking moments have a duration of 1 second.
 *
 * Note that all relative timestamps are relative to the absolute start timestamp. Absolute timestamps are standard UNIX epoch timestamps in seconds.
 *
 * `linearStartTimestampsRelative`: An array of start timestamps for each linear segment.
 * `linearEndTimestampRelative`: The timestamp that marks the end of the final linear segment.
 * `linearBips`: The basis point that is unlocked for each linear segment. Must add up to `TokenTableUnlockerV2.BIPS_PRECISION()`.
 * `numOfUnlocksForEachLinear`: The number of unlocks within each respective linear segment.
 * `stream`: If the tokens should unlock as a stream instead of a cliff at the end of linear segment subdivision.
 */
struct Preset {
    uint256[] linearStartTimestampsRelative;
    uint256 linearEndTimestampRelative;
    uint256[] linearBips;
    uint256[] numOfUnlocksForEachLinear;
    bool stream;
}

/**
 * @title TokenTableUnlockerV2DataModels.Actual
 * @author Jack Xu @ EthSign
 * @notice An `Actual` is an actual unlocking schedule for a single stakeholder and builds on top of an existing preset. An actual contains information that is different from one stakeholder to the next.
 *
 * `presetId`: The ID of the `Preset` that this `Actual` references.
 * `startTimestampAbsolute`: The timestamp of when this unlocking schedule actually starts.
 * `amountClaimed`: The amount of tokens that have already been claimed by the recipient.
 * `totalAmount`: The maximum amount of tokens that the recipient can claim throughout the entire schedule.
 */
struct Actual {
    bytes32 presetId;
    uint256 startTimestampAbsolute;
    uint256 amountClaimed;
    uint256 totalAmount;
}
