// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./token/ERC20/ERC20.sol";
import "./access/Ownable.sol";

contract Mundum is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) payable Ownable() ERC20(name, symbol) {
        _mint(owner(), totalSupply);
    }

    function burn(uint256 amount) public onlyOwner {
        return _burn(owner(), amount);
    }
}
