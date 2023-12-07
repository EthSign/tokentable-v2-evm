// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IOwnable} from "./IOwnable.sol";
import {IVersionable} from "./IVersionable.sol";
import {Preset, Actual} from "./TokenTableUnlockerV2DataModels.sol";

/**
 * @title ITokenTableUnlockerV2
 * @author Jack Xu @ EthSign
 * @dev The lightweight interface for TokenTableUnlockerV2, which handles token
 * unlocking and distribution for TokenTable. Version 2.5.x
 */
abstract contract ITokenTableUnlockerV2 is IOwnable, IVersionable {
    event PresetCreated(bytes32 presetId, uint256 batchId);
    event ActualCreated(bytes32 presetId, uint256 actualId, uint256 batchId);
    event ActualCancelled(
        uint256 actualId,
        uint256 pendingAmountClaimable,
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
    event CancelDisabled();
    event HookDisabled();
    event WithdrawDisabled();

    error InvalidPresetFormat(); // 0x0ef8e8dc
    error PresetExists(); // 0x7cbb15b4
    error PresetDoesNotExist(); // 0xbd88ff7b
    error InvalidSkipAmount(); // 0x78c0fc43
    error NotPermissioned(); // 0x7f63bd0f

    /**
     * @dev Exposing the initializer.
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
     */
    function createPresets(
        bytes32[] calldata presetIds,
        Preset[] memory presets,
        uint256 batchId
    ) external virtual;

    /**
     * @notice Creates an actual unlocking schedule based on a preset.
     * @dev Emits `ActualCreated` A FutureToken is minted in the process w/
     * `tokenId == actualId`. `batchId` is emitted for the frontend.
     */
    function createActuals(
        address[] calldata recipients,
        Actual[] memory actuals,
        uint256 batchId
    ) external virtual;

    /**
     * @notice Withdraws existing deposit from the contract.
     * @dev Emits `TokensWithdrawn`. Only callable by the owner.
     */
    function withdrawDeposit(uint256 amount) external virtual;

    /**
     * @notice Claims claimable tokens for the specified actualId.
     * @dev Emits `TokensClaimed`. Only callable by the FutureToken owner.
     * @param actualIds The IDs of the actual unlocking schedule that we are
     * intending to claim from.
     * @param claimTos If we want to send the claimed tokens to an
     * address other than the owner of the FutureToken. If we want to send the
     * claimed tokens to the owner of the FutureToken (default behavior), pass
     * in `ethers.constants.AddressZero`.
     */
    function claim(
        uint256[] calldata actualIds,
        address[] calldata claimTos,
        uint256 batchId
    ) external virtual;

    /**
     * @notice Cancels an actual unlocking schedule effective immediately.
     * Tokens not yet claimed but already unlocked will be tallied.
     * @dev Emits `ActualCancelled`. Only callable by the owner.
     * @param actualIds The ID of the actual unlocking schedule that we want
     * to cancel.
     * @return pendingAmountClaimables Number of tokens eligible to be claimed
     * by the affected stakeholders at the moment of cancellation.
     */
    function cancel(
        uint256[] calldata actualIds,
        uint256 batchId
    ) external virtual returns (uint256[] memory pendingAmountClaimables);

    /**
     * @notice Sets the hook contract.
     * @dev Only callable by the owner.
     */
    function setHook(address hook) external virtual;

    /**
     * @notice Permanently disables the cancel() function.
     * @dev Only callable by the owner.
     */
    function disableCancel() external virtual;

    /**
     * @notice Permanently disables the hook.
     * @dev Only callable by the owner.
     */
    function disableHook() external virtual;

    /**
     * @notice Permanently disables the owner from withdrawing deposits.
     * @dev Only callable by the owner.
     */
    function disableWithdraw() external virtual;

    /**
     * @dev Exposes the public variable.
     */
    function isCancelable() external view virtual returns (bool);

    /**
     * @dev Exposes the public variable.
     */
    function isHookable() external view virtual returns (bool);

    /**
     * @dev Exposes the public variable.
     */
    function isWithdrawable() external view virtual returns (bool);

    /**
     * @notice Returns an ABI-encoded preset, as nested objects cannot be
     * returned directly in Solidity.
     * @dev To decode in JS, use:
     *  ethers.utils.defaultAbiCoder.decode(
     *      ['uint256[]', 'uint256', 'uint256[]', 'uint256[]'],
     *      encodedPreset
     *  )
     * @param presetId The ID of the preset we are trying to read.
     */
    function getEncodedPreset(
        bytes32 presetId
    ) external view virtual returns (bytes memory);

    /**
     * @notice Calculates the amount of unlocked tokens that have yet to be
     * claimed in an actual unlocking schedule.
     * @dev This is the most complex part of the smart contract. Quite a bit of
     * calculations are performed here.
     * @param actualId The ID of the actual unlocking schedule that we are
     * working with.
     * @return deltaAmountClaimable Amount of tokens claimable right now.
     * @return updatedAmountClaimed New total amount of tokens claimed. This is
     * the sum of all previously claimed tokens and deltaAmountClaimable.
     */
    function calculateAmountClaimable(
        uint256 actualId
    )
        public
        view
        virtual
        returns (uint256 deltaAmountClaimable, uint256 updatedAmountClaimed);
}
