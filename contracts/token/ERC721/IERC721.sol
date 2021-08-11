// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC165} from '../../introspection/IERC165.sol';

interface IERC721 is IERC165 {
  event Transfer (
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );

  event Approval (
    address indexed owner,
    address indexed approved,
    uint256 indexed tokenId
  );

  event ApprovalForAll (
    address indexed owner,
    address indexed operator,
    bool approved
  );

  function balanceOf (
    address owner
  ) external view returns (uint256 balance);

  function ownerOf (
    uint256 tokenId
  ) external view returns (address owner);

  function safeTransferFrom (
    address from,
    address to,
    uint256 tokenId
  ) external payable;

  function safeTransferFrom (
    address from,
    address to,
    uint256 tokenId,
    bytes calldata data
  ) external payable;

  function transferFrom (
    address from,
    address to,
    uint256 tokenId
  ) external payable;

  function approve (
    address to,
    uint256 tokenId
  ) external payable;

  function getApproved (
    uint256 tokenId
  ) external view returns (address operator);

  function setApprovalForAll (
    address operator,
    bool _approved
  ) external;

  function isApprovedForAll (
    address owner,
    address operator
  ) external view returns (bool);
}