// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ITTHook} from "../interfaces/ITTHook.sol";
import {ITokenTableUnlockerV2} from "../interfaces/ITokenTableUnlockerV2.sol";
import {ITTFutureTokenV2} from "../interfaces/ITTFutureTokenV2.sol";
import {KYCData} from "../hooks/KYCHook.sol";

contract MockHook is ITTHook {
    event MockHookDelegateClaim(
        uint256 actualId,
        uint256 batchId,
        string applicantId,
        address applicant
    );

    error KYCFailed();

    function didCall(bytes calldata originalMsgData, address) external {
        bytes4 selector = bytes4(originalMsgData[:4]);
        if (selector == ITokenTableUnlockerV2.delegateClaim.selector) {
            (
                uint256[] memory actualIds,
                uint256 batchId,
                bytes memory extraData
            ) = abi.decode(originalMsgData[4:], (uint256[], uint256, bytes));
            if (actualIds.length != 1) revert KYCFailed(); // The backend will only delegate claim 1 user at a time
            address applicant = ITTFutureTokenV2(
                ITokenTableUnlockerV2(msg.sender).futureToken()
            ).ownerOf(actualIds[0]); // In this case, the caller of Unlocker is the backend, so we need to find the Actual recipient
            KYCData memory kycData = abi.decode(extraData, (KYCData));
            emit MockHookDelegateClaim(
                actualIds[0],
                batchId,
                kycData.applicantId,
                applicant
            );
        }
    }
}
