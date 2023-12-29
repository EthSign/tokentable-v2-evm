// SPDX-License-Identifier: MIT
// Based on OpenZeppelin Contracts (last updated v4.7.0) (metatx/ERC2771Context.sol)
pragma solidity ^0.8.20;

// solhint-disable var-name-mixedcase
// solhint-disable no-inline-assembly
// solhint-disable const-name-snakecase
// solhint-disable private-vars-leading-underscore
abstract contract CustomERC2771Context {
    /// @custom:storage-location erc7201:ethsign.CustomERC2771Context
    struct CustomERC2771ContextStorage {
        address trustedForwarder;
    }

    // keccak256(abi.encode(uint256(keccak256("ethsign.CustomERC2771Context")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant CustomERC2771ContextStorageLocation =
        0xcb6e2bc5ab9d966a1ede7eb38aa2c5a3d088ef25042885484e4945fcd2824100;

    function _getCustomERC2771ContextStorage()
        internal
        pure
        returns (CustomERC2771ContextStorage storage $)
    {
        assembly {
            $.slot := CustomERC2771ContextStorageLocation
        }
    }

    // @dev MUST override in implementation and make sure this is onlyOwner
    // solhint-disable-next-line ordering
    function setTrustedForwarder(address forwarder) public virtual {
        CustomERC2771ContextStorage
            storage $ = _getCustomERC2771ContextStorage();
        $.trustedForwarder = forwarder;
    }

    function isTrustedForwarder(
        address forwarder
    ) public view virtual returns (bool) {
        CustomERC2771ContextStorage
            memory $ = _getCustomERC2771ContextStorage();
        return forwarder == $.trustedForwarder;
    }

    function _msgSender() internal view virtual returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return msg.sender;
        }
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return msg.data;
        }
    }
}
