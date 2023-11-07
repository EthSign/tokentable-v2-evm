// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TTUV2BeaconManager
 * @author Jack Xu @ EthSign
 * @dev This contract manages the upgradeable beacons that we use to seamlessly
 * upgrade TokenTableUnlocker, TTFutureToken, and TTTrackerToken on behalf of
 * our users in the future.
 *
 * This contract should be deployed using TTUDeployer.
 */
contract TTUV2BeaconManager is Ownable {
    UpgradeableBeacon public immutable UNLOCKER_BEACON;
    UpgradeableBeacon public immutable FUTURETOKEN_BEACON;
    UpgradeableBeacon public immutable TRACKERTOKEN_BEACON;

    constructor(
        address unlockerImpl,
        address futureTokenImpl,
        address trackerTokenImpl
    ) {
        UNLOCKER_BEACON = new UpgradeableBeacon(unlockerImpl);
        FUTURETOKEN_BEACON = new UpgradeableBeacon(futureTokenImpl);
        TRACKERTOKEN_BEACON = new UpgradeableBeacon(trackerTokenImpl);
    }

    function upgradeUnlocker(address newImpl) external onlyOwner {
        UNLOCKER_BEACON.upgradeTo(newImpl);
    }

    function upgradeFutureToken(address newImpl) external onlyOwner {
        FUTURETOKEN_BEACON.upgradeTo(newImpl);
    }

    function upgradePreviewToken(address newImpl) external onlyOwner {
        TRACKERTOKEN_BEACON.upgradeTo(newImpl);
    }
}
