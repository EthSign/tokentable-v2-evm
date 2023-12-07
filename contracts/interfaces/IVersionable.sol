// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IVersionable {
    function version() external pure returns (string memory);
}
