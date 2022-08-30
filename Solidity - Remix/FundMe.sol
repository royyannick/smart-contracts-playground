// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50;
    address[] public funders;
    address public immutable i_owner;
    mapping(address => uint256) public addressToAmountFunded;

    constructor()
    {
        i_owner = msg.sender;
    }

    receive() external payable{
        fund();
    }

    fallback() external payable{
        fund();
    }

    function fund() public payable{
        require(msg.value.getConversionRate() >= MINIMUM_USD, "Didn't send enough!"); // 1 ETH in wei
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        require(msg.sender == i_owner, "Sender != Owner.");

        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++)
        {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);

        // Method #1 - Transfer
        // payable(msg.sender).transfer(address(this).balance);

        // Method #2 - Send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send Failed!");

        // Method #3 - Call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call Failed!");
    }

    modifier onlyOwner(){
        require(msg.sender == i_owner, "Sender != Owner.");
        _;
    }
}