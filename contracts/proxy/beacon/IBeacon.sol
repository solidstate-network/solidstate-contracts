// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IOwnable } from '../../access/ownable/IOwnable.sol';
import { BeaconStorage } from './BeaconStorage.sol';

interface IBeacon is IOwnable {
    /**
     * @notice query the address of the implementation that should be used by BeaconProxy instancesf
     * @return implementation address of the implementation contract
     */
    function getImplementation() external view returns (address implementation);

    /**
     * @notice set the address of the implementation that should be used by BeaconProxy instancesf
     * @param implementation address of the implementation contract
     */
    function setImplementation(address implementation) external;
}
