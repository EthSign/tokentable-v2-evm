// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IOwnable} from "./IOwnable.sol";
import {IVersionable} from "./IVersionable.sol";

/**
 * @title ITokenTableUnlockerV2
 * @author Jack Xu @ EthSign
 * @dev The lightweight interface for TokenTableUnlockerV2, which handles token
 * unlocking and distribution for TokenTable.
 */
abstract contract ITokenTableUnlockerV2 is IOwnable, IVersionable {
    event PresetCreated(bytes32 presetId);
    event ActualCreated(bytes32 presetId, uint256 actualId);
    event ActualCreatedBatch(uint256 actualId, uint256 batchId);
    event TokensDeposited(uint256 actualId, uint256 amount);
    event TokensClaimed(
        uint256 actualId,
        address caller,
        address to,
        uint256 amount
    );
    event TokensWithdrawn(uint256 actualId, address by, uint256 amount);
    event ActualCancelled(
        uint256 actualId,
        uint256 amountUnlockedLeftover,
        uint256 amountRefunded,
        address refundFounderAddress
    );

    error InvalidPresetFormat(); // 0x0ef8e8dc
    error PresetExists(); // 0x7cbb15b4
    error PresetDoesNotExist(); // 0xbd88ff7b
    error InvalidSkipAmount(); // 0x78c0fc43
    error InsufficientDeposit(
        uint256 deltaAmountClaimable,
        uint256 amountDeposited
    ); // 0x25c3f46e
    error NotPermissioned(); // 0x7f63bd0f

    /**
     * @dev Exposing the initializer.
     */
    function initialize(
        address projectToken,
        address futureToken_,
        address deployer_
    ) external virtual;

    /**
     * @notice Creates an unlocking schedule preset template.
     * @dev Emits: PresetCreated.
     * - Only callable by the owner if no access control delegate is set. If
     * delegate is set, access by anyone other than the owner depends on the
     * return value of the delegate.
     * @param presetId The ID of the preset we are trying to create. This is
     * determined off-chain and it can be anything that doesn't exist yet.
     * @param linearStartTimestampsRelative The relative start timestamps of
     * linear periods.
     * @param linearEndTimestampRelative The relative end timestamp of the
     * entire linear unlocking schedule.
     * @param linearBips Basis points (percentage of the total amount unlocked)
     * for each linear period. This must add up to BIPS_PRECISION.
     * @param numOfUnlocksForEachLinear The number of unlocks for each linear
     * unlocking period. The minimum value is 1 (unchecked).
     */
    function createPreset(
        bytes32 presetId,
        uint256[] calldata linearStartTimestampsRelative,
        uint256 linearEndTimestampRelative,
        uint256[] calldata linearBips,
        uint256[] calldata numOfUnlocksForEachLinear
    ) external virtual;

    function batchCreatePreset(
        bytes32[] calldata presetId,
        uint256[][] calldata linearStartTimestampsRelative,
        uint256[] calldata linearEndTimestampRelative,
        uint256[][] calldata linearBips,
        uint256[][] memory numOfUnlocksForEachLinear
    ) external virtual;

    /**
     * @notice Creates an actual unlocking schedule based on a preset.
     * @dev Emits: ActualCreated, TokensDeposited (only if amountDepositingNow
     * > 0).
     * - A FutureToken is minted in the process w/ tokenId == actualId;
     * - If amountDepositingNow > 0, the caller must call approve() on the
     * project token first so safeTransfer() does not revert
     * - There is no minimum deposit
     * - Only callable by the owner if no access control delegate is set. If
     * delegate is set, access by anyone other than the owner depends on the
     * return value of the delegate.
     * @param recipient The address of the stakeholder. A FutureToken will be
     * minted to that address.
     * @param presetId The ID of the preset we are trying to create. This is
     * determined off-chain and it can be anything that doesn't exist yet.
     * @param startTimestampAbsolute When the unlocking schedule should start
     * in UNIX epoch timestamp (seconds). Cannot be in the past.
     * @param amountSkipped If the project is being transferred into TokenTable
     * from a different platform, we can skip over what's already been unlocked
     * to keep the progress consistent.
     * @param totalAmount The total amount of tokens to be unlocked.
     * @param amountDepositingNow You can deposit some amount of tokens when
     * creating the actual schedule for convenience. If the amount deposited is
     * insufficient when the stakeholder attempts to claim, the transaction
     * will revert.
     */
    function createActual(
        address recipient,
        bytes32 presetId,
        uint256 startTimestampAbsolute,
        uint256 amountSkipped,
        uint256 totalAmount,
        uint256 amountDepositingNow
    ) external virtual;

    /**
     * @notice Batches the deposit logic.
     */
    function batchCreateActual(
        address[] calldata recipient,
        bytes32[] calldata presetId,
        uint256[] calldata startTimestampAbsolute,
        uint256[] calldata amountSkipped,
        uint256[] calldata totalAmount,
        uint256[] memory amountDepositingNow
    ) external virtual;

    /**
     * @notice Batches the deposit logic.
     * @dev `batchId` is used by the frontend.
     * It is not stored and is emitted as an event.
     */
    function batchCreateActual(
        address[] calldata recipient,
        bytes32[] calldata presetId,
        uint256[] calldata startTimestampAbsolute,
        uint256[] calldata amountSkipped,
        uint256[] calldata totalAmount,
        uint256[] memory amountDepositingNow,
        uint256 batchId
    ) external virtual;

    /**
     * @notice Makes a deposit into an actual unlocking schedule.
     * @dev Emits: TokensDeposited.
     * - The caller must call approve() on the project token first so
     * safeTransfer() does not revert.
     * - There is no minimum deposit.
     * - Only callable by the owner if no access control delegate is set. If
     * delegate is set, access by anyone other than the owner depends on the
     * return value of the delegate.
     * @param actualId The ID of the actual unlocking schedule that we are
     * intending to deposit into.
     * @param amount The amount of project tokens to be deposited.
     */
    function deposit(uint256 actualId, uint256 amount) external virtual;

    function batchDeposit(
        uint256[] calldata actualId,
        uint256[] calldata amount
    ) external virtual;

    /**
     * @notice Withdraws existing locked deposit from an actual schedule.
     * @dev Emits: TokensWithdrawn.
     * - Only callable by the owner if no access control delegate is set. If
     * delegate is set, access by anyone other than the owner depends on the
     * return value of the delegate.
     * @param actualId The ID of the actual unlocking schedule that we are
     * intending to withdraw from.
     * @param amount The amount of project tokens to be withdrawn.
     */
    function withdrawDeposit(uint256 actualId, uint256 amount) external virtual;

    /**
     * @notice Claims claimable tokens for the specified actualId. If the
     * caller is the owner of the actualId or has permission, then the
     * tokens can be claimed to a different address (as specified in args)
     * @dev Emits: TokensClaimed.
     * - Only callable by the owner of the FutureToken if no access control
     * delegate is set. If delegate is set, access by anyone other than the
     * FutureToken owner depends on the return value of the delegate.
     * @param actualId The ID of the actual unlocking schedule that we are
     * intending to claim from.
     * @param overrideRecipient If we want to send the claimed tokens to an
     * address other than the owner of the FutureToken. This MUST pass through
     * access control, otherwise it will revert. If we want to send the claimed
     * tokens to the owner of the FutureToken (default behavior), pass in
     * `ethers.constants.AddressZero`.
     */
    function claim(
        uint256 actualId,
        address overrideRecipient
    ) external virtual;

    function batchClaim(
        uint256[] calldata actualId,
        address[] calldata overrideRecipient
    ) external virtual;

    /**
     * @notice Claims claimable tokens for the specified CANCELLED actualId. If
     * the caller is the owner of the actualId or has permission, then the
     * tokens can be claimed to a different address (as specified in args)
     * @dev Emits: TokensClaimed.
     * - Only callable by the owner of the FutureToken if no access control
     * delegate is set. If delegate is set, access by anyone other than the
     * FutureToken owner depends on the return value of the delegate.
     * @param actualId The ID of the actual unlocking schedule that we are
     * intending to claim from.
     * @param overrideRecipient If we want to send the claimed tokens to an
     * address other than the owner of the FutureToken. This MUST pass through
     * access control, otherwise it will revert. If we want to send the claimed
     * tokens to the owner of the FutureToken (default behavior), pass in
     * `ethers.constants.AddressZero`.
     */
    function claimCancelledActual(
        uint256 actualId,
        address overrideRecipient
    ) external virtual;

    /**
     * @notice Cancels an actual unlocking schedule effective immediately.
     * Tokens not yet claimed but already unlocked will be tallied.
     * @dev Emits: ActualCancelled.
     * - Only callable by the owner if no access control delegate is set. If
     * delegate is set, access by anyone other than the owner depends on the
     * return value of the delegate.
     * @param actualId The ID of the actual unlocking schedule that we are
     * intending to cancel.
     * @param refundFounderAddress The address that the locked tokens will
     * be sent to. This does not have to be a founder's address. Using the zero
     * address means withdraw to sender's address.
     */
    function cancel(
        uint256 actualId,
        address refundFounderAddress
    ) external virtual returns (uint256 amountClaimed, uint256 amountRefunded);

    /**
     * @notice Sets the access control delegate used to control claim behavior.
     * @dev Only callable by the owner.
     */
    function setAccessControlDelegate(
        address accessControlDelegate_
    ) external virtual;

    /**
     * @notice Sets the hook contract.
     * @dev Only callable by the owner.
     */
    function setHook(address hook) external virtual;

    /**
     * @notice Permanently disables the cancel() function.
     */
    function disableCancel() external virtual;

    /**
     * @notice Permanently disables the access control delegate.
     */
    function disableAccessControlDelegate() external virtual;

    /**
     * @notice Permanently disables the hook.
     */
    function disableHook() external virtual;

    /**
     * @dev Exposes the public variable.
     */
    function isCancelable() external view virtual returns (bool);

    /**
     * @dev Exposes the public variable.
     */
    function isAccessControllable() external view virtual returns (bool);

    /**
     * @dev Exposes the public variable.
     */
    function isHookable() external view virtual returns (bool);

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
