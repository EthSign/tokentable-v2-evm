// SPDX-License-Identifier: AGPL v3
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// solhint-disable var-name-mixedcase
// solhint-disable no-inline-assembly
// solhint-disable const-name-snakecase
// solhint-disable private-vars-leading-underscore
contract TTUProjectTokenStorage is Initializable {
    /// @custom:storage-location erc7201:ethsign.tokentable.TTUProjectTokenStorage
    struct TTUProjectTokenStorageStorage {
        address _projectToken;
    }

    // keccak256(abi.encode(uint256(keccak256("ethsign.tokentable.TTUProjectTokenStorage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TTUProjectTokenStorageStorageLocation =
        0xc6cedc2110f0271ccdfaf617b7233d3ed38f0d70138cb74c2dc2c8d098506000;

    error TokenSet();

    function _getTTUProjectTokenStorageStorage()
        internal
        pure
        returns (TTUProjectTokenStorageStorage storage $)
    {
        assembly {
            $.slot := TTUProjectTokenStorageStorageLocation
        }
    }

    // solhint-disable-next-line ordering
    function initializeProjectToken(address projectToken) public {
        TTUProjectTokenStorageStorage
            storage $ = _getTTUProjectTokenStorageStorage();
        if ($._projectToken != address(0)) revert TokenSet();
        $._projectToken = projectToken;
    }

    function getProjectToken() public view returns (address) {
        TTUProjectTokenStorageStorage
            storage $ = _getTTUProjectTokenStorageStorage();
        return $._projectToken;
    }

    function _initializeSE(address projectToken) internal onlyInitializing {
        TTUProjectTokenStorageStorage
            storage $ = _getTTUProjectTokenStorageStorage();
        $._projectToken = projectToken;
    }
}
