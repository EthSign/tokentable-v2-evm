// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ITTHook} from "../interfaces/ITTHook.sol";
import {ITokenTableUnlockerV2} from "../interfaces/ITokenTableUnlockerV2.sol";
import {IVersionable} from "../interfaces/IVersionable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct Attestation {
    uint256 schemaId;
    uint256 linkedAttestationId;
    address attester;
    uint64 validUntil;
    bool revoked;
    address[] recipients;
    bytes data;
}

struct KYCData {
    uint256 attestationId;
    string applicantId;
    address applicant;
}

interface ISP {
    function getAttestation(
        uint256 attestationId
    ) external view returns (Attestation memory);
}

contract KYCHook is ITTHook, Ownable, IVersionable {
    ISP public immutable isp;
    mapping(uint256 => mapping(address => bool))
        public acceptedSchemasAndAttesters;

    event KYCProcessed(string applicantId, address applicant);

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
            _checkKYC(kycData, caller);
        } else if (selector == ITokenTableUnlockerV2.delegateClaim.selector) {
            (, , bytes memory extraData) = abi.decode(
                context[4:],
                (uint256[], uint256, bytes)
            );
            KYCData memory kycData = abi.decode(extraData, (KYCData));
            _checkKYC(kycData, caller);
        }
    }

    function version() external pure override returns (string memory) {
        return "1.0.0-zetachain-airdrop";
    }

    function _checkKYC(KYCData memory kycData, address caller) internal {
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
            kycData.applicant != caller
        ) {
            revert KYCFailed();
        }
        emit KYCProcessed(kycData.applicantId, kycData.applicant);
    }
}
