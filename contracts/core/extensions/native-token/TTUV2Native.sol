// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {TokenTableUnlockerV2} from "../../TokenTableUnlockerV2.sol";
import {Actual} from "../../../interfaces/TokenTableUnlockerV2DataModels.sol";

// solhint-disable var-name-mixedcase
contract TTUV2Native is TokenTableUnlockerV2 {
    event DepositReceived(address from, uint256 amount);

    receive() external payable {
        emit DepositReceived(_msgSender(), msg.value);
    }

    function withdrawDeposit(
        uint256 amount,
        bytes calldata
    ) external virtual override onlyOwner {
        TokenTableUnlockerV2Storage
            storage $ = _getTokenTableUnlockerV2Storage();
        if (!$.isWithdrawable) revert NotPermissioned();
        //IERC20(getProjectToken()).safeTransfer(_msgSender(), amount);
        (bool sent, bytes memory data) = payable(_msgSender()).call{
            value: amount
        }("");
        require(sent, string(data));
        emit TokensWithdrawn(_msgSender(), amount);
        _callHook(_msgData());
    }

    function _claim(
        uint256 actualId,
        address overrideRecipient,
        uint256 batchId
    ) internal virtual override {
        TokenTableUnlockerV2Storage
            storage $ = _getTokenTableUnlockerV2Storage();
        uint256 deltaAmountClaimable;
        address recipient;
        if (overrideRecipient == address(0)) {
            recipient = $.futureToken.ownerOf(actualId);
        } else {
            recipient = overrideRecipient;
        }
        deltaAmountClaimable = $.pendingAmountClaimableForCancelledActuals[
            actualId
        ];
        if (deltaAmountClaimable != 0) {
            $.pendingAmountClaimableForCancelledActuals[actualId] = 0;
            // IERC20(getProjectToken()).safeTransfer(
            //     recipient,
            //     deltaAmountClaimable
            // );
            (bool sent, bytes memory data) = payable(recipient).call{
                value: deltaAmountClaimable
            }("");
            require(sent, string(data));
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

    function _updateActualAndSend(
        uint256 actualId,
        address recipient
    ) internal virtual override returns (uint256 deltaAmountClaimable_) {
        TokenTableUnlockerV2Storage
            storage $ = _getTokenTableUnlockerV2Storage();
        (
            uint256 deltaAmountClaimable,
            uint256 updatedAmountClaimed
        ) = calculateAmountClaimable(actualId);
        Actual storage actual = $.actuals[actualId];
        actual.amountClaimed = updatedAmountClaimed;
        // IERC20(getProjectToken()).safeTransfer(recipient, deltaAmountClaimable);
        (bool sent, bytes memory data) = payable(recipient).call{
            value: deltaAmountClaimable
        }("");
        require(sent, string(data));
        deltaAmountClaimable_ = deltaAmountClaimable;
    }

    function _chargeFees(
        uint256
    ) internal virtual override returns (uint256 feesCollected) {
        // if (
        //     address(deployer) != address(0) &&
        //     address(deployer.feeCollector()) != address(0)
        // ) {
        //     feesCollected = deployer.feeCollector().getFee(
        //         address(this),
        //         amount
        //     );
        //     if (feesCollected > 0) {
        //         IERC20(getProjectToken()).safeTransfer(
        //             deployer.feeCollector().owner(),
        //             feesCollected
        //         );
        //     }
        // }
        return 0;
    }
}
