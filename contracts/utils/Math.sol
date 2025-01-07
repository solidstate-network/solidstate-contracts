// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library Math {
    /**
     * @notice calculate the absolute value of a number
     * @param a number whose absolute value to calculate
     * @return absolute value
     */
    function abs(int256 a) internal pure returns (uint256) {
        return uint256(a < 0 ? -a : a);
    }

    /**
     * @notice select the greater of two numbers
     * @param a first number
     * @param b second number
     * @return greater number
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @notice select the lesser of two numbers
     * @param a first number
     * @param b second number
     * @return lesser number
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? b : a;
    }

    /**
     * @notice calculate the average of two numbers, rounded down
     * @dev derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)
     * @param a first number
     * @param b second number
     * @return mean value
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        unchecked {
            return (a & b) + ((a ^ b) >> 1);
        }
    }

    /**
     * @notice estimate square root of number
     * @dev uses Heron's method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Heron's_method)
     * @param n input number
     * @return root square root of input (rounded down to nearest uint256)
     */
    function sqrt(uint256 n) internal pure returns (uint256 root) {
        uint256 estimate = (n / 2) | 1;
        root = n;

        while (estimate < root) {
            root = estimate;
            estimate = (estimate + n / estimate) / 2;
        }
    }
}
