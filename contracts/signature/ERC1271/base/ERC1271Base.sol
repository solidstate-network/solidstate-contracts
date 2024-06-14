// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IERC1271 } from '../../../interfaces/IERC1271.sol';
import { IERC1271Base } from './IERC1271Base.sol';
import { ERC1271BaseInternal } from './ERC1271BaseInternal.sol';

/**
 * @title Base implementation of ERC1721
 * @dev _isValidSignature function must be overridden with application-specific logic
 */
abstract contract ERC1271Base is IERC1271Base, ERC1271BaseInternal {
    /**
     * @inheritdoc IERC1271
     */
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4) {
        return _isValidSignature(hash, signature);
    }
}
