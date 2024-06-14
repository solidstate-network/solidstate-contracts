// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { AddressUtils } from '../../utils/AddressUtils.sol';
import { IInitializableInternal } from './IInitializableInternal.sol';
import { InitializableStorage } from './InitializableStorage.sol';

abstract contract InitializableInternal is IInitializableInternal {
    using AddressUtils for address;
    using InitializableStorage for InitializableStorage.Layout;

    modifier initializer() {
        _setInitializedVersion(1);
        _;
    }

    modifier reinitializer(uint8 version) {
        _setInitializedVersion(version);
        _;
    }

    function _setInitializedVersion(uint8 version) internal virtual {
        InitializableStorage.Layout storage l = InitializableStorage.layout(
            InitializableStorage.DEFAULT_STORAGE_SLOT
        );

        if (l.initialized >= version)
            revert Initializable__AlreadyInitialized();

        l.initialized = version;
        emit Initialized(version);
    }

    function _getInitializedVersion()
        internal
        view
        virtual
        returns (uint8 version)
    {
        version = InitializableStorage
            .layout(InitializableStorage.DEFAULT_STORAGE_SLOT)
            .initialized;
    }
}
