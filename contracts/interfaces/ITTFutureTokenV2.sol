// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IERC721AQueryableUpgradeable} from "erc721a-upgradeable/contracts/interfaces/IERC721AQueryableUpgradeable.sol";
import {IVersionable} from "./IVersionable.sol";

interface ITTFutureTokenV2 is IERC721AQueryableUpgradeable, IVersionable {
    event DidSetBaseURI(string prevURI, string newURI);

    error Unauthorized();

    function initialize(address projectToken, bool allowTransfer_) external;

    function setAuthorizedMinterSingleUse(address authorizedMinter_) external;

    function safeMint(address to) external returns (uint256 tokenId);

    function setURI(string calldata uri) external;

    function getClaimInfo(
        uint256 tokenId
    )
        external
        view
        returns (
            uint256 deltaAmountClaimable,
            uint256 amountAlreadyClaimed,
            bool isCancelable
        );
}
