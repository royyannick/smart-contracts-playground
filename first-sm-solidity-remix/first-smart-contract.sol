// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract FirstSmartContractTest {

    struct People {
        string name;
        uint256 amount;
    }

    uint256 public version = 1;
    People[] public peeps; // V1 of storing info.
    mapping(string => uint256) public nameToAmount; // V2 of storing info.

    function addPeople(string memory _name, uint256 _amount) public
    {
        peeps.push(People(_name, _amount));
        nameToAmount[_name] = _amount;
    }

    function getNbPeeps() public view returns(uint256)
    {
        return peeps.length;
    }
}