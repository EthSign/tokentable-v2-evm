// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {TTUDeployerLite} from "./TTUDeployerLite.sol";
import {TTUV2BeaconManager} from "./TTUV2BeaconManager.sol";
import {TokenTableUnlockerV2} from "../core/TokenTableUnlockerV2.sol";
import {TTFutureTokenV2} from "../core/TTFutureTokenV2.sol";
import {TTTrackerTokenV2} from "../core/TTTrackerTokenV2.sol";
import {TTUFeeCollector} from "../core/TTUFeeCollector.sol";

contract TTUDeployer is TTUDeployerLite {
    constructor() TTUDeployerLite() {
        TokenTableUnlockerV2 unlocker = new TokenTableUnlockerV2();
        TTFutureTokenV2 futureToken = new TTFutureTokenV2();
        TTTrackerTokenV2 trackerToken = new TTTrackerTokenV2();
        beaconManager = new TTUV2BeaconManager(
            address(unlocker),
            address(futureToken),
            address(trackerToken)
        );
        beaconManager.transferOwnership(msg.sender);
        feeCollector = new TTUFeeCollector();
        feeCollector.transferOwnership(msg.sender);
        emit TTUDeployerInitialized(
            address(unlocker),
            address(futureToken),
            address(trackerToken),
            address(beaconManager),
            address(feeCollector)
        );
    }
}
