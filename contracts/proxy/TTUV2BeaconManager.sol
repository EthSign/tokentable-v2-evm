// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVersionable} from "../interfaces/IVersionable.sol";

/**
 * @title TTUV2BeaconManager
 * @author Jack Xu @ EthSign
 * @dev This contract manages the upgradeable beacons that we use to seamlessly
 * upgrade TokenTableUnlocker, TTFutureToken, and TTTrackerToken on behalf of
 * our users in the future.
 *
 * This contract should be deployed using TTUDeployer.
 */
contract TTUV2BeaconManager is Ownable, IVersionable {
    UpgradeableBeacon public immutable unlockerBeacon;
    UpgradeableBeacon public immutable futureTokenBeacon;
    UpgradeableBeacon public immutable trackerTokenBeacon;

    constructor(
        address unlockerImpl,
        address futureTokenImpl,
        address trackerTokenImpl
    ) Ownable(_msgSender()) {
        unlockerBeacon = new UpgradeableBeacon(unlockerImpl, address(this));
        futureTokenBeacon = new UpgradeableBeacon(
            futureTokenImpl,
            address(this)
        );
        trackerTokenBeacon = new UpgradeableBeacon(
            trackerTokenImpl,
            address(this)
        );
    }

    function upgradeUnlocker(address newImpl) external onlyOwner {
        unlockerBeacon.upgradeTo(newImpl);
    }

    function upgradeFutureToken(address newImpl) external onlyOwner {
        futureTokenBeacon.upgradeTo(newImpl);
    }

    function upgradePreviewToken(address newImpl) external onlyOwner {
        trackerTokenBeacon.upgradeTo(newImpl);
    }

    function version() external pure returns (string memory) {
        return "2.0.1";
    }
}
