// Flashbots API service for MEV data
// Using the public Flashbots blocks API
const FLASHBOTS_API = 'https://blocks.flashbots.net/v1';

export interface FlashbotsBlock {
  block_number: number;
  miner: string;
  miner_reward: string;
  coinbase_transfers: string;
  total_gas_used: number;
  gas_price: string;
  transactions: FlashbotsTransaction[];
}

export interface FlashbotsTransaction {
  transaction_hash: string;
  tx_index: number;
  bundle_type: string;
  bundle_index: number;
  block_number: number;
  eoa_address: string;
  to_address: string;
  gas_used: number;
  gas_price: string;
  coinbase_transfer: string;
  total_miner_reward: string;
}

export interface FlashbotsStats {
  totalBlocks: number;
  totalBundles: number;
  totalMinerReward: string;
  avgBundleGasPrice: string;
}

export async function getRecentBlocks(limit = 20): Promise<FlashbotsBlock[]> {
  try {
    const response = await fetch(`${FLASHBOTS_API}/blocks?limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.blocks || [];
  } catch (error) {
    console.error('Flashbots API error:', error);
    return [];
  }
}

export async function getBlockByNumber(blockNumber: number): Promise<FlashbotsBlock | null> {
  try {
    const response = await fetch(`${FLASHBOTS_API}/blocks/${blockNumber}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Flashbots API error:', error);
    return null;
  }
}

export async function getTransactionByHash(txHash: string): Promise<FlashbotsTransaction | null> {
  try {
    const response = await fetch(`${FLASHBOTS_API}/transactions/${txHash}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error('Flashbots API error:', error);
    return null;
  }
}

export async function getMEVStats(): Promise<{
  totalMEV: string;
  avgBlockMEV: string;
  totalBundles: number;
  topSearchers: { address: string; profit: string; txCount: number }[];
}> {
  try {
    const blocks = await getRecentBlocks(100);
    
    if (blocks.length === 0) {
      return {
        totalMEV: '0',
        avgBlockMEV: '0',
        totalBundles: 0,
        topSearchers: [],
      };
    }

    let totalMEV = 0;
    let totalBundles = 0;
    const searcherProfits: Record<string, { profit: number; txCount: number }> = {};

    for (const block of blocks) {
      const blockReward = parseFloat(block.miner_reward || '0') / 1e18;
      totalMEV += blockReward;
      
      for (const tx of block.transactions || []) {
        totalBundles++;
        const profit = parseFloat(tx.coinbase_transfer || '0') / 1e18;
        
        if (tx.eoa_address) {
          if (!searcherProfits[tx.eoa_address]) {
            searcherProfits[tx.eoa_address] = { profit: 0, txCount: 0 };
          }
          searcherProfits[tx.eoa_address].profit += profit;
          searcherProfits[tx.eoa_address].txCount++;
        }
      }
    }

    const topSearchers = Object.entries(searcherProfits)
      .sort(([, a], [, b]) => b.profit - a.profit)
      .slice(0, 10)
      .map(([address, data]) => ({
        address,
        profit: data.profit.toFixed(4),
        txCount: data.txCount,
      }));

    return {
      totalMEV: totalMEV.toFixed(4),
      avgBlockMEV: (totalMEV / blocks.length).toFixed(4),
      totalBundles,
      topSearchers,
    };
  } catch (error) {
    console.error('Failed to get MEV stats:', error);
    return {
      totalMEV: '0',
      avgBlockMEV: '0',
      totalBundles: 0,
      topSearchers: [],
    };
  }
}

// Get recent MEV transactions with detailed info
export async function getRecentMEVTransactions(limit = 50): Promise<FlashbotsTransaction[]> {
  try {
    const blocks = await getRecentBlocks(Math.ceil(limit / 5));
    const transactions: FlashbotsTransaction[] = [];
    
    for (const block of blocks) {
      for (const tx of block.transactions || []) {
        transactions.push({
          ...tx,
          block_number: block.block_number,
        });
        
        if (transactions.length >= limit) {
          return transactions;
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Failed to get recent MEV transactions:', error);
    return [];
  }
}
