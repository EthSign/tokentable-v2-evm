// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {IERC721AQueryableUpgradeable} from "erc721a-upgradeable/contracts/interfaces/IERC721AQueryableUpgradeable.sol";

interface ITTFutureTokenV2 is IERC721AQueryableUpgradeable {
    function initialize(address projectToken, bool allowTransfer_) external;

    function setAuthorizedMinterSingleUse(address authorizedMinter_) external;

    function safeMint(address to) external returns (uint256 tokenId);

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
