// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IVersionable} from "./IVersionable.sol";

interface ITTTrackerTokenV2 is IVersionable {
    /**
     * @dev This contract should be deployed with `TTUDeployerLite`, which calls this function with the correct parameters.
     * @param ttuInstance_ The address of the corresponding Unlocker.
     */
    function initialize(address ttuInstance_) external;
}
