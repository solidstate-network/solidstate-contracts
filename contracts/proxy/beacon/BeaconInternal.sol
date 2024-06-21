// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { OwnableInternal } from '../../access/ownable/OwnableInternal.sol';
import { IBeaconInternal } from './IBeaconInternal.sol';
import { BeaconStorage } from './BeaconStorage.sol';

abstract contract BeaconInternal is IBeaconInternal, OwnableInternal {
    /**
     * @notice query the address of the implementation that should be used by BeaconProxy instancesf
     * @return implementation address of the implementation contract
     */
    function _getImplementation()
        internal
        view
        virtual
        returns (address implementation)
    {
        implementation = BeaconStorage.layout().implementation;
    }

    /**
     * @notice set the address of the implementation that should be used by BeaconProxy instancesf
     * @param implementation address of the implementation contract
     */
    function _setImplementation(
        address implementation
    ) internal virtual onlyOwner {
        BeaconStorage.layout().implementation = implementation;
    }
}
