// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITTHook
 * @author Jack Xu @ EthSign
 */
interface ITTHook {
    /**
     * @notice Forwards the call context from the hooked contract.
     * @dev Reverts within hooks will revert the hooked contract as well.
     * @param originalMsgData Forwarded calldata from the called function.
     * @param originalMsgSender Forwarded sender from the called function.
     */
    function didCall(
        bytes calldata originalMsgData,
        address originalMsgSender
    ) external;
}
