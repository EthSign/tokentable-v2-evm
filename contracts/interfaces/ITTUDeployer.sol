// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {ITokenTableUnlockerV2} from "./ITokenTableUnlockerV2.sol";
import {ITTFutureTokenV2} from "./ITTFutureTokenV2.sol";
import {ITTTrackerTokenV2} from "./ITTTrackerTokenV2.sol";
import {ITTUFeeCollector} from "./ITTUFeeCollector.sol";

/**
 * @title TTUDeployer
 * @author Jack Xu @ EthSign
 * @dev This is the deployer for all TokenTable core and proxy contracts. All
 * initial setup and configuration is automatically done here.
 *
 * To save gas and enable easy upgradeability, all deployed contracts are
 * beacon proxy instances.
 *
 * You should avoid deploying TokenTable contracts individually unless you know
 * what you're doing.
 */
interface ITTUDeployer {
    event TTUDeployerInitialized(
        address unlockerImpl,
        address futureTokenImpl,
        address trackerTokenImpl,
        address beaconManagerImpl,
        address feeCollector
    );
    event TokenTableSuiteDeployed(
        address by,
        string projectId,
        address unlocker,
        address futureToken,
        address trackerToken
    );
    event FeeCollectorChanged(address feeCollector);

    error AlreadyDeployed(); // 0xa6ef0ba1

    /**
     * @dev Exposes the fee collector variable.
     */
    function feeCollector() external returns (ITTUFeeCollector);

    /**
     * @notice Deploys and configures a new set of TokenTable products.
     * @dev Emits: TokenTableSuiteDeployed. Throws: AlreadyDeployed().
     * @param projectToken The project token.
     * @param projectId A unique projectId (otherwise will revert).
     * @param disableAutoUpgrade When set to false, a Clone instead of a
     * BeaconProxy is created to prevent future upgradeability.
     * @param allowTransferableFT Allow FutureToken to be transferable.
     */
    function deployTTSuite(
        address projectToken,
        string calldata projectId,
        bool disableAutoUpgrade,
        bool allowTransferableFT
    )
        external
        returns (ITokenTableUnlockerV2, ITTFutureTokenV2, ITTTrackerTokenV2);
}
