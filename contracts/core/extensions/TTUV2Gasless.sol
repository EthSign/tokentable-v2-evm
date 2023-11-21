// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {TokenTableUnlockerV2} from "../TokenTableUnlockerV2.sol";
import {CustomERC2771Context} from "../../libraries/CustomERC2771Context.sol";

contract TTUV2Gasless is TokenTableUnlockerV2, CustomERC2771Context {
    function setTrustedForwarder(address forwarder) public virtual override {
        _checkAccessControl(
            bytes4(keccak256("setTrustedForwarder(address)")),
            abi.encode(forwarder),
            _msgSender(),
            true
        );
        super.setTrustedForwarder(forwarder);
    }

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, CustomERC2771Context)
        returns (address sender)
    {
        return CustomERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, CustomERC2771Context)
        returns (bytes calldata)
    {
        return CustomERC2771Context._msgData();
    }
}
