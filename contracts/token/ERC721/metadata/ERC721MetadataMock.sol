// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC165Base } from '../../../introspection/ERC165/base/ERC165Base.sol';
import { ERC721Metadata } from './ERC721Metadata.sol';
import { ERC721MetadataStorage } from './ERC721MetadataStorage.sol';

contract ERC721MetadataMock is ERC721Metadata, ERC165Base {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) {
        ERC721MetadataStorage.Layout storage l = ERC721MetadataStorage.layout(
            ERC721MetadataStorage.DEFAULT_STORAGE_SLOT
        );
        l.name = name;
        l.symbol = symbol;
        l.baseURI = baseURI;
    }

    function _handleApproveMessageValue(
        address,
        uint256,
        uint256
    ) internal override {}

    function _handleTransferMessageValue(
        address,
        address,
        uint256,
        uint256
    ) internal override {}
}
