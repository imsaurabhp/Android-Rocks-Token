// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract AndroidRocksToken is ERC20, ERC20Capped, ERC20Burnable {
    address payable public owner; 
    uint public blockReward;
    constructor(uint cap, uint reward) ERC20("AndroidRocksToken", "ART") ERC20Capped(cap * (10 ** decimals())){
        owner = payable(_msgSender());
        _mint(msg.sender, 60000000 * (10 ** decimals()));
        blockReward = reward * (10 ** decimals());
        
    }

    error CallerNotOwner(address caller);

    modifier onlyOwner {
        if(_msgSender() != owner)
        {
            revert CallerNotOwner(_msgSender());
        }
        _; 
    }

    function setBlockReward(uint _reward) public onlyOwner { // Incase you want to change the reward value
        blockReward = _reward * (10 ** decimals());
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
    }
    function _update(address from, address to, uint value) internal virtual override(ERC20, ERC20Capped) { // Overriding the _update in ERC20 and ERC20Capped, since their is was no significant function found inside _update to override
        if(from != address(0) && to != block.coinbase && block.coinbase != address(0)){
        // 1. Make sure that `from` is valid address. 
        // 2. We don't want to send an reward for the reward. Basically stop the infinite loop of reward. 
        // 3. Make sure that rewards are sent to valid address
            _mintMinerReward();
        }
        super._update(from, to , value);
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }
}