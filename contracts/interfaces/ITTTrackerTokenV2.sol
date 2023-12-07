// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IVersionable} from "./IVersionable.sol";

interface ITTTrackerTokenV2 is IVersionable {
    function initialize(address ttuInstance_) external;
}
