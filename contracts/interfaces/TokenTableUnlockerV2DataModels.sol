// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title TokenTableUnlockerV2DataModels
 * @author Jack Xu @ EthSign
 * @dev Data models for TokenTableUnlockerV2.
 *
 * Note that all relative timestamps are relative to the start timestamp.
 * Absolute timestamps are standard UNIX epoch timestamps in seconds.
 *
 * In this system, cliff unlocks are considered linear as well. This enables us
 * to mix and match cliffs and linears at will, providing full customizability.
 * Cliff waiting periods have a linear bip of 0 and cliff unlocking moments
 * have a duration of 1 second.
 *
 * A preset is an unlocking schedule template that contains information that's
 * shared across all stakeholders within a single round.
 *
 * An actual is an actual unlocking schedule for a single stakeholder and
 * builds on top of an existing preset. An actual contains information that is
 * different from one stakeholder to the next.
 */
struct Preset {
    uint256[] linearStartTimestampsRelative;
    uint256 linearEndTimestampRelative;
    uint256[] linearBips;
    uint256[] numOfUnlocksForEachLinear;
}

struct Actual {
    bytes32 presetId;
    uint256 startTimestampAbsolute;
    uint256 amountClaimed;
    uint256 totalAmount;
}
