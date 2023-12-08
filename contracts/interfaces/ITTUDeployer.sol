// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ITokenTableUnlockerV2} from "./ITokenTableUnlockerV2.sol";
import {ITTFutureTokenV2} from "./ITTFutureTokenV2.sol";
import {ITTTrackerTokenV2} from "./ITTTrackerTokenV2.sol";
import {ITTUFeeCollector} from "./ITTUFeeCollector.sol";

/**
 * @title TTUDeployer
 * @author Jack Xu @ EthSign
 * @dev This is the deployer for all TokenTable core and proxy contracts. All initial setup and configuration is automatically done here.
 * To save gas and enable easy upgradeability, all deployed contracts are `Clone` or `BeaconProxy` instances.
 * You should avoid deploying TokenTable contracts individually unless you know what you're doing.
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

    /**
     * @dev 0xa6ef0ba1
     */
    error AlreadyDeployed();

    /**
     * @dev Exposes the fee collector variable.
     * @return An instance of the fee collector.
     */
    function feeCollector() external returns (ITTUFeeCollector);

    /**
     * @notice Deploys and configures a new set of TokenTable products.
     * @dev Emits `TokenTableSuiteDeployed`. Throws: `AlreadyDeployed`.
     * @param projectToken The project token address.
     * @param projectId A unique projectId, otherwise it will revert.
     * @param isUpgradeable When set to false, a `Clone` instead of a `BeaconProxy` is created to prevent future upgradeability.
     * @param isTransferable Allow FutureToken to be transferable.
     * @param isCancelable Allow unlocking schedules to be cancelled in the Unlocker.
     * @param isHookable Allow Unlocker to call an external hook.
     * @param isWithdrawable Allow the founder to withdraw deposited funds.
     */
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
        returns (ITokenTableUnlockerV2, ITTFutureTokenV2, ITTTrackerTokenV2);
}
