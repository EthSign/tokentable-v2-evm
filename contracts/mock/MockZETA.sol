// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// solhint-disable ordering
contract MockZETA is IERC20Metadata {
    error Unimplemented();

    function name() external pure returns (string memory) {
        return "ZetaChain";
    }

    function symbol() external pure returns (string memory) {
        return "ZETA";
    }

    function decimals() external pure returns (uint8) {
        return 18;
    }

    function totalSupply() external pure returns (uint256) {
        return 2100000000 * 10 ** 18;
    }

    function balanceOf(address account) external view returns (uint256) {
        return account.balance;
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert Unimplemented();
    }

    function allowance(address, address) external pure returns (uint256) {
        revert Unimplemented();
    }

    function approve(address, uint256) external pure returns (bool) {
        revert Unimplemented();
    }

    function transferFrom(
        address,
        address,
        uint256
    ) external pure returns (bool) {
        revert Unimplemented();
    }
}
