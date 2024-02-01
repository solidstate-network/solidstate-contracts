// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { PackedDoublyLinkedList } from './PackedDoublyLinkedList.sol';

contract PackedDoublyLinkedListBytes16Mock {
    using PackedDoublyLinkedList for PackedDoublyLinkedList.Bytes16List;

    PackedDoublyLinkedList.Bytes16List private self;

    function contains(bytes16 value) external view returns (bool) {
        return self.contains(value);
    }

    function prev(bytes16 value) external view returns (bytes16) {
        return self.prev(value);
    }

    function next(bytes16 value) external view returns (bytes16) {
        return self.next(value);
    }

    function insertBefore(
        bytes16 nextValue,
        bytes16 newValue
    ) external returns (bool) {
        return self.insertBefore(nextValue, newValue);
    }

    function insertAfter(
        bytes16 prevValue,
        bytes16 newValue
    ) external returns (bool) {
        return self.insertAfter(prevValue, newValue);
    }

    function push(bytes16 value) external returns (bool) {
        return self.push(value);
    }

    function pop() external returns (bytes16) {
        return self.pop();
    }

    function shift() external returns (bytes16) {
        return self.shift();
    }

    function unshift(bytes16 value) external returns (bool) {
        return self.unshift(value);
    }

    function remove(bytes16 value) external returns (bool) {
        return self.remove(value);
    }

    function replace(
        bytes16 oldValue,
        bytes16 newValue
    ) external returns (bool) {
        return self.replace(oldValue, newValue);
    }
}
