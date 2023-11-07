// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IOwnable} from "./IOwnable.sol";

/**
 * @title ITTUFeeCollector
 * @author Jack Xu @ EthSign
 * @dev TTUFeeCollector handles service fee calculation.
 */
interface ITTUFeeCollector is IOwnable {
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
