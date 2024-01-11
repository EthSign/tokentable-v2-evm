// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721AQueryableUpgradeable} from "erc721a-upgradeable/contracts/interfaces/IERC721AQueryableUpgradeable.sol";
import {IVersionable} from "./IVersionable.sol";

/**
 * @title ITTFutureTokenV2
 * @author Jack Xu @ EthSign
 * @dev The lightweight interface for TTFutureTokenV2(.5.x), which handles unlocking schedule ownership for TokenTable.
 */
interface ITTFutureTokenV2 is IERC721AQueryableUpgradeable, IVersionable {
    event DidSetBaseURI(string newURI);

    /**
     * @dev 0x7f63bd0f
     */
    error NotPermissioned();

    /**
     * @dev This contract should be deployed with `TTUDeployerLite`, which calls this function with the correct parameters.
     * @param projectToken The address of the token that the founder intends to unlock and distribute.
     * @param isTransferable If the FutureTokens (aka schedules) can be transfered once minted.
     */
    function initialize(address projectToken, bool isTransferable) external;

    /**
     * @notice This contract should be deployed with `TTUDeployerLite`, which calls this function with the correct parameters.
     * @dev This function can only be called once.
     * @param authorizedMinter_ The address which is authorized to mint new FutureTokens. This is set to the corresponding Unlocker in the deployer.
     */
    function setAuthorizedMinterSingleUse(address authorizedMinter_) external;

    /**
     * @notice Safely mints a new FutureToken to the specified address.
     * @dev This function can only be called by the authorized minter.
     * @param to The recipient of the new FutureToken.
     * @return tokenId The minted token ID (aka actual ID or schedule ID).
     */
    function safeMint(address to) external returns (uint256 tokenId);

    /**
     * @notice Updates the base URI.
     * @dev This function can only be called by the owner of the authorized minter, which is usually the founder.
     * @param uri The new base URI.
     */
    function setURI(string calldata uri) external;

    /**
     * @notice Gets information regarding the unlocking schedule associated with this FutureToken.
     * @param tokenId The actual ID or schedule ID.
     * @return deltaAmountClaimable The amount of unlocked and unclaimed funds currently eligible to be claimed by the owner of the given ID.
     * @return amountAlreadyClaimed The amount of unlocked and claimed funds of the given ID.
     * @return isCancelable If the schedule associated with this ID can be canceled by the founder.
     */
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
