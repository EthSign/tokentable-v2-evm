// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UnlockingScheduleActual, UnlockingSchedulePreset} from "../interfaces/TokenTableUnlockerV2DataModels.sol";
import {ITokenTableUnlockerV2, IOwnable} from "../interfaces/ITokenTableUnlockerV2.sol";
import {ITTAccessControlDelegate} from "../interfaces/ITTAccessControlDelegate.sol";
import {ITTHook} from "../interfaces/ITTHook.sol";
import {ITTFutureTokenV2} from "./TTFutureTokenV2.sol";
import {TTUProjectTokenStorage} from "./TTUProjectTokenStorage.sol";
import {ITTUDeployer} from "../interfaces/ITTUDeployer.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract TokenTableUnlockerV2 is
    OwnableUpgradeable,
    TTUProjectTokenStorage,
    ITokenTableUnlockerV2,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    uint256 public constant BIPS_PRECISION = 10 ** 4; // down to 0.01%

    ITTUDeployer public deployer;
    ITTFutureTokenV2 public futureToken;
    ITTAccessControlDelegate public accessControlDelegate;
    ITTHook public hook;
    bool public override isCancelable;
    bool public override isAccessControllable;
    bool public override isHookable;

    mapping(bytes32 => UnlockingSchedulePreset)
        internal _unlockingSchedulePresets;
    mapping(uint256 => UnlockingScheduleActual) public unlockingScheduleActuals;
    mapping(uint256 => uint256) public amountUnlockedLeftoverForActuals;

    constructor() {
        _disableInitializers(); // This will cause test cases to fail, comment when unit testing
    }

    function initialize(
        address projectToken,
        address futureToken_,
        address deployer_
    ) external override initializer {
        __Ownable_init_unchained();
        _initializeSE(projectToken);
        futureToken = ITTFutureTokenV2(futureToken_);
        deployer = ITTUDeployer(deployer_);
        __ReentrancyGuard_init_unchained();
        isCancelable = true;
        isAccessControllable = true;
        isHookable = true;
    }

    // solhint-disable-next-line ordering
    function createPreset(
        bytes32 presetId,
        uint256[] calldata linearStartTimestampsRelative,
        uint256 linearEndTimestampRelative,
        uint256[] calldata linearBips,
        uint256[] calldata numOfUnlocksForEachLinear
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.createPreset.selector,
            "",
            _msgSender(),
            true
        );
        _createPreset(
            presetId,
            linearStartTimestampsRelative,
            linearEndTimestampRelative,
            linearBips,
            numOfUnlocksForEachLinear
        );
        _callHook(TokenTableUnlockerV2.createPreset.selector, msg.data);
    }

    function batchCreatePreset(
        bytes32[] calldata presetId,
        uint256[][] calldata linearStartTimestampsRelative,
        uint256[] calldata linearEndTimestampRelative,
        uint256[][] calldata linearBips,
        uint256[][] memory numOfUnlocksForEachLinear
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.batchCreatePreset.selector,
            "",
            _msgSender(),
            true
        );
        for (uint256 i = 0; i < presetId.length; i++) {
            _createPreset(
                presetId[i],
                linearStartTimestampsRelative[i],
                linearEndTimestampRelative[i],
                linearBips[i],
                numOfUnlocksForEachLinear[i]
            );
        }
        _callHook(TokenTableUnlockerV2.batchCreatePreset.selector, msg.data);
    }

    function createActual(
        address recipient,
        bytes32 presetId,
        uint256 startTimestampAbsolute,
        uint256 amountSkipped,
        uint256 totalAmount,
        uint256 amountDepositingNow
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.createActual.selector,
            "",
            _msgSender(),
            true
        );
        _createActual(
            recipient,
            presetId,
            startTimestampAbsolute,
            amountSkipped,
            totalAmount,
            amountDepositingNow
        );
        _callHook(TokenTableUnlockerV2.createActual.selector, msg.data);
    }

    function batchCreateActual(
        address[] calldata recipient,
        bytes32[] calldata presetId,
        uint256[] calldata startTimestampAbsolute,
        uint256[] calldata amountSkipped,
        uint256[] calldata totalAmount,
        uint256[] memory amountDepositingNow
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.batchCreateActual.selector,
            "",
            _msgSender(),
            true
        );
        for (uint256 i = 0; i < presetId.length; i++) {
            _createActual(
                recipient[i],
                presetId[i],
                startTimestampAbsolute[i],
                amountSkipped[i],
                totalAmount[i],
                amountDepositingNow[i]
            );
        }
        _callHook(TokenTableUnlockerV2.batchCreateActual.selector, msg.data);
    }

    function deposit(
        uint256 actualId,
        uint256 amount
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.deposit.selector,
            abi.encode(actualId, amount),
            _msgSender(),
            true
        );
        _deposit(actualId, amount);
        _callHook(TokenTableUnlockerV2.deposit.selector, msg.data);
    }

    function batchDeposit(
        uint256[] calldata actualId,
        uint256[] calldata amount
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.batchDeposit.selector,
            abi.encode(actualId, amount),
            _msgSender(),
            true
        );
        for (uint256 i = 0; i < actualId.length; i++) {
            _deposit(actualId[i], amount[i]);
        }
        _callHook(TokenTableUnlockerV2.batchDeposit.selector, msg.data);
    }

    function withdrawDeposit(
        uint256 actualId,
        uint256 amount
    ) external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.withdrawDeposit.selector,
            abi.encode(actualId, amount),
            _msgSender(),
            true
        );
        UnlockingScheduleActual storage actual = unlockingScheduleActuals[
            actualId
        ];
        actual.amountDeposited -= amount;
        IERC20(getProjectToken()).safeTransfer(_msgSender(), amount);
        emit TokensWithdrawn(actualId, _msgSender(), amount);
        _callHook(TokenTableUnlockerV2.withdrawDeposit.selector, msg.data);
    }

    function claim(
        uint256 actualId,
        address overrideRecipient
    ) external virtual override nonReentrant {
        _checkAccessControl(
            TokenTableUnlockerV2.claim.selector,
            abi.encode(actualId, overrideRecipient),
            _msgSender(),
            false
        );
        _claim(actualId, overrideRecipient);
        _callHook(TokenTableUnlockerV2.claim.selector, msg.data);
    }

    function batchClaim(
        uint256[] calldata actualId,
        address[] calldata overrideRecipient
    ) external virtual override nonReentrant {
        _checkAccessControl(
            TokenTableUnlockerV2.batchClaim.selector,
            abi.encode(actualId, overrideRecipient),
            _msgSender(),
            false
        );
        for (uint256 i = 0; i < actualId.length; i++) {
            _claim(actualId[i], overrideRecipient[i]);
        }
        _callHook(TokenTableUnlockerV2.batchClaim.selector, msg.data);
    }

    function claimCancelledActual(
        uint256 actualId,
        address overrideRecipient
    ) external virtual override nonReentrant {
        _checkAccessControl(
            TokenTableUnlockerV2.claimCancelledActual.selector,
            abi.encode(actualId, overrideRecipient),
            _msgSender(),
            false
        );
        address recipient;
        if (overrideRecipient == address(0))
            recipient = futureToken.ownerOf(actualId);
        else recipient = overrideRecipient;
        uint256 amountClaimable = amountUnlockedLeftoverForActuals[actualId];
        amountUnlockedLeftoverForActuals[actualId] = 0;
        IERC20(getProjectToken()).safeTransfer(recipient, amountClaimable);
        emit TokensClaimed(actualId, _msgSender(), recipient, amountClaimable);
        _callHook(TokenTableUnlockerV2.claimCancelledActual.selector, msg.data);
    }

    function cancel(
        uint256 actualId,
        address refundFounderAddress
    )
        external
        virtual
        override
        nonReentrant
        returns (uint256 amountUnlockedLeftover, uint256 amountRefunded)
    {
        if (!isCancelable) revert NotPermissioned();
        _checkAccessControl(
            TokenTableUnlockerV2.cancel.selector,
            abi.encode(actualId, refundFounderAddress),
            _msgSender(),
            true
        );
        (amountUnlockedLeftover, ) = calculateAmountClaimable(actualId);
        amountUnlockedLeftoverForActuals[actualId] += amountUnlockedLeftover;
        UnlockingScheduleActual memory actual = unlockingScheduleActuals[
            actualId
        ];
        if (actual.amountDeposited < amountUnlockedLeftover)
            revert InsufficientDeposit(
                amountUnlockedLeftover,
                actual.amountDeposited
            );
        actual.amountDeposited -= amountUnlockedLeftover;
        amountRefunded = actual.amountDeposited;
        IERC20(getProjectToken()).safeTransfer(
            refundFounderAddress,
            amountRefunded
        );
        emit ActualCancelled(
            actualId,
            amountUnlockedLeftover,
            amountRefunded,
            refundFounderAddress
        );
        delete unlockingScheduleActuals[actualId];
        _callHook(TokenTableUnlockerV2.cancel.selector, msg.data);
    }

    function setAccessControlDelegate(
        address accessControlDelegate_
    ) external virtual override onlyOwner {
        if (!isAccessControllable) revert NotPermissioned();
        accessControlDelegate = ITTAccessControlDelegate(
            accessControlDelegate_
        );
        _callHook(
            TokenTableUnlockerV2.setAccessControlDelegate.selector,
            msg.data
        );
    }

    function setHook(address hook_) external virtual override {
        if (!isHookable) revert NotPermissioned();
        _checkAccessControl(
            TokenTableUnlockerV2.setHook.selector,
            "",
            _msgSender(),
            true
        );
        hook = ITTHook(hook_);
        _callHook(TokenTableUnlockerV2.setHook.selector, msg.data);
    }

    function disableCancel() external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.disableCancel.selector,
            "",
            _msgSender(),
            true
        );
        isCancelable = false;
        _callHook(TokenTableUnlockerV2.disableCancel.selector, msg.data);
    }

    function disableAccessControlDelegate() external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.disableAccessControlDelegate.selector,
            "",
            _msgSender(),
            true
        );
        isAccessControllable = false;
        accessControlDelegate = ITTAccessControlDelegate(address(0));
        _callHook(
            TokenTableUnlockerV2.disableAccessControlDelegate.selector,
            msg.data
        );
    }

    function disableHook() external virtual override {
        _checkAccessControl(
            TokenTableUnlockerV2.disableHook.selector,
            "",
            _msgSender(),
            true
        );
        isHookable = false;
        _callHook(TokenTableUnlockerV2.disableHook.selector, msg.data);
        hook = ITTHook(address(0));
    }

    function transferOwnership(
        address newOwner
    ) public override(IOwnable, OwnableUpgradeable) {
        OwnableUpgradeable.transferOwnership(newOwner);
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
        uint256[] memory linearStartTimestampsRelative,
        uint256 linearEndTimestampRelative,
        uint256[] memory linearBips,
        uint256[] memory numOfUnlocksForEachLinear
    ) internal virtual {
        if (!_presetIsEmpty(_unlockingSchedulePresets[presetId]))
            revert PresetExists();
        UnlockingSchedulePreset memory newPreset = UnlockingSchedulePreset({
            linearStartTimestampsRelative: linearStartTimestampsRelative,
            linearEndTimestampRelative: linearEndTimestampRelative,
            linearBips: linearBips,
            numOfUnlocksForEachLinear: numOfUnlocksForEachLinear
        });
        if (!_presetHasValidFormat(newPreset)) revert InvalidPresetFormat();
        _unlockingSchedulePresets[presetId] = newPreset;
        emit PresetCreated(presetId);
    }

    function _createActual(
        address recipient,
        bytes32 presetId,
        uint256 startTimestampAbsolute,
        uint256 amountSkipped,
        uint256 totalAmount,
        uint256 amountDepositingNow
    ) internal virtual {
        uint256 actualId = futureToken.safeMint(recipient);
        UnlockingScheduleActual storage actual = unlockingScheduleActuals[
            actualId
        ];
        UnlockingSchedulePreset storage preset = _unlockingSchedulePresets[
            presetId
        ];
        if (_presetIsEmpty(preset)) revert InvalidPresetFormat();
        if (amountSkipped >= totalAmount) revert InvalidSkipAmount();
        actual.presetId = presetId;
        actual.startTimestampAbsolute = startTimestampAbsolute;
        actual.amountClaimed = amountSkipped;
        actual.totalAmount = totalAmount;
        emit ActualCreated(presetId, actualId);
        if (amountDepositingNow > 0) {
            actual.amountDeposited = amountDepositingNow;
            IERC20(getProjectToken()).safeTransferFrom(
                _msgSender(),
                address(this),
                amountDepositingNow
            );
            emit TokensDeposited(actualId, amountDepositingNow);
        }
    }

    function _deposit(uint256 actualId, uint256 amount) internal {
        UnlockingScheduleActual storage actual = unlockingScheduleActuals[
            actualId
        ];
        IERC20(getProjectToken()).safeTransferFrom(
            _msgSender(),
            address(this),
            amount
        );
        actual.amountDeposited += amount;
        emit TokensDeposited(actualId, amount);
    }

    function _claim(
        uint256 actualId,
        address overrideRecipient
    ) internal virtual {
        (
            uint256 deltaAmountClaimable,
            address recipient
        ) = _updateActualAndSend(actualId, overrideRecipient);
        emit TokensClaimed(
            actualId,
            _msgSender(),
            recipient,
            deltaAmountClaimable
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
        UnlockingSchedulePreset memory preset = _unlockingSchedulePresets[
            presetId
        ];
        return
            abi.encode(
                preset.linearStartTimestampsRelative,
                preset.linearEndTimestampRelative,
                preset.linearBips,
                preset.numOfUnlocksForEachLinear
            );
    }

    function version() external pure returns (string memory) {
        return "2.0.2";
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
        UnlockingScheduleActual memory actual = unlockingScheduleActuals[
            actualId
        ];
        UnlockingSchedulePreset memory preset = _unlockingSchedulePresets[
            actual.presetId
        ];
        uint256 i;
        uint256 latestIncompleteLinearIndex;
        if (block.timestamp < actual.startTimestampAbsolute)
            return (0, actual.amountClaimed);
        uint256 claimTimestampRelative = block.timestamp -
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
            updatedAmountClaimed += preset.linearBips[i];
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
        uint256 numOfClaimableUnlocksInIncompleteLinear = latestIncompleteLinearClaimableTimestampRelative /
                latestIncompleteLinearIntervalForEachUnlock;
        updatedAmountClaimed +=
            (preset.linearBips[latestIncompleteLinearIndex] *
                numOfClaimableUnlocksInIncompleteLinear) /
            preset.numOfUnlocksForEachLinear[latestIncompleteLinearIndex];
        updatedAmountClaimed =
            (updatedAmountClaimed * actual.totalAmount) /
            BIPS_PRECISION;
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
        address overrideRecipient
    ) internal returns (uint256 deltaAmountClaimable_, address recipient) {
        (
            uint256 deltaAmountClaimable,
            uint256 updatedAmountClaimed
        ) = calculateAmountClaimable(actualId);
        UnlockingScheduleActual storage actual = unlockingScheduleActuals[
            actualId
        ];
        actual.amountClaimed = updatedAmountClaimed;
        if (actual.amountDeposited < deltaAmountClaimable)
            revert InsufficientDeposit(
                deltaAmountClaimable,
                actual.amountDeposited
            );
        actual.amountDeposited -= deltaAmountClaimable;
        if (overrideRecipient == address(0)) {
            recipient = futureToken.ownerOf(actualId);
        } else {
            recipient = overrideRecipient;
        }
        if (address(deployer) != address(0)) {
            uint256 feesCollected = deployer.feeCollector().getFee(
                address(this),
                deltaAmountClaimable
            );
            if (feesCollected > 0) {
                deltaAmountClaimable -= feesCollected;
                IERC20(getProjectToken()).safeTransfer(
                    deployer.feeCollector().owner(),
                    feesCollected
                );
            }
        }
        IERC20(getProjectToken()).safeTransfer(recipient, deltaAmountClaimable);
        deltaAmountClaimable_ = deltaAmountClaimable;
    }

    function _checkAccessControl(
        bytes4 selector,
        bytes memory context,
        address operator,
        bool onlyOwner
    ) internal view {
        if (address(accessControlDelegate) == address(0)) {
            if (
                selector == this.claimCancelledActual.selector ||
                selector == this.claim.selector
            ) {
                (uint256 actualId, ) = abi.decode(context, (uint256, address));
                if (futureToken.ownerOf(actualId) != _msgSender()) {
                    revert NotPermissioned();
                }
            } else if (selector == this.batchClaim.selector) {
                (uint256[] memory actualId, ) = abi.decode(
                    context,
                    (uint256[], uint256[])
                );
                for (uint256 i = 0; i < actualId.length; i++) {
                    if (futureToken.ownerOf(actualId[i]) != _msgSender()) {
                        revert NotPermissioned();
                    }
                }
            }
            if (onlyOwner && _msgSender() == owner()) {
                return;
            } else if (onlyOwner && _msgSender() != owner()) {
                revert NotPermissioned();
            } else {
                return;
            }
        }
        if (
            !accessControlDelegate.hasPermissionToPerform(
                selector,
                context,
                operator
            )
        ) revert NotPermissioned();
    }

    function _presetIsEmpty(
        UnlockingSchedulePreset storage preset
    ) internal view returns (bool) {
        return
            preset.linearBips.length *
                preset.linearStartTimestampsRelative.length *
                preset.numOfUnlocksForEachLinear.length *
                preset.linearEndTimestampRelative ==
            0;
    }

    function _presetHasValidFormat(
        UnlockingSchedulePreset memory preset
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
