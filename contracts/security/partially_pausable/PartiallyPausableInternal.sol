// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IPartiallyPausableInternal } from './IPartiallyPausableInternal.sol';
import { PartiallyPausableStorage } from './PartiallyPausableStorage.sol';

/**
 * @title Internal functions for PartiallyPausable security control module.
 */
abstract contract PartiallyPausableInternal is IPartiallyPausableInternal {
    modifier whenNotPartiallyPaused(bytes32 key) {
        if (_partiallyPaused(key)) revert PartiallyPausable__PartiallyPaused();
        _;
    }

    modifier whenPartiallyPaused(bytes32 key) {
        if (!_partiallyPaused(key))
            revert PartiallyPausable__NotPartiallyPaused();
        _;
    }

    /**
     * @notice query whether contract is paused in the scope of the given key
     * @return status whether contract is paused in the scope of the given key
     */
    function _partiallyPaused(
        bytes32 key
    ) internal view virtual returns (bool status) {
        status = PartiallyPausableStorage
            .layout(PartiallyPausableStorage.DEFAULT_STORAGE_SLOT)
            .partiallyPaused[key];
    }

    /**
     * @notice pause contract in the scope of given key
     * @param key key whose scope to pause
     */
    function _partiallyPause(
        bytes32 key
    ) internal virtual whenNotPartiallyPaused(key) {
        PartiallyPausableStorage
            .layout(PartiallyPausableStorage.DEFAULT_STORAGE_SLOT)
            .partiallyPaused[key] = true;
        emit PartiallyPaused(msg.sender, key);
    }

    /**
     * @notice unpause contract in the scope of given key
     * @param key key whose scope to unpause
     */
    function _partiallyUnpause(
        bytes32 key
    ) internal virtual whenPartiallyPaused(key) {
        delete PartiallyPausableStorage
            .layout(PartiallyPausableStorage.DEFAULT_STORAGE_SLOT)
            .partiallyPaused[key];
        emit PartiallyUnpaused(msg.sender, key);
    }
}
