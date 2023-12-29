// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {TTFutureTokenV2} from "../../TTFutureTokenV2.sol";
import {ITokenTableUnlockerV2} from "../../../interfaces/ITokenTableUnlockerV2.sol";
import {CustomERC2771Context} from "../../../libraries/CustomERC2771Context.sol";

// solhint-disable var-name-mixedcase
contract TTFTV2Gasless is TTFutureTokenV2, CustomERC2771Context {
    function setTrustedForwarder(address forwarder) public virtual override {
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        if (
            _msgSenderERC721A() !=
            ITokenTableUnlockerV2($.authorizedMinter).owner()
        ) revert NotPermissioned();
        super.setTrustedForwarder(forwarder);
    }

    function _msgSenderERC721A()
        internal
        view
        virtual
        override
        returns (address)
    {
        return _msgSender();
    }
}
