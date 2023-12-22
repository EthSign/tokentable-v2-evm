// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Actual, Preset} from "../interfaces/TokenTableUnlockerV2DataModels.sol";
import {ITokenTableUnlockerV2, IOwnable} from "../interfaces/ITokenTableUnlockerV2.sol";
import {ITTHook} from "../interfaces/ITTHook.sol";
import {ITTFutureTokenV2} from "./TTFutureTokenV2.sol";
import {TTUProjectTokenStorage} from "./TTUProjectTokenStorage.sol";
import {ITTUDeployer} from "../interfaces/ITTUDeployer.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract TokenTableUnlockerV2 is
    OwnableUpgradeable,
    TTUProjectTokenStorage,
    ITokenTableUnlockerV2,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    uint256 public constant override BIPS_PRECISION = 10 ** 4; // down to 0.01%

    ITTUDeployer public override deployer;
    ITTFutureTokenV2 public override futureToken;
    ITTHook public override hook;
    address public override claimingDelegate;
    bool public override isCancelable;
    bool public override isHookable;
    bool public override isWithdrawable;

    mapping(bytes32 => Preset) internal _presets;
    mapping(uint256 => Actual) public actuals;
    mapping(uint256 => uint256)
        public
        override pendingAmountClaimableForCancelledActuals;

    constructor() {
        if (block.chainid != 33133) {
            _disableInitializers();
        }
    }

    function initialize(
        address projectToken,
        address futureToken_,
        address deployer_,
        bool isCancelable_,
        bool isHookable_,
        bool isWithdrawable_
    ) external override initializer {
        __Ownable_init_unchained(_msgSender());
        _initializeSE(projectToken);
        futureToken = ITTFutureTokenV2(futureToken_);
        deployer = ITTUDeployer(deployer_);
        __ReentrancyGuard_init_unchained();
        claimingDelegate = owner();
        isCancelable = isCancelable_;
        isHookable = isHookable_;
        isWithdrawable = isWithdrawable_;
    }

    // solhint-disable-next-line ordering
    function createPresets(
        bytes32[] memory presetIds,
        Preset[] memory presets,
        uint256 batchId
    ) external virtual override onlyOwner {
        for (uint256 i = 0; i < presetIds.length; i++) {
            _createPreset(presetIds[i], presets[i], batchId);
        }
        _callHook(TokenTableUnlockerV2.createPresets.selector, _msgData());
    }

    function createActuals(
        address[] memory recipients,
        Actual[] memory actuals_,
        uint256[] calldata recipientIds,
        uint256 batchId
    ) external virtual override onlyOwner {
        for (uint256 i = 0; i < recipients.length; i++) {
            _createActual(recipients[i], actuals_[i], recipientIds[i], batchId);
        }
        _callHook(this.createActuals.selector, _msgData());
    }

    function withdrawDeposit(
        uint256 amount
    ) external virtual override onlyOwner {
        if (!isWithdrawable) revert NotPermissioned();
        IERC20(getProjectToken()).safeTransfer(_msgSender(), amount);
        emit TokensWithdrawn(_msgSender(), amount);
        _callHook(TokenTableUnlockerV2.withdrawDeposit.selector, _msgData());
    }

    function claim(
        uint256[] calldata actualIds,
        address[] calldata claimTos,
        uint256 batchId
    ) external virtual override nonReentrant {
        for (uint256 i = 0; i < actualIds.length; i++) {
            if (futureToken.ownerOf(actualIds[i]) != _msgSender()) {
                revert NotPermissioned();
            }
            _claim(actualIds[i], claimTos[i], batchId);
        }
        _callHook(TokenTableUnlockerV2.claim.selector, _msgData());
    }

    function delegateClaim(
        uint256[] calldata actualIds,
        uint256 batchId
    ) external virtual override nonReentrant {
        if (_msgSender() != claimingDelegate) revert NotPermissioned();
        for (uint256 i = 0; i < actualIds.length; i++) {
            _claim(actualIds[i], address(0), batchId);
        }
        _callHook(TokenTableUnlockerV2.delegateClaim.selector, _msgData());
    }

    function cancel(
        uint256[] calldata actualIds,
        bool[] calldata shouldWipeClaimableBalance,
        uint256 batchId
    )
        external
        virtual
        override
        onlyOwner
        returns (uint256[] memory pendingAmountClaimables)
    {
        if (!isCancelable) revert NotPermissioned();
        pendingAmountClaimables = new uint256[](actualIds.length);
        for (uint256 i = 0; i < actualIds.length; i++) {
            uint256 actualId = actualIds[i];
            (uint256 deltaAmountClaimable, ) = calculateAmountClaimable(
                actualId
            );
            if (!shouldWipeClaimableBalance[i]) {
                pendingAmountClaimableForCancelledActuals[
                    actualId
                ] += deltaAmountClaimable;
            }
            pendingAmountClaimables[i] = deltaAmountClaimable;
            emit ActualCancelled(
                actualId,
                deltaAmountClaimable,
                shouldWipeClaimableBalance[i],
                batchId
            );
            delete actuals[actualId];
        }
        _callHook(TokenTableUnlockerV2.cancel.selector, _msgData());
    }

    function setHook(ITTHook hook_) external virtual override onlyOwner {
        if (!isHookable) revert NotPermissioned();
        hook = hook_;
        _callHook(TokenTableUnlockerV2.setHook.selector, _msgData());
    }

    function setClaimingDelegate(
        address delegate
    ) external virtual override onlyOwner {
        claimingDelegate = delegate;
        emit ClaimingDelegateSet(delegate);
    }

    function disableCancel() external virtual override onlyOwner {
        isCancelable = false;
        emit CancelDisabled();
        _callHook(TokenTableUnlockerV2.disableCancel.selector, _msgData());
    }

    function disableHook() external virtual override onlyOwner {
        isHookable = false;
        emit HookDisabled();
        _callHook(TokenTableUnlockerV2.disableHook.selector, _msgData());
        hook = ITTHook(address(0));
    }

    function disableWithdraw() external virtual override onlyOwner {
        isWithdrawable = false;
        emit WithdrawDisabled();
        _callHook(TokenTableUnlockerV2.disableWithdraw.selector, _msgData());
    }

    function transferOwnership(
        address newOwner
    ) public override(IOwnable, OwnableUpgradeable) {
        OwnableUpgradeable.transferOwnership(newOwner);
        claimingDelegate = newOwner;
        emit ClaimingDelegateSet(newOwner);
    }

    function renounceOwnership() public override(IOwnable, OwnableUpgradeable) {
        OwnableUpgradeable.renounceOwnership();
    }

    function owner()
        public
        view
        override(IOwnable, OwnableUpgradeable)
        returns (address)
    {
        return OwnableUpgradeable.owner();
    }

    function _createPreset(
        bytes32 presetId,
        Preset memory preset,
        uint256 batchId
    ) internal virtual {
        if (!_presetIsEmpty(_presets[presetId])) revert PresetExists();
        if (!_presetHasValidFormat(preset) || presetId == 0)
            revert InvalidPresetFormat();
        _presets[presetId] = preset;
        emit PresetCreated(presetId, batchId);
    }

    function _createActual(
        address recipient,
        Actual memory actual,
        uint256 recipientId,
        uint256 batchId
    ) internal virtual {
        uint256 actualId = futureToken.safeMint(recipient);
        Preset storage preset = _presets[actual.presetId];
        if (_presetIsEmpty(preset)) revert InvalidPresetFormat();
        if (actual.amountClaimed >= actual.totalAmount)
            revert InvalidSkipAmount();
        actuals[actualId] = actual;
        emit ActualCreated(
            actual.presetId,
            actualId,
            recipient,
            recipientId,
            batchId
        );
    }

    function _claim(
        uint256 actualId,
        address overrideRecipient,
        uint256 batchId
    ) internal virtual {
        uint256 deltaAmountClaimable;
        address recipient;
        if (overrideRecipient == address(0)) {
            recipient = futureToken.ownerOf(actualId);
        } else {
            recipient = overrideRecipient;
        }
        deltaAmountClaimable = pendingAmountClaimableForCancelledActuals[
            actualId
        ];
        if (deltaAmountClaimable != 0) {
            pendingAmountClaimableForCancelledActuals[actualId] = 0;
            IERC20(getProjectToken()).safeTransfer(
                recipient,
                deltaAmountClaimable
            );
        } else {
            deltaAmountClaimable = _updateActualAndSend(actualId, recipient);
        }
        uint256 feesCharged = _chargeFees(deltaAmountClaimable);
        emit TokensClaimed(
            actualId,
            _msgSender(),
            recipient,
            deltaAmountClaimable,
            feesCharged,
            batchId
        );
    }

    function _callHook(
        bytes4 selector,
        bytes calldata context
    ) internal virtual {
        if (address(hook) == address(0)) return;
        hook.didCall(selector, context, _msgSender());
    }

    // solhint-disable-next-line ordering
    function getEncodedPreset(
        bytes32 presetId
    ) external view virtual override returns (bytes memory) {
        Preset memory preset = _presets[presetId];
        return
            abi.encode(
                preset.linearStartTimestampsRelative,
                preset.linearEndTimestampRelative,
                preset.linearBips,
                preset.numOfUnlocksForEachLinear,
                preset.stream
            );
    }

    function version() external pure returns (string memory) {
        return "2.5.2";
    }

    function calculateAmountClaimable(
        uint256 actualId
    )
        public
        view
        virtual
        override
        returns (uint256 deltaAmountClaimable, uint256 updatedAmountClaimed)
    {
        (deltaAmountClaimable, updatedAmountClaimed) = simulateAmountClaimable(
            actualId,
            block.timestamp
        );
    }

    function simulateAmountClaimable(
        uint256 actualId,
        uint256 claimTimestampAbsolute
    )
        public
        view
        virtual
        override
        returns (uint256 deltaAmountClaimable, uint256 updatedAmountClaimed)
    {
        uint256 tokenPrecisionDecimals = 10 ** 5;
        Actual memory actual = actuals[actualId];
        if (actual.presetId == 0) revert PresetDoesNotExist();
        Preset memory preset = _presets[actual.presetId];
        uint256 timePrecisionDecimals = preset.stream ? 10 ** 5 : 1;
        uint256 i;
        uint256 latestIncompleteLinearIndex;
        if (claimTimestampAbsolute < actual.startTimestampAbsolute)
            return (0, actual.amountClaimed);
        uint256 claimTimestampRelative = claimTimestampAbsolute -
            actual.startTimestampAbsolute;
        for (i = 0; i < preset.linearStartTimestampsRelative.length; i++) {
            if (
                preset.linearStartTimestampsRelative[i] <=
                claimTimestampRelative
            ) {
                latestIncompleteLinearIndex = i;
            } else {
                break;
            }
        }
        // 1. calculate completed linear index claimables in bips
        for (i = 0; i < latestIncompleteLinearIndex; i++) {
            updatedAmountClaimed +=
                preset.linearBips[i] *
                tokenPrecisionDecimals;
        }
        // 2. calculate incomplete linear index claimable in bips
        uint256 latestIncompleteLinearDuration = 0;
        if (
            latestIncompleteLinearIndex ==
            preset.linearStartTimestampsRelative.length - 1
        ) {
            latestIncompleteLinearDuration =
                preset.linearEndTimestampRelative -
                preset.linearStartTimestampsRelative[
                    preset.linearStartTimestampsRelative.length - 1
                ];
        } else {
            latestIncompleteLinearDuration =
                preset.linearStartTimestampsRelative[
                    latestIncompleteLinearIndex + 1
                ] -
                preset.linearStartTimestampsRelative[
                    latestIncompleteLinearIndex
                ];
        }
        if (latestIncompleteLinearDuration == 0)
            latestIncompleteLinearDuration = 1;
        uint256 latestIncompleteLinearIntervalForEachUnlock = latestIncompleteLinearDuration /
                preset.numOfUnlocksForEachLinear[latestIncompleteLinearIndex];
        uint256 latestIncompleteLinearClaimableTimestampRelative = claimTimestampRelative -
                preset.linearStartTimestampsRelative[
                    latestIncompleteLinearIndex
                ];
        uint256 numOfClaimableUnlocksInIncompleteLinear = (latestIncompleteLinearClaimableTimestampRelative *
                timePrecisionDecimals) /
                latestIncompleteLinearIntervalForEachUnlock;
        updatedAmountClaimed +=
            (preset.linearBips[latestIncompleteLinearIndex] *
                tokenPrecisionDecimals *
                numOfClaimableUnlocksInIncompleteLinear) /
            preset.numOfUnlocksForEachLinear[latestIncompleteLinearIndex] /
            timePrecisionDecimals;
        updatedAmountClaimed =
            (updatedAmountClaimed * actual.totalAmount) /
            BIPS_PRECISION /
            tokenPrecisionDecimals;
        if (updatedAmountClaimed > actual.totalAmount) {
            updatedAmountClaimed = actual.totalAmount;
        }
        if (actual.amountClaimed > updatedAmountClaimed) {
            deltaAmountClaimable = 0;
        } else {
            deltaAmountClaimable = updatedAmountClaimed - actual.amountClaimed;
        }
    }

    function _updateActualAndSend(
        uint256 actualId,
        address recipient
    ) internal returns (uint256 deltaAmountClaimable_) {
        (
            uint256 deltaAmountClaimable,
            uint256 updatedAmountClaimed
        ) = calculateAmountClaimable(actualId);
        Actual storage actual = actuals[actualId];
        actual.amountClaimed = updatedAmountClaimed;
        IERC20(getProjectToken()).safeTransfer(recipient, deltaAmountClaimable);
        deltaAmountClaimable_ = deltaAmountClaimable;
    }

    function _chargeFees(
        uint256 amount
    ) internal returns (uint256 feesCollected) {
        if (
            address(deployer) != address(0) &&
            address(deployer.feeCollector()) != address(0)
        ) {
            feesCollected = deployer.feeCollector().getFee(
                address(this),
                amount
            );
            if (feesCollected > 0) {
                IERC20(getProjectToken()).safeTransfer(
                    deployer.feeCollector().owner(),
                    feesCollected
                );
            }
        }
    }

    function _presetIsEmpty(
        Preset storage preset
    ) internal view returns (bool) {
        return
            preset.linearBips.length *
                preset.linearStartTimestampsRelative.length *
                preset.numOfUnlocksForEachLinear.length *
                preset.linearEndTimestampRelative ==
            0;
    }

    function _presetHasValidFormat(
        Preset memory preset
    ) internal pure returns (bool) {
        uint256 total;
        for (uint256 i = 0; i < preset.linearBips.length; i++) {
            total += preset.linearBips[i];
        }
        return
            (total == BIPS_PRECISION) &&
            (preset.linearBips.length ==
                preset.linearStartTimestampsRelative.length) &&
            (preset.linearStartTimestampsRelative[
                preset.linearStartTimestampsRelative.length - 1
            ] < preset.linearEndTimestampRelative) &&
            (preset.numOfUnlocksForEachLinear.length ==
                preset.linearStartTimestampsRelative.length);
    }
}
