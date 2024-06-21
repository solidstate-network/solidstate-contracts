// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { Ownable } from '../../access/ownable/Ownable.sol';
import { IBeacon } from './IBeacon.sol';
import { BeaconInternal } from './BeaconInternal.sol';

contract Beacon is IBeacon, Ownable, BeaconInternal {
    /**
     * @inheritdoc IBeacon
     */
    function getImplementation()
        external
        view
        returns (address implementation)
    {
        implementation = _getImplementation();
    }

    /**
     * @inheritdoc IBeacon
     */
    function setImplementation(address implementation) external {
        _setImplementation(implementation);
    }
}
