// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { AddressUtils } from '../../../utils/AddressUtils.sol';
import { DiamondBaseStorage } from '../base/DiamondBaseStorage.sol';
import { IDiamondWritableInternal } from './IDiamondWritableInternal.sol';

abstract contract DiamondWritableInternal is IDiamondWritableInternal {
    using AddressUtils for address;

    bytes32 private constant CLEAR_ADDRESS_MASK =
        bytes32(uint256(0xffffffffffffffffffffffff));
    bytes32 private constant CLEAR_SELECTOR_MASK =
        bytes32(uint256(0xffffffff << 224));

    /**
     * @notice update functions callable on Diamond proxy
     * @param facetCuts array of structured Diamond facet update data
     * @param target optional recipient of initialization delegatecall
     * @param data optional initialization call data
     */
    function _diamondCut(
        FacetCut[] memory facetCuts,
        address target,
        bytes memory data
    ) internal virtual {
        DiamondBaseStorage.Layout storage l = DiamondBaseStorage.layout();

        unchecked {
            uint256 originalSelectorCount = l.selectorCount;
            uint256 selectorCount = originalSelectorCount;
            bytes32 selectorSlot;

            // Check if last selector slot is not full
            if (selectorCount & 7 > 0) {
                // get last selectorSlot
                selectorSlot = l.selectorSlots[selectorCount >> 3];
            }

            for (uint256 i; i < facetCuts.length; i++) {
                FacetCut memory facetCut = facetCuts[i];
                FacetCutAction action = facetCut.action;

                if (facetCut.functionSelectors.length == 0)
                    revert DiamondWritable__SelectorNotSpecified();

                if (action == FacetCutAction.ADD) {
                    (selectorCount, selectorSlot) = _addFacetSelectors(
                        l,
                        selectorCount,
                        selectorSlot,
                        facetCut
                    );
                } else if (action == FacetCutAction.REPLACE) {
                    _replaceFacetSelectors(l, facetCut);
                } else if (action == FacetCutAction.REMOVE) {
                    (selectorCount, selectorSlot) = _removeFacetSelectors(
                        l,
                        selectorCount,
                        selectorSlot,
                        facetCut
                    );
                }
            }

            if (selectorCount != originalSelectorCount) {
                l.selectorCount = uint16(selectorCount);
            }

            // If last selector slot is not full
            if (selectorCount & 7 > 0) {
                l.selectorSlots[selectorCount >> 3] = selectorSlot;
            }

            emit DiamondCut(facetCuts, target, data);
            _initialize(target, data);
        }
    }

    function _addFacetSelectors(
        DiamondBaseStorage.Layout storage l,
        uint256 selectorCount,
        bytes32 selectorSlot,
        FacetCut memory facetCut
    ) internal returns (uint256, bytes32) {
        unchecked {
            if (
                facetCut.facetAddress != address(this) &&
                !facetCut.facetAddress.isContract()
            ) revert DiamondWritable__TargetHasNoCode();

            for (uint256 i; i < facetCut.functionSelectors.length; i++) {
                bytes4 selector = facetCut.functionSelectors[i];
                bytes32 oldFacet = l.facets[selector];

                if (address(bytes20(oldFacet)) != address(0))
                    revert DiamondWritable__SelectorAlreadyAdded();

                // add facet for selector
                l.facets[selector] =
                    bytes20(facetCut.facetAddress) |
                    bytes32(selectorCount);
                uint256 selectorInSlotPosition = (selectorCount & 7) << 5;

                // clear selector position in slot and add selector
                selectorSlot =
                    (selectorSlot &
                        ~(CLEAR_SELECTOR_MASK >> selectorInSlotPosition)) |
                    (bytes32(selector) >> selectorInSlotPosition);

                // if slot is full then write it to storage
                if (selectorInSlotPosition == 224) {
                    l.selectorSlots[selectorCount >> 3] = selectorSlot;
                    selectorSlot = 0;
                }

                selectorCount++;
            }

            return (selectorCount, selectorSlot);
        }
    }

    function _removeFacetSelectors(
        DiamondBaseStorage.Layout storage l,
        uint256 selectorCount,
        bytes32 selectorSlot,
        FacetCut memory facetCut
    ) internal returns (uint256, bytes32) {
        unchecked {
            if (facetCut.facetAddress != address(0))
                revert DiamondWritable__RemoveTargetNotZeroAddress();

            uint256 selectorSlotCount = selectorCount >> 3;
            uint256 selectorInSlotIndex = selectorCount & 7;

            for (uint256 i; i < facetCut.functionSelectors.length; i++) {
                bytes4 selector = facetCut.functionSelectors[i];
                bytes32 oldFacet = l.facets[selector];

                if (address(bytes20(oldFacet)) == address(0))
                    revert DiamondWritable__SelectorNotFound();

                if (address(bytes20(oldFacet)) == address(this))
                    revert DiamondWritable__SelectorIsImmutable();

                if (selectorSlot == 0) {
                    selectorSlotCount--;
                    selectorSlot = l.selectorSlots[selectorSlotCount];
                    selectorInSlotIndex = 7;
                } else {
                    selectorInSlotIndex--;
                }

                bytes4 lastSelector;
                uint256 oldSelectorsSlotCount;
                uint256 oldSelectorInSlotPosition;

                // adding a block here prevents stack too deep error
                {
                    // replace selector with last selector in l.facets
                    lastSelector = bytes4(
                        selectorSlot << (selectorInSlotIndex << 5)
                    );

                    if (lastSelector != selector) {
                        // update last selector slot position info
                        l.facets[lastSelector] =
                            (oldFacet & CLEAR_ADDRESS_MASK) |
                            bytes20(l.facets[lastSelector]);
                    }

                    delete l.facets[selector];
                    uint256 oldSelectorCount = uint16(uint256(oldFacet));
                    oldSelectorsSlotCount = oldSelectorCount >> 3;
                    oldSelectorInSlotPosition = (oldSelectorCount & 7) << 5;
                }

                if (oldSelectorsSlotCount != selectorSlotCount) {
                    bytes32 oldSelectorSlot = l.selectorSlots[
                        oldSelectorsSlotCount
                    ];

                    // clears the selector we are deleting and puts the last selector in its place.
                    oldSelectorSlot =
                        (oldSelectorSlot &
                            ~(CLEAR_SELECTOR_MASK >>
                                oldSelectorInSlotPosition)) |
                        (bytes32(lastSelector) >> oldSelectorInSlotPosition);

                    // update storage with the modified slot
                    l.selectorSlots[oldSelectorsSlotCount] = oldSelectorSlot;
                } else {
                    // clears the selector we are deleting and puts the last selector in its place.
                    selectorSlot =
                        (selectorSlot &
                            ~(CLEAR_SELECTOR_MASK >>
                                oldSelectorInSlotPosition)) |
                        (bytes32(lastSelector) >> oldSelectorInSlotPosition);
                }

                if (selectorInSlotIndex == 0) {
                    delete l.selectorSlots[selectorSlotCount];
                    selectorSlot = 0;
                }
            }

            selectorCount = (selectorSlotCount << 3) | selectorInSlotIndex;

            return (selectorCount, selectorSlot);
        }
    }

    function _replaceFacetSelectors(
        DiamondBaseStorage.Layout storage l,
        FacetCut memory facetCut
    ) internal {
        unchecked {
            if (!facetCut.facetAddress.isContract())
                revert DiamondWritable__TargetHasNoCode();

            for (uint256 i; i < facetCut.functionSelectors.length; i++) {
                bytes4 selector = facetCut.functionSelectors[i];
                bytes32 oldFacet = l.facets[selector];
                address oldFacetAddress = address(bytes20(oldFacet));

                if (oldFacetAddress == address(0))
                    revert DiamondWritable__SelectorNotFound();
                if (oldFacetAddress == address(this))
                    revert DiamondWritable__SelectorIsImmutable();
                if (oldFacetAddress == facetCut.facetAddress)
                    revert DiamondWritable__ReplaceTargetIsIdentical();

                // replace old facet address
                l.facets[selector] =
                    (oldFacet & CLEAR_ADDRESS_MASK) |
                    bytes20(facetCut.facetAddress);
            }
        }
    }

    function _initialize(address target, bytes memory data) private {
        if ((target == address(0)) != (data.length == 0))
            revert DiamondWritable__InvalidInitializationParameters();

        if (target != address(0)) {
            if (target != address(this)) {
                if (!target.isContract())
                    revert DiamondWritable__TargetHasNoCode();
            }

            (bool success, ) = target.delegatecall(data);

            if (!success) {
                assembly {
                    returndatacopy(0, 0, returndatasize())
                    revert(0, returndatasize())
                }
            }
        }
    }
}
