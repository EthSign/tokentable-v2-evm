// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IOwnable} from "./IOwnable.sol";
import {IVersionable} from "./IVersionable.sol";

/**
 * @title ITTUFeeCollector
 * @author Jack Xu @ EthSign
 * @dev TTUFeeCollector handles service fee calculation.
 */
interface ITTUFeeCollector is IOwnable, IVersionable {
    event DefaultFeeSet(uint256 bips);
    event CustomFeeSet(address unlockerAddress, uint256 bips);

    /**
     * @notice Returns the amount of tokens deducted as fees.
     */
    function getFee(
        address unlockerAddress,
        uint256 tokenTransferred
    ) external view returns (uint256 tokensCollected);
}
