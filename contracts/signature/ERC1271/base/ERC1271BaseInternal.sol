// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IERC1271 } from '../../../interfaces/IERC1271.sol';

/**
 * @title ERC1271Base internal functions
 * @dev _isValidSignature function must be overridden with application-specific logic
 */
abstract contract ERC1271BaseInternal {
    bytes4 internal constant MAGIC_VALUE = IERC1271.isValidSignature.selector;

    /**
     * @notice return whether given signature is valid
     * @param hash hashed data
     * @param signature signed hash
     * @return magicValue ERC1271 magic value or null bytes
     */
    function _isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) internal view virtual returns (bytes4 magicValue);
}
