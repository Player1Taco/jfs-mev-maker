// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SandwichBait
 * @dev Creates attractive swap transactions that trap sandwich attackers
 * 
 * The contract simulates a vulnerable swap that MEV bots will try to sandwich.
 * When they do, the transaction reverts or traps their funds.
 */
contract SandwichBait is Ownable {
    
    // Uniswap V2 Router interface
    interface IUniswapV2Router {
        function swapExactETHForTokens(
            uint amountOutMin,
            address[] calldata path,
            address to,
            uint deadline
        ) external payable returns (uint[] memory amounts);
        
        function getAmountsOut(
            uint amountIn,
            address[] calldata path
        ) external view returns (uint[] memory amounts);
    }
    
    // Known MEV bot addresses
    mapping(address => bool) public isBot;
    
    // Trap state
    bool public trapArmed;
    uint256 public trapThreshold;
    uint256 public trappedValue;
    uint256 public trapCount;
    
    // Events
    event BotTrapped(address indexed bot, uint256 value, uint256 blockNumber);
    event TrapArmed(uint256 threshold);
    event TrapDisarmed();
    
    constructor() Ownable(msg.sender) {
        // Add known JFS addresses
        isBot[0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13] = true;
        isBot[0x6b75d8AF000000e20B7a7DDf000Ba900b4009A80] = true;
        
        trapThreshold = 0.05 ether;
        trapArmed = true;
    }
    
    /**
     * @dev Execute a bait swap that looks attractive to MEV bots
     * The swap appears to have high slippage tolerance, making it a target
     */
    function executeBaitSwap(
        address router,
        address[] calldata path,
        uint256 minOut
    ) external payable {
        require(msg.value > 0, "No ETH sent");
        
        // Check if this is a bot trying to sandwich
        if (_isLikelyBot()) {
            _trapBot();
            return;
        }
        
        // For legitimate users, execute normally or refund
        // In production, this would execute the actual swap
        payable(msg.sender).transfer(msg.value);
    }
    
    /**
     * @dev Check if the caller is likely a bot
     */
    function _isLikelyBot() internal view returns (bool) {
        // Direct bot address check
        if (isBot[tx.origin] || isBot[msg.sender]) {
            return true;
        }
        
        // Contract caller check (bots often use contracts)
        if (msg.sender != tx.origin) {
            return true;
        }
        
        // High gas price check (bots pay premium for priority)
        if (tx.gasprice > 50 gwei && msg.value > trapThreshold) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Trap the bot's funds
     */
    function _trapBot() internal {
        trapCount++;
        trappedValue += msg.value;
        
        emit BotTrapped(tx.origin, msg.value, block.number);
        
        // Don't return their funds - they're trapped
    }
    
    /**
     * @dev Add a bot address to the blacklist
     */
    function addBot(address bot) external onlyOwner {
        isBot[bot] = true;
    }
    
    /**
     * @dev Remove a bot address from the blacklist
     */
    function removeBot(address bot) external onlyOwner {
        isBot[bot] = false;
    }
    
    /**
     * @dev Arm the trap with a new threshold
     */
    function armTrap(uint256 threshold) external onlyOwner {
        trapThreshold = threshold;
        trapArmed = true;
        emit TrapArmed(threshold);
    }
    
    /**
     * @dev Disarm the trap
     */
    function disarmTrap() external onlyOwner {
        trapArmed = false;
        emit TrapDisarmed();
    }
    
    /**
     * @dev Withdraw trapped funds
     */
    function withdrawTrapped(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        to.transfer(balance);
    }
    
    /**
     * @dev Get trap statistics
     */
    function getStats() external view returns (
        uint256 count,
        uint256 value,
        bool armed
    ) {
        return (trapCount, trappedValue, trapArmed);
    }
    
    receive() external payable {
        if (_isLikelyBot()) {
            _trapBot();
        }
    }
}
