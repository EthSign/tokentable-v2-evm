// SPDX-License-Identifier: AGPL v3
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {TokenTableUnlockerV2} from "../../TokenTableUnlockerV2.sol";
import {CustomERC2771Context} from "../../../libraries/CustomERC2771Context.sol";

contract TTUV2Gasless is TokenTableUnlockerV2, CustomERC2771Context {
    function setTrustedForwarder(
        address forwarder
    ) public virtual override onlyOwner {
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
