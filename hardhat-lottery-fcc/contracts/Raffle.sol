// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

error Raffle__NotEnoughETHEntered();

contract Raffle {
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address[] payable private s_players;

    constructor(uint256 entranceFee) {
        s_entranceFee = entranceFee;
    }

    function enterRaffle() {
        if(msg.value < s_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        s_players.push(payable(msg.sender));
    }
    
    //function pickRandomWinner() {}

    function getEntranceFee public view returns(uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address){
        return s_players[index];
    }
}
