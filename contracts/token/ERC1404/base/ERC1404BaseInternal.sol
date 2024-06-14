// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IERC1404 } from '../../../interfaces/IERC1404.sol';
import { ERC20BaseInternal } from '../../ERC20/base/ERC20BaseInternal.sol';
import { IERC1404BaseInternal } from './IERC1404BaseInternal.sol';
import { ERC1404BaseStorage } from './ERC1404BaseStorage.sol';

/**
 * @title Base ERC1404 internal functions
 */
abstract contract ERC1404BaseInternal is
    IERC1404BaseInternal,
    ERC20BaseInternal
{
    function _setRestrictions(
        uint8[] memory restrictionCodes,
        string[] memory restrictionMessages
    ) internal {
        if (restrictionCodes.length != restrictionMessages.length)
            revert ERC1404Base__ArrayLengthMismatch();

        mapping(uint8 => string) storage restrictions = ERC1404BaseStorage
            .layout(ERC1404BaseStorage.DEFAULT_STORAGE_SLOT)
            .restrictions;

        unchecked {
            for (uint256 i; i < restrictionCodes.length; i++) {
                restrictions[restrictionCodes[i]] = restrictionMessages[i];
            }
        }
    }

    function _detectTransferRestriction(
        address from,
        address to,
        uint256 amount
    ) internal view virtual returns (uint8);

    function _messageForTransferRestriction(
        uint8 restrictionCode
    ) internal view virtual returns (string memory) {
        return
            ERC1404BaseStorage
                .layout(ERC1404BaseStorage.DEFAULT_STORAGE_SLOT)
                .restrictions[restrictionCode];
    }

    /**
     * @notice ERC20 hook: detect and handle transfer restriction
     * @inheritdoc ERC20BaseInternal
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        uint8 restrictionCode = _detectTransferRestriction(from, to, amount);

        if (restrictionCode > 0) {
            revert(_messageForTransferRestriction(restrictionCode));
        }
    }
}
