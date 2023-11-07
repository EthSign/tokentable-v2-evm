// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

/**
 * @title ITTAccessControlDelegate
 * @author Jack Xu @ EthSign
 * @dev This delegate interface provides loose coupling between TokenTable
 * unlocker and access control contracts. Any contract that implements this
 * interface is a valid source of truth for the unlocker.
 */
interface ITTAccessControlDelegate {
    /**
     * @notice Checks if an operator has the adequate permissions to perform a
     * specific action.
     * @dev We check if the operator is permitted to call a certain function
     * given an actualID and contextual data.
     * @param selector The selector of the calling function.
     * @param context Any useful contextual data. This is usually the call
     * parameters encoded in order.
     * @param operator The entity whose permissions we are trying to verify.
     * @return A boolean value indicating if the operator is permitted to
     * perform a specific action.
     */
    function hasPermissionToPerform(
        bytes4 selector,
        bytes calldata context,
        address operator
    ) external view returns (bool);
}
