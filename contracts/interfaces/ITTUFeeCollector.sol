// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IOwnable} from "./IOwnable.sol";
import {IVersionable} from "./IVersionable.sol";

/**
 * @title ITTUFeeCollector
 * @author Jack Xu @ EthSign
 * @dev This contract handles TokenTable service fee calculation.
 */
interface ITTUFeeCollector is IOwnable, IVersionable {
    event DefaultFeeSet(uint256 bips);
    event CustomFeeSet(address unlockerAddress, uint256 bips);

    /**
     * @dev 0xc9034e18
     */
    error FeesTooHigh();

    /**
     * @notice Returns the amount of fees to collect.
     * @param unlockerAddress The address of the Unlocker. Used to fetch pricing.
     * @param tokenTransferred The number of tokens transferred.
     * @return tokensCollected The number of tokens to collect as fees.
     */
    function getFee(
        address unlockerAddress,
        uint256 tokenTransferred
    ) external view returns (uint256 tokensCollected);
}
