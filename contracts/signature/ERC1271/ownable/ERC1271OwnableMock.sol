// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC1271Ownable } from './ERC1271Ownable.sol';

contract ERC1271OwnableMock is ERC1271Ownable {
    constructor(address owner) {
        _setOwner(owner);
    }

    function __isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4) {
        return _isValidSignature(hash, signature);
    }
}
