// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TTUProjectTokenStorage is Initializable {
    address private _projectToken;

    error TokenSet();

    function initializeProjectToken(address projectToken) public {
        if (_projectToken != address(0)) revert TokenSet();
        _projectToken = projectToken;
    }

    function getProjectToken() public view returns (address) {
        return _projectToken;
    }

    function _initializeSE(address projectToken) internal onlyInitializing {
        _projectToken = projectToken;
    }
}
