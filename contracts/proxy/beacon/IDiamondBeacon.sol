// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IOwnable } from '../../access/ownable/IOwnable.sol';
import { IDiamondReadable } from '../diamond/readable/IDiamondReadable.sol';
import { IDiamondWritable } from '../diamond/writable/IDiamondWritable.sol';
import { IDiamondBeaconInternal } from './IDiamondBeaconInternal.sol';

interface IDiamondBeacon is
    IDiamondReadable,
    IDiamondWritable,
    IOwnable,
    IDiamondBeaconInternal
{}
