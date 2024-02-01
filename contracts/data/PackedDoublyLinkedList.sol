// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

/**
 * @title Doubly linked list implementation with enumeration functions
 */
library PackedDoublyLinkedList {
    struct PackedDoublyLinkedListInternal {
        mapping(bytes16 => bytes32) _links;
    }

    struct Bytes16List {
        PackedDoublyLinkedListInternal _inner;
    }

    struct Uint128List {
        PackedDoublyLinkedListInternal _inner;
    }

    bytes32 private constant MASK_NEXT = bytes32(uint256(type(uint128).max));
    bytes32 private constant MASK_PREV = ~MASK_NEXT;

    error DoublyLinkedList__InvalidInput();
    error DoublyLinkedList__NonExistentEntry();

    function contains(
        Bytes16List storage self,
        bytes16 value
    ) internal view returns (bool) {
        return _contains(self._inner, value);
    }

    function contains(
        Uint128List storage self,
        uint128 value
    ) internal view returns (bool) {
        return _contains(self._inner, bytes16(value));
    }

    function prev(
        Bytes16List storage self,
        bytes16 value
    ) internal view returns (bytes16) {
        return _prev(self._inner, value);
    }

    function prev(
        Uint128List storage self,
        uint128 value
    ) internal view returns (uint128) {
        return uint128(_prev(self._inner, bytes16(value)));
    }

    function next(
        Bytes16List storage self,
        bytes16 value
    ) internal view returns (bytes16) {
        return _next(self._inner, value);
    }

    function next(
        Uint128List storage self,
        uint128 value
    ) internal view returns (uint128) {
        return uint128(_next(self._inner, bytes16(value)));
    }

    function insertBefore(
        Bytes16List storage self,
        bytes16 nextValue,
        bytes16 newValue
    ) internal returns (bool status) {
        status = _insertBefore(self._inner, nextValue, newValue);
    }

    function insertBefore(
        Uint128List storage self,
        uint128 nextValue,
        uint128 newValue
    ) internal returns (bool status) {
        status = _insertBefore(
            self._inner,
            bytes16(nextValue),
            bytes16(newValue)
        );
    }

    function insertAfter(
        Bytes16List storage self,
        bytes16 prevValue,
        bytes16 newValue
    ) internal returns (bool status) {
        status = _insertAfter(self._inner, prevValue, newValue);
    }

    function insertAfter(
        Uint128List storage self,
        uint128 prevValue,
        uint128 newValue
    ) internal returns (bool status) {
        status = _insertAfter(
            self._inner,
            bytes16(prevValue),
            bytes16(newValue)
        );
    }

    function push(
        Bytes16List storage self,
        bytes16 value
    ) internal returns (bool status) {
        status = _push(self._inner, value);
    }

    function push(
        Uint128List storage self,
        uint128 value
    ) internal returns (bool status) {
        status = _push(self._inner, bytes16(value));
    }

    function pop(Bytes16List storage self) internal returns (bytes16 value) {
        value = _pop(self._inner);
    }

    function pop(Uint128List storage self) internal returns (uint128 value) {
        value = uint128(_pop(self._inner));
    }

    function shift(Bytes16List storage self) internal returns (bytes16 value) {
        value = _shift(self._inner);
    }

    function shift(Uint128List storage self) internal returns (uint128 value) {
        value = uint128(_shift(self._inner));
    }

    function unshift(
        Bytes16List storage self,
        bytes16 value
    ) internal returns (bool status) {
        status = _unshift(self._inner, value);
    }

    function unshift(
        Uint128List storage self,
        uint128 value
    ) internal returns (bool status) {
        status = _unshift(self._inner, bytes16(value));
    }

    function remove(
        Bytes16List storage self,
        bytes16 value
    ) internal returns (bool status) {
        status = _remove(self._inner, value);
    }

    function remove(
        Uint128List storage self,
        uint128 value
    ) internal returns (bool status) {
        status = _remove(self._inner, bytes16(value));
    }

    function replace(
        Bytes16List storage self,
        bytes16 oldValue,
        bytes16 newValue
    ) internal returns (bool status) {
        status = _replace(self._inner, oldValue, newValue);
    }

    function replace(
        Uint128List storage self,
        uint128 oldValue,
        uint128 newValue
    ) internal returns (bool status) {
        status = _replace(self._inner, bytes16(oldValue), bytes16(newValue));
    }

    function _contains(
        PackedDoublyLinkedListInternal storage self,
        bytes16 value
    ) private view returns (bool) {
        return
            value != 0 &&
            (self._links[value] != 0 ||
                self._links[0] == _formatLinks(value, value));
    }

    function _adjacent(
        PackedDoublyLinkedListInternal storage self,
        bytes16 value
    ) private view returns (bytes16 prevValue, bytes16 nextValue) {
        (prevValue, nextValue) = _parseLinks(self._links[value]);

        if (
            value != 0 &&
            prevValue == 0 &&
            nextValue == 0 &&
            !_contains(self, value)
        ) revert DoublyLinkedList__NonExistentEntry();
    }

    function _prev(
        PackedDoublyLinkedListInternal storage self,
        bytes16 nextValue
    ) private view returns (bytes16 prevValue) {
        (prevValue, ) = _adjacent(self, nextValue);
    }

    function _next(
        PackedDoublyLinkedListInternal storage self,
        bytes16 prevValue
    ) private view returns (bytes16 nextValue) {
        (, nextValue) = _adjacent(self, prevValue);
    }

    function _insertBefore(
        PackedDoublyLinkedListInternal storage self,
        bytes16 nextValue,
        bytes16 newValue
    ) private returns (bool status) {
        status = _insertBetween(
            self,
            _prev(self, nextValue),
            nextValue,
            newValue
        );
    }

    function _insertAfter(
        PackedDoublyLinkedListInternal storage self,
        bytes16 prevValue,
        bytes16 newValue
    ) private returns (bool status) {
        status = _insertBetween(
            self,
            prevValue,
            _next(self, prevValue),
            newValue
        );
    }

    function _insertBetween(
        PackedDoublyLinkedListInternal storage self,
        bytes16 prevValue,
        bytes16 nextValue,
        bytes16 newValue
    ) private returns (bool status) {
        if (newValue == 0) revert DoublyLinkedList__InvalidInput();

        if (!_contains(self, newValue)) {
            self._links[newValue] = _formatLinks(prevValue, nextValue);

            bytes32 prevLinks = self._links[prevValue];
            self._links[prevValue] =
                (prevLinks & MASK_PREV) |
                _formatLinks(0, newValue);

            bytes32 nextLinks = self._links[nextValue];
            self._links[nextValue] =
                (nextLinks & MASK_NEXT) |
                _formatLinks(newValue, 0);

            status = true;
        }
    }

    function _push(
        PackedDoublyLinkedListInternal storage self,
        bytes16 value
    ) private returns (bool status) {
        status = _insertBetween(self, _prev(self, 0), 0, value);
    }

    function _pop(
        PackedDoublyLinkedListInternal storage self
    ) private returns (bytes16 value) {
        value = _prev(self, 0);
        _remove(self, value);
    }

    function _shift(
        PackedDoublyLinkedListInternal storage self
    ) private returns (bytes16 value) {
        value = _next(self, 0);
        _remove(self, value);
    }

    function _unshift(
        PackedDoublyLinkedListInternal storage self,
        bytes16 value
    ) private returns (bool status) {
        status = _insertBetween(self, 0, _next(self, 0), value);
    }

    function _remove(
        PackedDoublyLinkedListInternal storage self,
        bytes16 value
    ) private returns (bool status) {
        if (_contains(self, value)) {
            (bytes16 prevValue, bytes16 nextValue) = _adjacent(self, value);

            bytes32 prevLinks = self._links[prevValue];
            self._links[prevValue] =
                (prevLinks & MASK_PREV) |
                _formatLinks(0, nextValue);

            bytes32 nextLinks = self._links[nextValue];
            self._links[nextValue] =
                (nextLinks & MASK_NEXT) |
                _formatLinks(prevValue, 0);

            delete self._links[value];
            status = true;
        }
    }

    function _replace(
        PackedDoublyLinkedListInternal storage self,
        bytes16 oldValue,
        bytes16 newValue
    ) private returns (bool status) {
        if (!_contains(self, oldValue))
            revert DoublyLinkedList__NonExistentEntry();

        status = _insertBetween(
            self,
            _prev(self, oldValue),
            _next(self, oldValue),
            newValue
        );

        if (status) {
            delete self._links[oldValue];
        }
    }

    function _formatLinks(
        bytes16 prevValue,
        bytes16 nextValue
    ) private pure returns (bytes32 links) {
        links = bytes32(bytes.concat(prevValue, nextValue));
    }

    function _parseLinks(
        bytes32 links
    ) private pure returns (bytes16 prevValue, bytes16 nextValue) {
        prevValue = bytes16(links);
        nextValue = bytes16(links << 128);
    }
}
