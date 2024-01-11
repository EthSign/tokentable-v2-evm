// SPDX-License-Identifier: AGPL v3
pragma solidity ^0.8.20;

import {ITTTrackerTokenV2} from "../interfaces/ITTTrackerTokenV2.sol";
import {TokenTableUnlockerV2} from "./TokenTableUnlockerV2.sol";
import {ITTFutureTokenV2} from "../interfaces/ITTFutureTokenV2.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title TTTrackerTokenV2
 * @author Jack Xu @ EthSign
 * @dev An ERC20 token that represents the number of currently claimable
 * unlocked tokens. This token can be added into the investor's wallet,
 * making it easy for them to check on this information without having to
 * go through TokenTable's website.
 */
// solhint-disable ordering
// solhint-disable no-unused-vars
contract TTTrackerTokenV2 is ITTTrackerTokenV2, IERC20Metadata, Initializable {
    TokenTableUnlockerV2 public ttuInstance;

    constructor() {
        if (block.chainid != 33133) {
            _disableInitializers();
        }
    }

    function initialize(address ttuInstance_) external override initializer {
        ttuInstance = TokenTableUnlockerV2(ttuInstance_);
    }

    function name() external view returns (string memory) {
        return
            string.concat(
                "Tracker ",
                IERC20Metadata(ttuInstance.getProjectToken()).name()
            );
    }

    function symbol() external view returns (string memory) {
        return
            string.concat(
                "T-",
                IERC20Metadata(ttuInstance.getProjectToken()).symbol()
            );
    }

    function decimals() external view returns (uint8) {
        return IERC20Metadata(ttuInstance.getProjectToken()).decimals();
    }

    /**
     * @dev Total number of tokens deposited into the unlocker awaiting claim.
     */
    function totalSupply() external view returns (uint256) {
        return
            IERC20Metadata(ttuInstance.getProjectToken()).balanceOf(
                address(this)
            );
    }

    /**
     * @dev Number of currently claimable tokens of the given address.
     */
    function balanceOf(address account) external view returns (uint256) {
        uint256 amountClaimable;
        ITTFutureTokenV2 nftInstance = ttuInstance.futureToken();
        uint256[] memory tokenIdsOfOwner = nftInstance.tokensOfOwner(account);
        for (uint256 i = 0; i < tokenIdsOfOwner.length; i++) {
            (uint256 deltaAmountClaimable, ) = ttuInstance
                .calculateAmountClaimable(tokenIdsOfOwner[i]);
            amountClaimable += deltaAmountClaimable;
        }
        return amountClaimable;
    }

    /**
     * @dev This operation is not allowed/implemented on purpose.
     */
    function transfer(address, uint256) external pure returns (bool) {
        return false;
    }

    /**
     * @dev This operation is not allowed/implemented on purpose.
     */
    function allowance(address, address) external pure returns (uint256) {
        return 0;
    }

    /**
     * @dev This operation is not allowed/implemented on purpose.
     */
    function approve(address, uint256) external pure returns (bool) {
        return false;
    }

    /**
     * @dev This operation is not allowed/implemented on purpose.
     */
    function transferFrom(
        address,
        address,
        uint256
    ) external pure returns (bool) {
        return false;
    }

    function version() external pure returns (string memory) {
        return "2.5.0";
    }
}
