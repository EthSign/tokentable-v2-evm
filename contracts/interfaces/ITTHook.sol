// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title ITTHook
 * @author Jack Xu @ EthSign
 */
interface ITTHook {
    /**
     * @notice Forwards the call context from the hooked contract.
     * @dev Reverts within hooks will revert the hooked contract as well.
     * @param selector The selector of the called function.
     * @param context Encoded data from the called function.
     * @param caller The caller of the hooked contract.
     */
    function didCall(
        bytes4 selector,
        bytes calldata context,
        address caller
    ) external;
}
