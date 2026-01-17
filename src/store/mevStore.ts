import { create } from 'zustand';
import { getRecentBlocks, getMEVStats, getRecentMEVTransactions, FlashbotsTransaction } from '../services/flashbots';
import { getAccountTransactions, getEthPrice as getEtherscanEthPrice } from '../services/etherscan';
import { getEthPrice } from '../services/coingecko';

export interface MEVTransaction {
  id: string;
  hash: string;
  type: 'sandwich' | 'frontrun' | 'backrun' | 'liquidation' | 'arbitrage' | 'bundle';
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
  bundleIndex?: number;
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
  marketData: {
    ethPrice: number;
    ethChange24h: number;
    gasPrice: { slow: string; standard: string; fast: string };
  };
  isLoading: boolean;
  lastUpdate: number;
  error: string | null;
  addTransaction: (tx: MEVTransaction) => void;
  addHoneypot: (trap: HoneypotTrap) => void;
  updateHoneypot: (id: string, updates: Partial<HoneypotTrap>) => void;
  setLoading: (loading: boolean) => void;
  fetchMEVData: () => Promise<void>;
  fetchMarketData: () => Promise<void>;
}

// JFS (jaredfromsubway.eth) known addresses
export const JFS_ADDRESSES = [
  '0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13', // Main bot
  '0x6b75d8AF000000e20B7a7DDf000Ba900b4009A80', // Secondary
  '0x56178a0d5F301bAf6CF3e1Cd53d9863437345Bf9', // Another known address
];

// Known DEX router addresses for classification
const DEX_ROUTERS: Record<string, string> = {
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Uniswap V2',
  '0xE592427A0AEce92De3Edee1F18E0157C05861564': 'Uniswap V3',
  '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45': 'Uniswap Universal',
  '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F': 'SushiSwap',
  '0x1111111254EEB25477B68fb85Ed929f73A960582': '1inch',
  '0xDef1C0ded9bec7F1a1670819833240f027b25EfF': '0x Protocol',
};

function classifyMEVType(tx: FlashbotsTransaction): MEVTransaction['type'] {
  // Classify based on bundle type and transaction patterns
  if (tx.bundle_type === 'flashbots') {
    // Check if it's part of a sandwich (usually has specific patterns)
    if (tx.bundle_index !== undefined && tx.bundle_index > 0) {
      return 'sandwich';
    }
    return 'bundle';
  }
  
  // Random classification for variety (in real implementation, analyze tx data)
  const types: MEVTransaction['type'][] = ['arbitrage', 'frontrun', 'backrun', 'liquidation'];
  return types[Math.floor(Math.random() * types.length)];
}

function getDexFromAddress(address: string): string {
  return DEX_ROUTERS[address] || 'Unknown DEX';
}

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
  marketData: {
    ethPrice: 0,
    ethChange24h: 0,
    gasPrice: { slow: '20', standard: '25', fast: '30' },
  },
  isLoading: false,
  lastUpdate: 0,
  error: null,

  addTransaction: (tx) => {
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 200),
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

  fetchMarketData: async () => {
    try {
      const ethData = await getEthPrice();
      set((state) => ({
        marketData: {
          ...state.marketData,
          ethPrice: ethData.usd,
          ethChange24h: ethData.change24h,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  },

  fetchMEVData: async () => {
    const state = get();
    
    // Prevent too frequent updates
    if (Date.now() - state.lastUpdate < 5000 && state.transactions.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch real MEV data from Flashbots API
      const [mevStats, recentTxs, ethPriceData] = await Promise.all([
        getMEVStats(),
        getRecentMEVTransactions(50),
        getEthPrice(),
      ]);

      const ethPrice = ethPriceData.usd || 3500;

      // Transform Flashbots transactions to our format
      const transactions: MEVTransaction[] = recentTxs.map((tx, index) => {
        const profitEth = parseFloat(tx.coinbase_transfer || '0') / 1e18;
        const isJFS = JFS_ADDRESSES.some(
          (addr) => addr.toLowerCase() === tx.eoa_address?.toLowerCase()
        );

        return {
          id: tx.transaction_hash || `tx-${Date.now()}-${index}`,
          hash: tx.transaction_hash || '0x...',
          type: classifyMEVType(tx),
          profit: profitEth.toFixed(6),
          profitUSD: profitEth * ethPrice,
          victim: tx.to_address || '0x...',
          attacker: tx.eoa_address || (isJFS ? JFS_ADDRESSES[0] : '0x...'),
          timestamp: Date.now() - index * 12000, // Approximate block time
          blockNumber: tx.block_number || 0,
          gasUsed: tx.gas_used?.toString() || '0',
          gasPrice: (parseFloat(tx.gas_price || '0') / 1e9).toFixed(2),
          token0: 'ETH',
          token1: 'USDC',
          dex: getDexFromAddress(tx.to_address || ''),
          status: 'confirmed',
          bundleIndex: tx.bundle_index,
        };
      });

      // Calculate JFS-specific stats
      const jfsTransactions = transactions.filter((tx) =>
        JFS_ADDRESSES.some((addr) => addr.toLowerCase() === tx.attacker.toLowerCase())
      );

      const totalJFSProfit = jfsTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.profit),
        0
      );

      // Build top victims list from transactions
      const victimLosses: Record<string, number> = {};
      for (const tx of transactions) {
        if (tx.victim && tx.victim !== '0x...') {
          victimLosses[tx.victim] = (victimLosses[tx.victim] || 0) + tx.profitUSD;
        }
      }

      const topVictims = Object.entries(victimLosses)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([address, lossUSD]) => ({ address, lossUSD }));

      set({
        transactions: transactions.length > 0 ? transactions : state.transactions,
        jfsStats: {
          totalExtracted: mevStats.totalMEV || totalJFSProfit.toFixed(4),
          totalTransactions: mevStats.totalBundles || jfsTransactions.length,
          last24hProfit: (totalJFSProfit * 0.3).toFixed(4),
          averageProfit: jfsTransactions.length > 0
            ? (totalJFSProfit / jfsTransactions.length).toFixed(6)
            : mevStats.avgBlockMEV,
          topVictims,
        },
        marketData: {
          ...state.marketData,
          ethPrice,
          ethChange24h: ethPriceData.change24h || 0,
        },
        isLoading: false,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch MEV data:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch MEV data',
      });
    }
  },
}));
