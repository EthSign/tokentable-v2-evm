// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IOwnable} from "./IOwnable.sol";
import {IVersionable} from "./IVersionable.sol";
import {Preset, Actual} from "./TokenTableUnlockerV2DataModels.sol";
import {ITTHook} from "./ITTHook.sol";
import {ITTUDeployer} from "./ITTUDeployer.sol";
import {ITTFutureTokenV2} from "./ITTFutureTokenV2.sol";

/**
 * @title ITokenTableUnlockerV2
 * @author Jack Xu @ EthSign
 * @dev The lightweight interface for TokenTableUnlockerV2(.5.x), which handles token unlocking and distribution for TokenTable.
 */
abstract contract ITokenTableUnlockerV2 is IOwnable, IVersionable {
    event PresetCreated(bytes32 presetId, uint256 batchId);
    event ActualCreated(
        bytes32 presetId,
        uint256 actualId,
        address recipient,
        uint256 recipientId,
        uint256 batchId
    );
    event ActualCancelled(
        uint256 actualId,
        uint256 pendingAmountClaimable,
        bool didWipeClaimableBalance,
        uint256 batchId
    );
    event TokensClaimed(
        uint256 actualId,
        address caller,
        address to,
        uint256 amount,
        uint256 feesCharged,
        uint256 batchId
    );
    event TokensWithdrawn(address by, uint256 amount);
    event ClaimingDelegateSet(address delegate);
    event CancelDisabled();
    event HookDisabled();
    event WithdrawDisabled();

    /**
     * @dev 0x0ef8e8dc
     */
    error InvalidPresetFormat();
    /**
     * @dev 0x7cbb15b4
     */
    error PresetExists();
    /**
     * @dev 0xbd88ff7b
     */
    error PresetDoesNotExist();
    /**
     * @dev 0x78c0fc43
     */
    error InvalidSkipAmount();
    /**
     * @dev 0x7f63bd0f
     */
    error NotPermissioned();

    /**
     * @dev This contract should be deployed with `TTUDeployerLite`, which calls this function with the correct parameters.
     * @param projectToken The address of the token that the founder intends to unlock and distribute.
     * @param futureToken_ The address of the associated FutureToken.
     * @param deployer_ The address of the deployer. It helps call the fee collector during claim.
     * @param isCancelable_ If the founder is allowed to cancel schedules. Can be disabled later, but cannot be enabled again.
     * @param isHookable_ If the founder is allowed to attach external hooks to function calls. Can be disabled later, but cannot be enabled again.
     * @param isWithdrawable_ If the founder is allowed to withdraw deposited tokens. Can be disabled later, but cannot be enabled again.
     */
    function initialize(
        address projectToken,
        address futureToken_,
        address deployer_,
        bool isCancelable_,
        bool isHookable_,
        bool isWithdrawable_
    ) external virtual;

    /**
     * @notice Creates an unlocking schedule preset template.
     * @dev Emits `PresetCreated`. Only callable by the owner.
     * @param presetIds These IDs can be the hashes of a plaintext preset names but really there is no restriction. Will revert if they already exist.
     * @param presets An array of `Preset` structs.
     * @param batchId Emitted as an event reserved for EthSign frontend use. This parameter has no effect on contract execution.
     * @param extraData An ERC-5750-esque parameter that's passed to the hook directly.
     */
    function createPresets(
        bytes32[] calldata presetIds,
        Preset[] calldata presets,
        uint256 batchId,
        bytes[] calldata extraData
    ) external virtual;

    /**
     * @notice Creates an actual unlocking schedule based on a preset.
     * @dev Emits `ActualCreated`. A FutureToken is minted in the process with `tokenId == actualId`.
     * @param recipients An array of token recipients for the schedules. Note that claiming eligibility can be modified by transfering the corresponding FutureToken.
     * @param actuals An array of `Actual` structs.
     * @param recipientIds Emitted as an event reserved for EthSign frontend use. This parameter has no effect on contract execution.
     * @param batchId Emitted as an event reserved for EthSign frontend use. This parameter has no effect on contract execution.
     * @param extraData An ERC-5750-esque parameter that's passed to the hook directly.
     */
    function createActuals(
        address[] calldata recipients,
        Actual[] calldata actuals,
        uint256[] calldata recipientIds,
        uint256 batchId,
        bytes[] calldata extraData
    ) external virtual;

    /**
     * @notice Withdraws existing deposit from the contract.
     * @dev Emits `TokensWithdrawn`. Only callable by the owner.
     * @param amount Amount of deposited funds the founder wishes to withdraw.
     * @param extraData An ERC-5750-esque parameter that's passed to the hook directly.
     */
    function withdrawDeposit(
        uint256 amount,
        bytes calldata extraData
    ) external virtual;

    /**
     * @notice Claims claimable tokens for the specified schedules to the specified addresses respectively.
     * @dev Emits `TokensClaimed`. Only callable by the FutureToken owner.
     * @param actualIds The IDs of the unlocking schedules that we are trying to claim from.
     * @param claimTos If we want to send the claimed tokens to an address other than the caller. To send the claimed tokens to the caller (default behavior), pass in `ethers.constants.AddressZero`.
     * @param batchId Emitted as an event reserved for EthSign frontend use. This parameter has no effect on contract execution.
     * @param extraData An ERC-5750-esque parameter that's passed to the hook directly.
     */
    function claim(
        uint256[] calldata actualIds,
        address[] calldata claimTos,
        uint256 batchId,
        bytes[] calldata extraData
    ) external virtual;

    /**
     * @notice Claims claimable tokens for the specified schedules on behalf of recipients. Claimed tokens are sent to the schedule recipients.
     * @dev Emits `TokensClaimed`. Only callable by the claiming delegate.
     * @param actualIds The IDs of the unlocking schedules that we are trying to claim from on behalf of the recipients.
     * @param batchId Emitted as an event reserved for EthSign frontend use. This parameter has no effect on contract execution.
     * @param extraData An ERC-5750-esque parameter that's passed to the hook directly.
     */
    function delegateClaim(
        uint256[] calldata actualIds,
        uint256 batchId,
        bytes[] calldata extraData
    ) external virtual;

    /**
     * @notice Cancels an array of unlocking schedules effective immediately. Tokens not yet claimed but are already unlocked will be tallied.
     * @dev Emits `ActualCancelled`. Only callable by the owner.
     * @param actualIds The ID of the actual unlocking schedule that we want to cancel.
     * @param shouldWipeClaimableBalance If the unlocked and claimable balance of the canceled schedule should be wiped. This is usually used to delete an erroneously created schedule that has already started unlocking.
     * @param batchId Emitted as an event reserved for EthSign frontend use. This parameter has no effect on contract execution.
     * @param extraData An ERC-5750-esque parameter that's passed to the hook directly.
     * @return pendingAmountClaimables Number of tokens eligible to be claimed by the affected stakeholders at the moment of cancellation.
     */
    function cancel(
        uint256[] calldata actualIds,
        bool[] calldata shouldWipeClaimableBalance,
        uint256 batchId,
        bytes[] calldata extraData
    ) external virtual returns (uint256[] memory pendingAmountClaimables);

    /**
     * @notice Sets the hook contract.
     * @dev Only callable by the owner.
     * @param hook The address of the `ITTHook` hook contract.
     */
    function setHook(ITTHook hook) external virtual;

    /**
     * @notice Sets the claiming delegate who can trigger claims on behalf of recipients.
     * @dev Only callable by the owner.
     */
    function setClaimingDelegate(address delegate) external virtual;

    /**
     * @notice Permanently disables the `cancel()` function.
     * @dev Only callable by the owner.
     */
    function disableCancel() external virtual;

    /**
     * @notice Permanently disables the hook.
     * @dev Only callable by the owner.
     */
    function disableHook() external virtual;

    /**
     * @notice Permanently prevents the founder from withdrawing deposits.
     * @dev Only callable by the owner.
     */
    function disableWithdraw() external virtual;

    /**
     * @return The deployer instance associated with this Unlocker.
     */
    function deployer() external view virtual returns (ITTUDeployer);

    /**
     * @return The FutureToken instance associated with this Unlocker.
     */
    function futureToken() external view virtual returns (ITTFutureTokenV2);

    /**
     * @return The external hook associated with this Unlocker.
     */
    function hook() external view virtual returns (ITTHook);

    /**
     * @return The claiming delegate who can trigger claims on behalf of schedule recipients.
     */
    function claimingDelegate() external view virtual returns (address);

    /**
     * @return If the founder is allowed to cancel schedules.
     */
    function isCancelable() external view virtual returns (bool);

    /**
     * @return If the founder can attach external hooks to function calls.
     */
    function isHookable() external view virtual returns (bool);

    /**
     * @return If the founder can withdraw deposited but unclaimed tokens.
     */
    function isWithdrawable() external view virtual returns (bool);

    /**
     * @param actualId The canceled schedule ID.
     * @return The amount of tokens from canceled schedules that have been unlocked but unclaimed by the stakeholder.
     */
    function pendingAmountClaimableForCancelledActuals(
        uint256 actualId
    ) external view virtual returns (uint256);

    /**
     * @notice To decode in JS, use:
     * ```js
     *  ethers.utils.defaultAbiCoder.decode(
     *      ['uint256[]', 'uint256', 'uint256[]', 'uint256[]', 'bool'],
     *      encodedPreset
     *  )
     * ```
     * @param presetId The ID of the preset we are trying to read.
     * @return An ABI-encoded `Preset`, as nested objects cannot be returned directly in Solidity.
     */
    function getEncodedPreset(
        bytes32 presetId
    ) external view virtual returns (bytes memory);

    /**
     * @notice Returns the Actual struct based on the input ID.
     */
    function actuals(
        uint256 actualId
    ) external view virtual returns (bytes32, uint256, uint256, uint256);

    /**
     * @return The basis point precision of this Unlocker.
     */
    function BIPS_PRECISION() external pure virtual returns (uint256);

    /**
     * @notice Calculates the amount of unlocked tokens that have yet to be claimed in an actual unlocking schedule.
     * @dev This is the most complex part of the smart contract. Quite a bit of calculations are performed here.
     * @param actualId The ID of the actual unlocking schedule that we are working with.
     * @return deltaAmountClaimable Amount of tokens claimable right now.
     * @return updatedAmountClaimed New total amount of tokens claimed. This is the sum of all previously claimed tokens and `deltaAmountClaimable`.
     */
    function calculateAmountClaimable(
        uint256 actualId
    )
        public
        view
        virtual
        returns (uint256 deltaAmountClaimable, uint256 updatedAmountClaimed);

    /**
     * @notice Simulates the amount of unlocked tokens that have yet to be claimed at a specific time in an actual unlocking schedule.
     * @dev This is the most complex part of the smart contract. Quite a bit of calculations are performed here.
     * @param actualId The ID of the actual unlocking schedule that we are working with.
     * @param claimTimestampAbsolute The simulated time of claim.
     * @return deltaAmountClaimable Amount of tokens claimable right now.
     * @return updatedAmountClaimed New total amount of tokens claimed. This is the sum of all previously claimed tokens and `deltaAmountClaimable`.
     */
    function simulateAmountClaimable(
        uint256 actualId,
        uint256 claimTimestampAbsolute
    )
        public
        view
        virtual
        returns (uint256 deltaAmountClaimable, uint256 updatedAmountClaimed);
}
