// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { Proxy } from '../Proxy.sol';
import { IBeacon } from './IBeacon.sol';
import { IBeaconProxy } from './IBeaconProxy.sol';

/**
 * @title Proxy with externally controlled implementation
 * @dev implementation fetched using immutable function selector
 */
abstract contract BeaconProxy is IBeaconProxy, Proxy {
    /**
     * @inheritdoc Proxy
     */
    function _getImplementation()
        internal
        view
        virtual
        override
        returns (address)
    {
        return IBeacon(_getBeacon()).getImplementation();
    }

    /**
     * @notice get beacon of proxy implementation
     * @return beacon address
     */
    function _getBeacon() internal view virtual returns (address);
}
