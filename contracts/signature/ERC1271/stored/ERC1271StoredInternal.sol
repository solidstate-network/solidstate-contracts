// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC1271BaseInternal } from '../base/ERC1271BaseInternal.sol';
import { ERC1271StoredStorage } from './ERC1271StoredStorage.sol';

/**
 * @title ERC1271Stored internal functions
 */
abstract contract ERC1271StoredInternal is ERC1271BaseInternal {
    function _isValidSignature(
        bytes32 hash,
        bytes memory
    ) internal view virtual override returns (bytes4 magicValue) {
        return
            ERC1271StoredStorage
                .layout(ERC1271StoredStorage.DEFAULT_STORAGE_SLOT)
                .hashes[hash]
                ? MAGIC_VALUE
                : bytes4(0);
    }

    function _setValidSignature(bytes32 hash, bool status) internal {
        ERC1271StoredStorage
            .layout(ERC1271StoredStorage.DEFAULT_STORAGE_SLOT)
            .hashes[hash] = status;
    }
}
