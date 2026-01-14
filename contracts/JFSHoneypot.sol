// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title JFSHoneypot
 * @dev Anti-MEV honeypot contract designed to trap sandwich attacks from jaredfromsubway.eth
 * 
 * This contract creates bait transactions that appear profitable to MEV bots but
 * revert or trap value when attacked. Multiple trap mechanisms are implemented.
 */
contract JFSHoneypot is Ownable, ReentrancyGuard {
    
    // Known JFS bot addresses
    address constant JFS_MAIN = 0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13;
    address constant JFS_SECONDARY = 0x6b75d8AF000000e20B7a7DDf000Ba900b4009A80;
    
    // Trap configuration
    struct TrapConfig {
        bool isActive;
        uint256 minBaitAmount;
        uint256 maxGasPrice;
        uint256 triggerCount;
        uint256 totalTrapped;
    }
    
    // Events
    event TrapTriggered(address indexed attacker, uint256 amount, string trapType);
    event BaitDeployed(uint256 amount, address token);
    event TrapConfigured(bool isActive, uint256 minBait, uint256 maxGas);
    event FundsRecovered(address indexed to, uint256 amount);
    
    // State
    TrapConfig public config;
    mapping(address => bool) public isTargetBot;
    mapping(address => uint256) public botLosses;
    
    // Modifiers
    modifier onlyHuman() {
        require(tx.origin == msg.sender, "No contracts allowed");
        _;
    }
    
    modifier trapActive() {
        require(config.isActive, "Trap not active");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Initialize target bots
        isTargetBot[JFS_MAIN] = true;
        isTargetBot[JFS_SECONDARY] = true;
        
        // Default config
        config = TrapConfig({
            isActive: true,
            minBaitAmount: 0.1 ether,
            maxGasPrice: 100 gwei,
            triggerCount: 0,
            totalTrapped: 0
        });
    }
    
    /**
     * @dev Sandwich Bait Trap
     * Creates a transaction that looks like a profitable swap but reverts
     * when sandwiched by checking for price manipulation
     */
    function sandwichBait(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external payable trapActive nonReentrant {
        // Check if caller is a known MEV bot
        if (isTargetBot[tx.origin] || isTargetBot[msg.sender]) {
            // Trap triggered - revert with gas consumption
            _consumeGasAndRevert("SANDWICH_TRAP_TRIGGERED");
        }
        
        // Check for suspicious gas price (MEV bots often use high gas)
        if (tx.gasprice > config.maxGasPrice) {
            _consumeGasAndRevert("HIGH_GAS_DETECTED");
        }
        
        // Normal execution for legitimate users
        // In production, this would execute the actual swap
        emit BaitDeployed(amountIn, tokenIn);
    }
    
    /**
     * @dev Fake Liquidity Trap
     * Appears to have liquidity but reverts on large trades
     */
    function fakeLiquiditySwap(
        uint256 amountIn,
        uint256 expectedOut
    ) external payable trapActive {
        // If this is a large trade (likely MEV), trap it
        if (amountIn > config.minBaitAmount) {
            if (isTargetBot[tx.origin]) {
                config.triggerCount++;
                config.totalTrapped += msg.value;
                botLosses[tx.origin] += msg.value;
                
                emit TrapTriggered(tx.origin, msg.value, "FAKE_LIQUIDITY");
                
                // Don't revert - keep their ETH
                return;
            }
        }
        
        // Revert for non-targets to prevent accidental losses
        revert("Insufficient liquidity");
    }
    
    /**
     * @dev Gas Trap
     * Wastes attacker's gas with expensive computations
     */
    function gasWaster(uint256 iterations) external trapActive {
        if (isTargetBot[tx.origin] || isTargetBot[msg.sender]) {
            // Waste their gas with expensive operations
            uint256 result = 0;
            for (uint256 i = 0; i < iterations && i < 10000; i++) {
                result = uint256(keccak256(abi.encodePacked(result, block.timestamp, i)));
            }
            
            config.triggerCount++;
            emit TrapTriggered(tx.origin, 0, "GAS_TRAP");
            
            // Revert after wasting gas
            revert("Gas trap triggered");
        }
    }
    
    /**
     * @dev Revert Trap
     * Appears successful but reverts at the end
     */
    function revertTrap(
        address token,
        uint256 amount
    ) external payable trapActive returns (bool) {
        // Emit events to make it look successful
        emit BaitDeployed(amount, token);
        
        // Check at the very end
        if (isTargetBot[tx.origin]) {
            config.triggerCount++;
            emit TrapTriggered(tx.origin, msg.value, "REVERT_TRAP");
            revert("Trap sprung");
        }
        
        return true;
    }
    
    /**
     * @dev Add a new target bot address
     */
    function addTargetBot(address bot) external onlyOwner {
        isTargetBot[bot] = true;
    }
    
    /**
     * @dev Remove a target bot address
     */
    function removeTargetBot(address bot) external onlyOwner {
        isTargetBot[bot] = false;
    }
    
    /**
     * @dev Update trap configuration
     */
    function updateConfig(
        bool _isActive,
        uint256 _minBaitAmount,
        uint256 _maxGasPrice
    ) external onlyOwner {
        config.isActive = _isActive;
        config.minBaitAmount = _minBaitAmount;
        config.maxGasPrice = _maxGasPrice;
        
        emit TrapConfigured(_isActive, _minBaitAmount, _maxGasPrice);
    }
    
    /**
     * @dev Recover trapped funds
     */
    function recoverFunds(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to recover");
        
        (bool success, ) = to.call{value: balance}("");
        require(success, "Transfer failed");
        
        emit FundsRecovered(to, balance);
    }
    
    /**
     * @dev Get trap statistics
     */
    function getStats() external view returns (
        uint256 triggerCount,
        uint256 totalTrapped,
        bool isActive
    ) {
        return (config.triggerCount, config.totalTrapped, config.isActive);
    }
    
    /**
     * @dev Internal function to consume gas and revert
     */
    function _consumeGasAndRevert(string memory reason) internal pure {
        // Consume some gas before reverting
        uint256 waste = 0;
        for (uint256 i = 0; i < 100; i++) {
            waste = uint256(keccak256(abi.encodePacked(waste, i)));
        }
        revert(reason);
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {
        if (isTargetBot[tx.origin]) {
            config.triggerCount++;
            config.totalTrapped += msg.value;
            emit TrapTriggered(tx.origin, msg.value, "DIRECT_TRANSFER");
        }
    }
    
    /**
     * @dev Fallback
     */
    fallback() external payable {
        if (isTargetBot[tx.origin]) {
            revert("Fallback trap");
        }
    }
}
