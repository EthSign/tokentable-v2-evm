// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title ITTHook
 * @author Jack Xu @ EthSign
 * @dev This hook is similar to the access control delegate, but the intent
 * is made clearer with the removal of view and return type.
 */
interface ITTHook {
    /**
     * @notice Forwards the call context from the hooked contract.
     * @param selector The selector of the called function.
     * @param context The encoded call data from the called function.
     * @param caller The caller of the hooked contract.
     */
    function didCall(
        bytes4 selector,
        bytes calldata context,
        address caller
    ) external;
}
