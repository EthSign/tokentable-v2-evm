// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface IVersionable {
    function version() external pure returns (string memory);
}
