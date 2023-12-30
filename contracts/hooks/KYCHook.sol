// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ITTHook} from "../interfaces/ITTHook.sol";
import {ITokenTableUnlockerV2} from "../interfaces/ITokenTableUnlockerV2.sol";
import {IVersionable} from "../interfaces/IVersionable.sol";
import {ITTFutureTokenV2} from "../interfaces/ITTFutureTokenV2.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// @dev https://github.com/EthSign/sign-protocol-evm/blob/main/src/models/Attestation.sol
struct Attestation {
    uint256 schemaId;
    uint256 linkedAttestationId;
    address attester;
    uint64 validUntil;
    bool revoked;
    address[] recipients;
    bytes data;
}

// @dev This is encoded as `bytes extraData`.
struct KYCData {
    uint256 attestationId;
    string applicantId;
    address applicant;
}

// @dev https://github.com/EthSign/sign-protocol-evm/blob/main/src/interfaces/ISP.sol
interface ISP {
    function getAttestation(
        uint256 attestationId
    ) external view returns (Attestation memory);
}

/**
 * @title KYCHook
 * @author Jack Xu @ EthSign
 * @dev On-chain KYC verifier for ZetaChain native airdrop.
 */
contract KYCHook is ITTHook, Ownable, IVersionable {
    ISP public immutable isp;
    mapping(uint256 => mapping(address => bool))
        public acceptedSchemasAndAttesters;

    event KYCProcessed(string applicantId, address applicant);

    /**
     * @dev 0x745b5bfd
     */
    error KYCFailed();

    constructor(ISP isp_) Ownable(_msgSender()) {
        isp = isp_;
    }

    function setAcceptedSchemaAndAttester(
        uint256 schemaId,
        address attester,
        bool revoke
    ) external onlyOwner {
        acceptedSchemasAndAttesters[schemaId][attester] = !revoke;
    }

    function didCall(
        bytes4 selector,
        bytes calldata context,
        address caller
    ) external override {
        if (selector == ITokenTableUnlockerV2.claim.selector) {
            (, , , bytes memory extraData) = abi.decode(
                context[4:],
                (uint256[], address[], uint256, bytes)
            );
            KYCData memory kycData = abi.decode(extraData, (KYCData));
            _checkKYC(kycData, caller); // In this case, the recipient (applicant) is the caller of Unlocker
        } else if (selector == ITokenTableUnlockerV2.delegateClaim.selector) {
            (uint256[] memory actualIds, , bytes memory extraData) = abi.decode(
                context[4:],
                (uint256[], uint256, bytes)
            );
            if (actualIds.length != 1) revert KYCFailed(); // The backend will only delegate claim 1 user at a time
            address applicant = ITTFutureTokenV2(
                ITokenTableUnlockerV2(_msgSender()).futureToken()
            ).ownerOf(actualIds[0]); // In this case, the caller of Unlocker is the backend, so we need to find the Actual recipient
            KYCData memory kycData = abi.decode(extraData, (KYCData));
            _checkKYC(kycData, applicant);
        }
    }

    function version() external pure override returns (string memory) {
        return "1.0.0-zetachain-airdrop";
    }

    function _checkKYC(KYCData memory kycData, address applicant) internal {
        Attestation memory attestation = isp.getAttestation(
            kycData.attestationId
        );
        if (
            !acceptedSchemasAndAttesters[attestation.schemaId][
                attestation.attester
            ] ||
            attestation.revoked ||
            (attestation.validUntil < block.timestamp &&
                attestation.validUntil > 0) ||
            kycData.applicant != applicant
        ) {
            revert KYCFailed();
        }
        emit KYCProcessed(kycData.applicantId, kycData.applicant);
    }
}
