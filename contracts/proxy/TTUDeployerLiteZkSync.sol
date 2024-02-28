// SPDX-License-Identifier: AGPL v3
pragma solidity ^0.8.20;

import {TTUDeployerLite} from "./TTUDeployerLite.sol";
import {ITokenTableUnlockerV2} from "../interfaces/ITokenTableUnlockerV2.sol";
import {ITTFutureTokenV2} from "../interfaces/ITTFutureTokenV2.sol";
import {ITTTrackerTokenV2} from "../interfaces/ITTTrackerTokenV2.sol";
import {TokenTableUnlockerV2} from "../core/TokenTableUnlockerV2.sol";
import {TTFutureTokenV2} from "../core/TTFutureTokenV2.sol";
import {TTTrackerTokenV2} from "../core/TTTrackerTokenV2.sol";

contract TTUDeployerLiteZkSync is TTUDeployerLite {
    function version() external pure virtual override returns (string memory) {
        return "2.5.7-zkSync";
    }

    function _deployClonesAndInitialize(
        address projectToken,
        bool isTransferable,
        bool isCancelable,
        bool isHookable,
        bool isWithdrawable
    )
        internal
        virtual
        override
        returns (
            ITokenTableUnlockerV2 unlocker,
            ITTFutureTokenV2 futureToken,
            ITTTrackerTokenV2 trackerToken
        )
    {
        futureToken = new TTFutureTokenV2();
        futureToken.initialize(projectToken, isTransferable);
        unlocker = new TokenTableUnlockerV2();
        unlocker.initialize(
            projectToken,
            address(futureToken),
            address(this),
            isCancelable,
            isHookable,
            isWithdrawable
        );
        trackerToken = new TTTrackerTokenV2();
        trackerToken.initialize(address(unlocker));
    }
}
