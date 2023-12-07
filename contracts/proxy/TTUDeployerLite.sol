// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ITTUDeployer} from "../interfaces/ITTUDeployer.sol";
import {TTUV2BeaconManager} from "./TTUV2BeaconManager.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ITokenTableUnlockerV2} from "../interfaces/ITokenTableUnlockerV2.sol";
import {ITTFutureTokenV2} from "../interfaces/ITTFutureTokenV2.sol";
import {ITTTrackerTokenV2} from "../interfaces/ITTTrackerTokenV2.sol";
import {ITTUFeeCollector} from "../interfaces/ITTUFeeCollector.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import {Clones} from "../libraries/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVersionable} from "../interfaces/IVersionable.sol";

contract TTUDeployerLite is ITTUDeployer, Ownable, IVersionable {
    TTUV2BeaconManager public beaconManager;
    ITTUFeeCollector public override feeCollector;
    mapping(string => bool) public registry;

    constructor() Ownable(_msgSender()) {}

    function setBeaconManager(
        TTUV2BeaconManager _beaconManager
    ) external onlyOwner {
        beaconManager = _beaconManager;
    }

    function setFeeCollector(
        ITTUFeeCollector feeCollector_
    ) external onlyOwner {
        feeCollector = feeCollector_;
        emit FeeCollectorChanged(address(feeCollector));
    }

    function deployTTSuite(
        address projectToken,
        string calldata projectId,
        bool isUpgradeable,
        bool isTransferable,
        bool isCancelable,
        bool isHookable,
        bool isWithdrawable
    )
        external
        returns (ITokenTableUnlockerV2, ITTFutureTokenV2, ITTTrackerTokenV2)
    {
        if (registry[projectId]) revert AlreadyDeployed();
        registry[projectId] = true;

        ITTFutureTokenV2 futureToken;
        ITokenTableUnlockerV2 unlocker;
        ITTTrackerTokenV2 trackerToken;
        if (!isUpgradeable) {
            futureToken = ITTFutureTokenV2(
                Clones.clone(beaconManager.futureTokenBeacon().implementation())
            );
            futureToken.initialize(projectToken, isTransferable);
            unlocker = ITokenTableUnlockerV2(
                Clones.clone(beaconManager.unlockerBeacon().implementation())
            );
            unlocker.initialize(
                projectToken,
                address(futureToken),
                address(this),
                isCancelable,
                isHookable,
                isWithdrawable
            );
            trackerToken = ITTTrackerTokenV2(
                Clones.clone(
                    beaconManager.trackerTokenBeacon().implementation()
                )
            );
            trackerToken.initialize(address(unlocker));
        } else {
            futureToken = ITTFutureTokenV2(
                address(
                    new BeaconProxy(
                        address(beaconManager.futureTokenBeacon()),
                        abi.encodeWithSelector(
                            ITTFutureTokenV2.initialize.selector,
                            projectToken,
                            isTransferable
                        )
                    )
                )
            );
            unlocker = ITokenTableUnlockerV2(
                address(
                    new BeaconProxy(
                        address(beaconManager.unlockerBeacon()),
                        abi.encodeWithSelector(
                            ITokenTableUnlockerV2.initialize.selector,
                            projectToken,
                            futureToken,
                            this,
                            isCancelable,
                            isHookable,
                            isWithdrawable
                        )
                    )
                )
            );
            trackerToken = ITTTrackerTokenV2(
                address(
                    new BeaconProxy(
                        address(beaconManager.trackerTokenBeacon()),
                        abi.encodeWithSelector(
                            ITTTrackerTokenV2.initialize.selector,
                            address(unlocker)
                        )
                    )
                )
            );
        }
        unlocker.transferOwnership(msg.sender);
        futureToken.setAuthorizedMinterSingleUse(address(unlocker));
        emit TokenTableSuiteDeployed(
            msg.sender,
            projectId,
            address(unlocker),
            address(futureToken),
            address(trackerToken)
        );
        return (unlocker, futureToken, trackerToken);
    }

    function version() external pure returns (string memory) {
        return "2.5.0";
    }
}
