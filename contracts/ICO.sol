// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ICO is Ownable {

    mapping(address => bool) public whitelist;
    mapping (address => uint) public balances;

    uint public ethPerTokenStageOne = 23809523809523809;
    uint public ethPerTokenStageTwo = 47619047619047619;
    uint public ethPerTokenStageThree = 125000000000000000;

    IERC20 public token;
    uint public saleStart;

    function buyToken (uint _amountToBuy) external payable {
        require (saleStart > 0, "ICO is not started"); 
        require (saleStart + 48 days > block.timestamp, "ICO is over"); 

        uint _amounToPay;

        if(saleStart + 17 days < block.timestamp){
            _amounToPay = _amountToBuy * ethPerTokenStageThree;
            require(msg.value >= _amounToPay, "Incorrect amount of ETH");
        } else if (saleStart + 3 days < block.timestamp){
            _amounToPay = _amountToBuy * ethPerTokenStageTwo;
            require(msg.value >= _amounToPay, "Incorrect amount of ETH");
        } else {
            _amounToPay = _amountToBuy * ethPerTokenStageOne;
            require(msg.value >= _amounToPay, "Incorrect amount of ETH");
        }

        balances[msg.sender] += _amountToBuy;
    }   


    function payOut(uint _amount) public {

        if(block.timestamp < saleStart + 42 days) {
            require(whitelist[msg.sender], "Before end of ICO only whitelisted users can withdraw");
        }
        require(balances[msg.sender] >= _amount, "balance insufficient");
        balances[msg.sender] -= _amount;
        token.transfer(msg.sender, _amount * 10 ** 18);
    }

    function startICO(address _token) external onlyOwner {
        token = IERC20(_token);
        saleStart = block.timestamp;
    }

    function addToWhiteList (address _address) public onlyOwner{
        require(!whitelist[_address], "Already in whitelist");
        whitelist[_address] = true;
    }

    function removeFromWhiteList (address _address) public onlyOwner{
        require(whitelist[_address], "Already not in whitelist");
        whitelist[_address] = false;
    }
}