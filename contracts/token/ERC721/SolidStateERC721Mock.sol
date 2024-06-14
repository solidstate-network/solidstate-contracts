// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IERC165 } from '../../interfaces/IERC165.sol';
import { IERC721 } from '../../interfaces/IERC721.sol';
import { ERC721MetadataStorage } from './metadata/ERC721MetadataStorage.sol';
import { SolidStateERC721 } from './SolidStateERC721.sol';

contract SolidStateERC721Mock is SolidStateERC721 {
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

        _setSupportsInterface(type(IERC165).interfaceId, true);
        _setSupportsInterface(type(IERC721).interfaceId, true);
    }

    function mint(address account, uint256 tokenId) external {
        _mint(account, tokenId);
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}
