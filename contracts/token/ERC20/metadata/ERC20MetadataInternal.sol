// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IERC20MetadataInternal } from './IERC20MetadataInternal.sol';
import { ERC20MetadataStorage } from './ERC20MetadataStorage.sol';

/**
 * @title ERC20Metadata internal functions
 */
abstract contract ERC20MetadataInternal is IERC20MetadataInternal {
    /**
     * @notice return token name
     * @return token name
     */
    function _name() internal view virtual returns (string memory) {
        return
            ERC20MetadataStorage
                .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
                .name;
    }

    /**
     * @notice return token symbol
     * @return token symbol
     */
    function _symbol() internal view virtual returns (string memory) {
        return
            ERC20MetadataStorage
                .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
                .symbol;
    }

    /**
     * @notice return token decimals, generally used only for display purposes
     * @return token decimals
     */
    function _decimals() internal view virtual returns (uint8) {
        return
            ERC20MetadataStorage
                .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
                .decimals;
    }

    function _setName(string memory name) internal virtual {
        ERC20MetadataStorage
            .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
            .name = name;
    }

    function _setSymbol(string memory symbol) internal virtual {
        ERC20MetadataStorage
            .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
            .symbol = symbol;
    }

    function _setDecimals(uint8 decimals) internal virtual {
        ERC20MetadataStorage
            .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
            .decimals = decimals;
    }
}
