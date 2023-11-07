// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

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

contract TTUDeployerLite is ITTUDeployer, Ownable {
    TTUV2BeaconManager public beaconManager;
    ITTUFeeCollector public override feeCollector;
    mapping(string => bool) public registry;

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
        bool disableAutoUpgrade,
        bool allowTransferableFT
    )
        external
        returns (ITokenTableUnlockerV2, ITTFutureTokenV2, ITTTrackerTokenV2)
    {
        if (registry[projectId]) revert AlreadyDeployed();
        registry[projectId] = true;

        ITTFutureTokenV2 futureToken;
        ITokenTableUnlockerV2 unlocker;
        ITTTrackerTokenV2 trackerToken;
        if (disableAutoUpgrade) {
            futureToken = ITTFutureTokenV2(
                Clones.clone(
                    beaconManager.FUTURETOKEN_BEACON().implementation()
                )
            );
            futureToken.initialize(projectToken, allowTransferableFT);
            unlocker = ITokenTableUnlockerV2(
                Clones.clone(beaconManager.UNLOCKER_BEACON().implementation())
            );
            unlocker.initialize(
                projectToken,
                address(futureToken),
                address(this)
            );
            trackerToken = ITTTrackerTokenV2(
                Clones.clone(
                    beaconManager.TRACKERTOKEN_BEACON().implementation()
                )
            );
            trackerToken.initialize(address(unlocker));
        } else {
            futureToken = ITTFutureTokenV2(
                address(
                    new BeaconProxy(
                        address(beaconManager.FUTURETOKEN_BEACON()),
                        abi.encodeWithSelector(
                            ITTFutureTokenV2.initialize.selector,
                            projectToken,
                            allowTransferableFT
                        )
                    )
                )
            );
            unlocker = ITokenTableUnlockerV2(
                address(
                    new BeaconProxy(
                        address(beaconManager.UNLOCKER_BEACON()),
                        abi.encodeWithSelector(
                            ITokenTableUnlockerV2.initialize.selector,
                            projectToken,
                            futureToken,
                            this
                        )
                    )
                )
            );
            trackerToken = ITTTrackerTokenV2(
                address(
                    new BeaconProxy(
                        address(beaconManager.TRACKERTOKEN_BEACON()),
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
}
