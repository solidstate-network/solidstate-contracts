// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { BeaconProxy } from './BeaconProxy.sol';
import { IDiamondBeacon } from './IDiamondBeacon.sol';
import { IDiamondBeaconProxy } from './IDiamondBeaconProxy.sol';

abstract contract DiamondBeaconProxy is IDiamondBeaconProxy, BeaconProxy {
    function _getImplementation() internal view override returns (address) {
        return IDiamondBeacon(_getBeacon()).facetAddress(msg.sig);
    }
}
