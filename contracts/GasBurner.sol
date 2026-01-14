// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GasBurner
 * @dev Contract that wastes MEV bot gas through expensive computations
 * 
 * When a known bot interacts with this contract, it performs expensive
 * operations to drain their gas before reverting.
 */
contract GasBurner {
    
    // Target addresses
    mapping(address => bool) public isTarget;
    
    // Statistics
    uint256 public gasWasted;
    uint256 public attacksBlocked;
    
    // Storage slots to write to (expensive operation)
    mapping(uint256 => uint256) public wasteStorage;
    
    event GasBurned(address indexed attacker, uint256 gasUsed);
    
    constructor() {
        // Add JFS addresses
        isTarget[0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13] = true;
        isTarget[0x6b75d8AF000000e20B7a7DDf000Ba900b4009A80] = true;
    }
    
    /**
     * @dev Function that appears to be a profitable opportunity
     * but burns all gas for bots
     */
    function profitableAction(uint256 amount) external returns (uint256) {
        uint256 startGas = gasleft();
        
        if (isTarget[tx.origin] || isTarget[msg.sender]) {
            // Burn their gas with expensive operations
            _burnGas();
            
            uint256 burned = startGas - gasleft();
            gasWasted += burned;
            attacksBlocked++;
            
            emit GasBurned(tx.origin, burned);
            
            // Revert after burning gas
            revert("Gas burned");
        }
        
        return amount * 2; // Fake profitable return
    }
    
    /**
     * @dev Internal function to burn gas
     */
    function _burnGas() internal {
        // Write to storage (expensive)
        for (uint256 i = 0; i < 100; i++) {
            wasteStorage[i] = uint256(keccak256(abi.encodePacked(block.timestamp, i)));
        }
        
        // Compute hashes (moderately expensive)
        bytes32 hash = keccak256(abi.encodePacked(block.timestamp));
        for (uint256 i = 0; i < 1000; i++) {
            hash = keccak256(abi.encodePacked(hash, i));
        }
        
        // Memory operations
        uint256[] memory waste = new uint256[](1000);
        for (uint256 i = 0; i < 1000; i++) {
            waste[i] = uint256(hash) + i;
        }
    }
    
    /**
     * @dev Add target address
     */
    function addTarget(address target) external {
        isTarget[target] = true;
    }
    
    /**
     * @dev Get statistics
     */
    function getStats() external view returns (uint256, uint256) {
        return (gasWasted, attacksBlocked);
    }
}
