// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IOwnable {
    function renounceOwnership() external;

    function transferOwnership(address newOwner) external;

    function owner() external view returns (address);
}
