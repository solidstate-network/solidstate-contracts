// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC1155Metadata, ERC1155MetadataStorage } from './ERC1155Metadata.sol';
import { ERC165Base } from '../../../introspection/ERC165/base/ERC165Base.sol';

contract ERC1155MetadataMock is ERC1155Metadata, ERC165Base {
    constructor(string memory baseURI) {
        ERC1155MetadataStorage
            .layout(ERC1155MetadataStorage.DEFAULT_STORAGE_SLOT)
            .baseURI = baseURI;
    }
}
