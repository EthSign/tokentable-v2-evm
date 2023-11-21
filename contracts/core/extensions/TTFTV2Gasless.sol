// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {TTFutureTokenV2} from "../TTFutureTokenV2.sol";
import {ITokenTableUnlockerV2} from "../../interfaces/ITokenTableUnlockerV2.sol";
import {CustomERC2771Context} from "../../libraries/CustomERC2771Context.sol";

contract TTFTV2Gasless is TTFutureTokenV2, CustomERC2771Context {
    function setTrustedForwarder(address forwarder) public virtual override {
        if (
            _msgSenderERC721A() !=
            ITokenTableUnlockerV2(authorizedMinter).owner()
        ) revert Unauthorized();
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
