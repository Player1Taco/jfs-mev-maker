// Flashbots API service for MEV data
const FLASHBOTS_API = 'https://blocks.flashbots.net/v1';

export interface FlashbotsBlock {
  block_number: number;
  block_timestamp: number;
  miner_reward: string;
  coinbase_transfers: string;
  total_gas_used: string;
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
  gas_used: string;
  gas_price: string;
  coinbase_transfer: string;
  total_miner_reward: string;
}

export async function getRecentBlocks(limit = 20): Promise<FlashbotsBlock[]> {
  try {
    const response = await fetch(`${FLASHBOTS_API}/blocks?limit=${limit}`);
    const data = await response.json();
    return data.blocks || [];
  } catch (error) {
    console.error('Flashbots API error:', error);
    return [];
  }
}

export async function getBlockByNumber(blockNumber: number): Promise<FlashbotsBlock | null> {
  try {
    const response = await fetch(`${FLASHBOTS_API}/blocks/${blockNumber}`);
    const data = await response.json();
    return data.block || null;
  } catch (error) {
    console.error('Flashbots API error:', error);
    return null;
  }
}

export async function getMEVStats(): Promise<{
  totalMEV: string;
  avgBlockMEV: string;
  topSearchers: { address: string; profit: string }[];
}> {
  try {
    const blocks = await getRecentBlocks(100);
    
    let totalMEV = 0;
    const searcherProfits: Record<string, number> = {};

    for (const block of blocks) {
      for (const tx of block.transactions || []) {
        const profit = parseFloat(tx.coinbase_transfer || '0');
        totalMEV += profit;
        
        if (tx.eoa_address) {
          searcherProfits[tx.eoa_address] = (searcherProfits[tx.eoa_address] || 0) + profit;
        }
      }
    }

    const topSearchers = Object.entries(searcherProfits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([address, profit]) => ({ address, profit: profit.toFixed(4) }));

    return {
      totalMEV: totalMEV.toFixed(4),
      avgBlockMEV: (totalMEV / blocks.length).toFixed(4),
      topSearchers,
    };
  } catch (error) {
    console.error('Failed to get MEV stats:', error);
    return { totalMEV: '0', avgBlockMEV: '0', topSearchers: [] };
  }
}
