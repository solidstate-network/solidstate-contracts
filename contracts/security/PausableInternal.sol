// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { PausableStorage } from './PausableStorage.sol';
import { MsgSenderTrick } from '../utils/MsgSenderTrick.sol';

/**
 * @title Internal functions for Pausable security control module.
 */
abstract contract PausableInternal is MsgSenderTrick {
    using PausableStorage for PausableStorage.Layout;

    event Paused(address account);

    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!_paused(), 'Pausable: paused');
        _;
    }

    modifier whenPaused() {
        require(_paused(), 'Pausable: not paused');
        _;
    }

    /**
     * @notice query the contracts paused state.
     * @return true if paused, false if unpaused.
     */
    function _paused() internal view virtual returns (bool) {
        return PausableStorage.layout().paused;
    }

    /**
     * @notice Triggers paused state, when contract is unpaused.
     */
    function _pause() internal virtual whenNotPaused {
        PausableStorage.layout().paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @notice Triggers unpaused state, when contract is paused.
     */
    function _unpause() internal virtual whenPaused {
        PausableStorage.layout().paused = false;
        emit Unpaused(_msgSender());
    }
}
