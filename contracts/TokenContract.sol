// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenTTT is ERC20 {
    constructor(address _ICO) ERC20("Token", "TTT") {
        _mint(_ICO, 1_000_000 ether);
    }
}