// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { IERC165 } from '../../../interfaces/IERC165.sol';
import { ERC165Base } from '../../../introspection/ERC165/base/ERC165Base.sol';
import { ERC2981, IERC2981 } from './ERC2981.sol';
import { ERC2981Storage } from './ERC2981Storage.sol';

contract ERC2981Mock is ERC2981, ERC165Base {
    constructor(
        uint16 defaultRoyaltyBPS,
        uint16[] memory royaltiesBPS,
        address defaultRoyaltyReceiver
    ) {
        ERC2981Storage.Layout storage l = ERC2981Storage.layout(
            ERC2981Storage.DEFAULT_STORAGE_SLOT
        );
        l.defaultRoyaltyBPS = defaultRoyaltyBPS;
        l.defaultRoyaltyReceiver = defaultRoyaltyReceiver;

        for (uint8 i = 0; i < royaltiesBPS.length; i++) {
            l.royaltiesBPS[i] = royaltiesBPS[i];
        }

        _setSupportsInterface(type(IERC165).interfaceId, true);
        _setSupportsInterface(type(IERC2981).interfaceId, true);
    }

    function setRoyalty(uint16 defaultRoyaltyBPS) external {
        ERC2981Storage
            .layout(ERC2981Storage.DEFAULT_STORAGE_SLOT)
            .defaultRoyaltyBPS = defaultRoyaltyBPS;
    }
}
