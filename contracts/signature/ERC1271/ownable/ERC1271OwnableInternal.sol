// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { OwnableInternal } from '../../../access/ownable/OwnableInternal.sol';
import { ECDSA } from '../../../cryptography/ECDSA.sol';
import { ERC1271BaseInternal } from '../base/ERC1271BaseInternal.sol';

/**
 * @title ERC1271Ownable internal functions
 */
abstract contract ERC1271OwnableInternal is
    ERC1271BaseInternal,
    OwnableInternal
{
    using ECDSA for bytes32;

    /**
     * @inheritdoc ERC1271BaseInternal
     * @notice return whether given signature is signed by contract owner
     */
    function _isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) internal view override returns (bytes4 magicValue) {
        return
            hash.toEthSignedMessageHash().recover(signature) == _owner()
                ? MAGIC_VALUE
                : bytes4(0);
    }
}
