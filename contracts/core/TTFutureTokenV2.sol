// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {ITTFutureTokenV2} from "../interfaces/ITTFutureTokenV2.sol";
import {IERC721AUpgradeable} from "erc721a-upgradeable/contracts/interfaces/IERC721AQueryableUpgradeable.sol";
import {ERC721AQueryableUpgradeable, ERC721AUpgradeable} from "erc721a-upgradeable/contracts/extensions/ERC721AQueryableUpgradeable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ITokenTableUnlockerV2} from "../interfaces/ITokenTableUnlockerV2.sol";

/**
 * @title TTFutureTokenV2
 * @author Jack Xu @ EthSign
 * @dev This is a redemption NFT minted to the stakeholder whenever an actual
 * unlocking schedule is created by a founder. The holder of a future token
 * can use it to claim unlocked tokens. A single instance of future token
 * corresponds to a single instance of unlocker. This token is transferrable.
 * The ID of this NFT is the ID of the actual unlocking schedule. The current
 * claimable amount can be determined by calling
 * TokenTableUnlockerV2.calculateAmountClaimable(uint256 actualId)
 */
contract TTFutureTokenV2 is ITTFutureTokenV2, ERC721AQueryableUpgradeable {
    address public authorizedMinter;
    bool public allowTransfer;

    error Unauthorized();

    constructor() {
        _dummyInitialize(); // This will cause test cases to fail, comment when unit testing
    }

    function _dummyInitialize() internal initializerERC721A {}

    function initialize(
        address projectToken,
        bool allowTransfer_
    ) external override initializerERC721A {
        __ERC721A_init_unchained(
            string.concat("Future ", IERC20Metadata(projectToken).name()),
            string.concat("FT-", IERC20Metadata(projectToken).symbol())
        );
        allowTransfer = allowTransfer_;
    }

    /**
     * @notice Sets who is authorized to mint future tokens.
     * @dev This function can only be called once. It is called automatically
     * when deployed using TTUDeployer. The authorized minter is usually the
     * unlocker contract.
     */
    // solhint-disable-next-line ordering
    function setAuthorizedMinterSingleUse(
        address authorizedMinter_
    ) external override {
        if (authorizedMinter != address(0)) revert Unauthorized();
        authorizedMinter = authorizedMinter_;
    }

    /**
     * @notice Mints a future token to an address.
     * @dev This function can only be called by the authorized minter. A future
     * token with tokenId == actualId is minted.
     */
    function safeMint(address to) external override returns (uint256 tokenId) {
        if (msg.sender != authorizedMinter) revert Unauthorized();
        tokenId = _nextTokenId();
        _safeMint(to, 1);
    }

    /**
     * @dev Add a transfer lock
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable virtual override(ERC721AUpgradeable, IERC721AUpgradeable) {
        if (!allowTransfer) revert Unauthorized();
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Add a transfer lock
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public payable virtual override(ERC721AUpgradeable, IERC721AUpgradeable) {
        if (!allowTransfer) revert Unauthorized();
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    /**
     * @notice Returns claim info for a given tokenId/actualId
     * @dev We assume the authorized minter is an instance of TTUV2.
     * @param tokenId The actual ID created in TTUV2.
     * @return deltaAmountClaimable The amount of tokens claimable as of now.
     * @return amountAlreadyClaimed The amount of tokens claimed as of now.
     */
    function getClaimInfo(
        uint256 tokenId
    )
        external
        view
        override
        returns (
            uint256 deltaAmountClaimable,
            uint256 amountAlreadyClaimed,
            bool isCancelable
        )
    {
        (
            uint256 deltaAmountClaimable_,
            uint256 updatedAmountClaimed_
        ) = ITokenTableUnlockerV2(authorizedMinter).calculateAmountClaimable(
                tokenId
            );
        deltaAmountClaimable = deltaAmountClaimable_;
        amountAlreadyClaimed = updatedAmountClaimed_ - deltaAmountClaimable_;
        isCancelable = ITokenTableUnlockerV2(authorizedMinter).isCancelable();
    }
}