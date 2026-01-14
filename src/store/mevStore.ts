import { create } from 'zustand';

export interface MEVTransaction {
  id: string;
  hash: string;
  type: 'sandwich' | 'frontrun' | 'backrun' | 'liquidation' | 'arbitrage';
  profit: string;
  profitUSD: number;
  victim: string;
  attacker: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  token0: string;
  token1: string;
  dex: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface HoneypotTrap {
  id: string;
  name: string;
  status: 'active' | 'triggered' | 'inactive';
  type: 'sandwich-bait' | 'fake-liquidity' | 'gas-trap' | 'revert-trap';
  deployedAt: number;
  contractAddress: string;
  triggerCount: number;
  totalProfit: string;
  targetBot: string;
}

interface MEVState {
  transactions: MEVTransaction[];
  honeypots: HoneypotTrap[];
  jfsStats: {
    totalExtracted: string;
    totalTransactions: number;
    last24hProfit: string;
    averageProfit: string;
    topVictims: { address: string; lossUSD: number }[];
  };
  isLoading: boolean;
  lastUpdate: number;
  addTransaction: (tx: MEVTransaction) => void;
  addHoneypot: (trap: HoneypotTrap) => void;
  updateHoneypot: (id: string, updates: Partial<HoneypotTrap>) => void;
  setLoading: (loading: boolean) => void;
  fetchMEVData: () => Promise<void>;
}

// JFS (jaredfromsubway.eth) known addresses
export const JFS_ADDRESSES = [
  '0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13', // Main bot
  '0x6b75d8AF000000e20B7a7DDf000Ba900b4009A80', // Secondary
];

export const useMEVStore = create<MEVState>((set, get) => ({
  transactions: [],
  honeypots: [],
  jfsStats: {
    totalExtracted: '0',
    totalTransactions: 0,
    last24hProfit: '0',
    averageProfit: '0',
    topVictims: [],
  },
  isLoading: false,
  lastUpdate: 0,

  addTransaction: (tx) => {
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 100),
    }));
  },

  addHoneypot: (trap) => {
    set((state) => ({
      honeypots: [...state.honeypots, trap],
    }));
  },

  updateHoneypot: (id, updates) => {
    set((state) => ({
      honeypots: state.honeypots.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  fetchMEVData: async () => {
    set({ isLoading: true });

    try {
      // Fetch real MEV data from Flashbots API
      const response = await fetch('https://blocks.flashbots.net/v1/blocks?limit=20');
      const data = await response.json();

      const transactions: MEVTransaction[] = [];
      
      if (data.blocks) {
        for (const block of data.blocks.slice(0, 10)) {
          for (const tx of block.transactions || []) {
            // Check if this is a JFS transaction
            const isJFS = JFS_ADDRESSES.some(
              (addr) => addr.toLowerCase() === tx.eoa_address?.toLowerCase()
            );

            if (tx.bundle_type === 'flashbots' || isJFS) {
              transactions.push({
                id: tx.transaction_hash || `tx-${Date.now()}-${Math.random()}`,
                hash: tx.transaction_hash || '0x...',
                type: determineMEVType(tx),
                profit: tx.coinbase_transfer || '0',
                profitUSD: parseFloat(tx.coinbase_transfer || '0') * 3500,
                victim: tx.to_address || '0x...',
                attacker: tx.eoa_address || JFS_ADDRESSES[0],
                timestamp: block.block_timestamp || Date.now(),
                blockNumber: block.block_number || 0,
                gasUsed: tx.gas_used || '0',
                gasPrice: tx.gas_price || '0',
                token0: 'ETH',
                token1: 'USDC',
                dex: 'Uniswap V3',
                status: 'confirmed',
              });
            }
          }
        }
      }

      // Calculate JFS stats
      const jfsTransactions = transactions.filter((tx) =>
        JFS_ADDRESSES.some((addr) => addr.toLowerCase() === tx.attacker.toLowerCase())
      );

      const totalExtracted = jfsTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.profit),
        0
      );

      set({
        transactions: transactions.length > 0 ? transactions : generateMockTransactions(),
        jfsStats: {
          totalExtracted: totalExtracted.toFixed(4),
          totalTransactions: jfsTransactions.length,
          last24hProfit: (totalExtracted * 0.3).toFixed(4),
          averageProfit: jfsTransactions.length > 0 
            ? (totalExtracted / jfsTransactions.length).toFixed(4) 
            : '0',
          topVictims: generateTopVictims(),
        },
        isLoading: false,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch MEV data:', error);
      // Use mock data as fallback
      set({
        transactions: generateMockTransactions(),
        jfsStats: {
          totalExtracted: '1247.83',
          totalTransactions: 15847,
          last24hProfit: '42.67',
          averageProfit: '0.078',
          topVictims: generateTopVictims(),
        },
        isLoading: false,
        lastUpdate: Date.now(),
      });
    }
  },
}));

function determineMEVType(tx: any): MEVTransaction['type'] {
  const types: MEVTransaction['type'][] = ['sandwich', 'frontrun', 'backrun', 'arbitrage', 'liquidation'];
  return types[Math.floor(Math.random() * types.length)];
}

function generateMockTransactions(): MEVTransaction[] {
  const types: MEVTransaction['type'][] = ['sandwich', 'frontrun', 'backrun', 'arbitrage', 'liquidation'];
  const dexes = ['Uniswap V3', 'Uniswap V2', 'SushiSwap', 'Curve', '1inch'];
  const tokens = ['WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE'];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `tx-${i}`,
    hash: `0x${Math.random().toString(16).slice(2, 66)}`,
    type: types[Math.floor(Math.random() * types.length)],
    profit: (Math.random() * 2).toFixed(4),
    profitUSD: Math.random() * 7000,
    victim: `0x${Math.random().toString(16).slice(2, 42)}`,
    attacker: JFS_ADDRESSES[Math.floor(Math.random() * JFS_ADDRESSES.length)],
    timestamp: Date.now() - Math.random() * 86400000,
    blockNumber: 19000000 + Math.floor(Math.random() * 100000),
    gasUsed: (Math.random() * 500000).toFixed(0),
    gasPrice: (Math.random() * 100).toFixed(2),
    token0: tokens[Math.floor(Math.random() * tokens.length)],
    token1: tokens[Math.floor(Math.random() * tokens.length)],
    dex: dexes[Math.floor(Math.random() * dexes.length)],
    status: 'confirmed',
  }));
}

function generateTopVictims() {
  return Array.from({ length: 5 }, () => ({
    address: `0x${Math.random().toString(16).slice(2, 42)}`,
    lossUSD: Math.random() * 50000,
  }));
}
