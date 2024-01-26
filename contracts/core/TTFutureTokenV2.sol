// SPDX-License-Identifier: AGPL v3
pragma solidity ^0.8.20;

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
// solhint-disable var-name-mixedcase
// solhint-disable no-inline-assembly
// solhint-disable const-name-snakecase
// solhint-disable private-vars-leading-underscore
contract TTFutureTokenV2 is ITTFutureTokenV2, ERC721AQueryableUpgradeable {
    /// @custom:storage-location erc7201:ethsign.tokentable.TTFutureTokenV2
    struct TTFutureTokenV2Storage {
        address authorizedMinter;
        bool isTransferable;
        string baseUri;
    }

    // keccak256(abi.encode(uint256(keccak256("ethsign.tokentable.TTFutureTokenV2")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TTFutureTokenV2StorageLocation =
        0xb50f0509372e72ec7790b055b09e294ca3549f94c48d078a7ee9a7b36fac3600;

    function _getTTFutureTokenV2Storage()
        internal
        pure
        returns (TTFutureTokenV2Storage storage $)
    {
        assembly {
            $.slot := TTFutureTokenV2StorageLocation
        }
    }

    // solhint-disable-next-line ordering
    constructor() {
        if (block.chainid != 33133) {
            _dummyInitialize();
        }
    }

    function _dummyInitialize() internal initializerERC721A {}

    // solhint-disable-next-line ordering
    function initialize(
        address projectToken,
        bool isTransferable_
    ) external override initializerERC721A {
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        __ERC721A_init_unchained(
            string.concat("Future ", IERC20Metadata(projectToken).name()),
            string.concat("FT-", IERC20Metadata(projectToken).symbol())
        );
        $.isTransferable = isTransferable_;
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
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        if ($.authorizedMinter != address(0)) revert NotPermissioned();
        $.authorizedMinter = authorizedMinter_;
    }

    /**
     * @notice Mints a future token to an address.
     * @dev This function can only be called by the authorized minter. A future
     * token with tokenId == actualId is minted.
     */
    function safeMint(address to) external override returns (uint256 tokenId) {
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        if (_msgSenderERC721A() != $.authorizedMinter) revert NotPermissioned();
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
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        if (!$.isTransferable) revert NotPermissioned();
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
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        if (!$.isTransferable) revert NotPermissioned();
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    function setURI(string calldata uri) external {
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        if (
            _msgSenderERC721A() !=
            ITokenTableUnlockerV2($.authorizedMinter).owner()
        ) revert NotPermissioned();
        $.baseUri = uri;
        emit DidSetBaseURI(uri);
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
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        (
            uint256 deltaAmountClaimable_,
            uint256 updatedAmountClaimed_
        ) = ITokenTableUnlockerV2($.authorizedMinter).calculateAmountClaimable(
                tokenId
            );
        deltaAmountClaimable = deltaAmountClaimable_;
        amountAlreadyClaimed = updatedAmountClaimed_ - deltaAmountClaimable_;
        isCancelable = ITokenTableUnlockerV2($.authorizedMinter).isCancelable();
    }

    function version() external pure override returns (string memory) {
        return "2.5.5";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        TTFutureTokenV2Storage storage $ = _getTTFutureTokenV2Storage();
        return $.baseUri;
    }
}
