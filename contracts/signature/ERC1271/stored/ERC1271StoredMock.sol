// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC1271StoredStorage } from './ERC1271StoredStorage.sol';
import { ERC1271Stored } from './ERC1271Stored.sol';

contract ERC1271StoredMock is ERC1271Stored {
    constructor(bytes32 hash) {
        ERC1271StoredStorage
            .layout(ERC1271StoredStorage.DEFAULT_STORAGE_SLOT)
            .hashes[hash] = true;
    }

    function __isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4) {
        return _isValidSignature(hash, signature);
    }

    function __setValidSignature(bytes32 hash, bool status) external {
        _setValidSignature(hash, status);
    }
}
