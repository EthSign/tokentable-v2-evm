// SPDX-License-Identifier: AGPL v3
pragma solidity ^0.8.20;

import {ITTUFeeCollector, IOwnable} from "../interfaces/ITTUFeeCollector.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TTUFeeCollector is ITTUFeeCollector, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant BIPS_PRECISION = 10 ** 4;
    uint256 public constant MAX_FEE = 10 ** 3;

    uint256 public defaultFeesBips;
    mapping(address => uint256) internal _customFeesBips;

    constructor() Ownable(_msgSender()) {}

    function withdrawFee(IERC20 token, uint256 amount) external onlyOwner {
        token.safeTransfer(owner(), amount);
    }

    function setDefaultFee(uint256 bips) external onlyOwner {
        if (bips > MAX_FEE) revert FeesTooHigh();
        defaultFeesBips = bips;
        emit DefaultFeeSet(bips);
    }

    // @dev Setting bips to BIPS_PRECISION means 0 fees
    function setCustomFee(
        address unlockerAddress,
        uint256 bips
    ) external onlyOwner {
        if (bips > MAX_FEE) revert FeesTooHigh();
        _customFeesBips[unlockerAddress] = bips;
        emit CustomFeeSet(unlockerAddress, bips);
    }

    function getFee(
        address unlockerAddress,
        uint256 tokenTransferred
    ) external view override returns (uint256 tokensCollected) {
        uint256 feeBips = _customFeesBips[unlockerAddress];
        if (feeBips == 0) {
            feeBips = defaultFeesBips;
        } else if (feeBips == BIPS_PRECISION) {
            feeBips = 0;
        }
        tokensCollected = (tokenTransferred * feeBips) / BIPS_PRECISION;
    }

    function version() external pure returns (string memory) {
        return "2.1.0";
    }

    function transferOwnership(
        address newOwner
    ) public override(IOwnable, Ownable) {
        Ownable.transferOwnership(newOwner);
    }

    function renounceOwnership() public override(IOwnable, Ownable) {
        Ownable.renounceOwnership();
    }

    function owner() public view override(IOwnable, Ownable) returns (address) {
        return Ownable.owner();
    }
}
