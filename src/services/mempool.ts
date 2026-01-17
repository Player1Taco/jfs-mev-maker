// Mempool monitoring service using public RPC endpoints
import { ethers } from 'ethers';

export interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasLimit: string;
  data: string;
  nonce: number;
  timestamp: number;
  type: number;
}

// Public RPC endpoints for mempool monitoring
const PUBLIC_RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
];

export class MempoolMonitor {
  private provider: ethers.JsonRpcProvider | null = null;
  private callbacks: ((tx: PendingTransaction) => void)[] = [];
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private seenTxHashes: Set<string> = new Set();
  private currentEndpointIndex = 0;

  constructor() {
    this.initProvider();
  }

  private async initProvider() {
    // Try each endpoint until one works
    for (let i = 0; i < PUBLIC_RPC_ENDPOINTS.length; i++) {
      const endpoint = PUBLIC_RPC_ENDPOINTS[(this.currentEndpointIndex + i) % PUBLIC_RPC_ENDPOINTS.length];
      try {
        const provider = new ethers.JsonRpcProvider(endpoint);
        await provider.getBlockNumber(); // Test connection
        this.provider = provider;
        this.currentEndpointIndex = (this.currentEndpointIndex + i) % PUBLIC_RPC_ENDPOINTS.length;
        console.log(`Connected to RPC: ${endpoint}`);
        return;
      } catch (error) {
        console.warn(`Failed to connect to ${endpoint}:`, error);
      }
    }
    console.error('Failed to connect to any RPC endpoint');
  }

  async start() {
    if (this.isRunning) return;

    if (!this.provider) {
      await this.initProvider();
    }

    if (!this.provider) {
      console.error('No provider available');
      return;
    }

    this.isRunning = true;
    this.seenTxHashes.clear();

    // Poll for pending transactions
    this.pollInterval = setInterval(async () => {
      try {
        await this.pollPendingTransactions();
      } catch (error) {
        console.error('Error polling pending transactions:', error);
        // Try to reconnect
        await this.initProvider();
      }
    }, 2000); // Poll every 2 seconds
  }

  private async pollPendingTransactions() {
    if (!this.provider) return;

    try {
      // Get the latest block to find recent transactions
      const block = await this.provider.getBlock('pending', true);
      
      if (block && block.transactions) {
        for (const txHash of block.transactions) {
          if (typeof txHash === 'string' && !this.seenTxHashes.has(txHash)) {
            this.seenTxHashes.add(txHash);
            
            // Keep set size manageable
            if (this.seenTxHashes.size > 1000) {
              const iterator = this.seenTxHashes.values();
              for (let i = 0; i < 500; i++) {
                const value = iterator.next().value;
                if (value) this.seenTxHashes.delete(value);
              }
            }

            try {
              const tx = await this.provider!.getTransaction(txHash);
              if (tx) {
                const pendingTx: PendingTransaction = {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to || '',
                  value: ethers.formatEther(tx.value),
                  gasPrice: tx.gasPrice ? ethers.formatGwei(tx.gasPrice) : '0',
                  maxFeePerGas: tx.maxFeePerGas ? ethers.formatGwei(tx.maxFeePerGas) : undefined,
                  maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? ethers.formatGwei(tx.maxPriorityFeePerGas) : undefined,
                  gasLimit: tx.gasLimit.toString(),
                  data: tx.data,
                  nonce: tx.nonce,
                  timestamp: Date.now(),
                  type: tx.type || 0,
                };

                this.callbacks.forEach((cb) => cb(pendingTx));
              }
            } catch (error) {
              // Transaction might have been mined already
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pending block:', error);
    }
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    this.seenTxHashes.clear();
  }

  onTransaction(callback: (tx: PendingTransaction) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  isActive() {
    return this.isRunning;
  }

  async getGasEstimate(): Promise<{
    slow: string;
    standard: string;
    fast: string;
  }> {
    if (!this.provider) {
      await this.initProvider();
    }

    if (!this.provider) {
      return { slow: '20', standard: '25', fast: '30' };
    }

    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice ? Number(ethers.formatGwei(feeData.gasPrice)) : 25;
      
      return {
        slow: Math.floor(gasPrice * 0.8).toString(),
        standard: Math.floor(gasPrice).toString(),
        fast: Math.floor(gasPrice * 1.2).toString(),
      };
    } catch (error) {
      console.error('Error getting gas estimate:', error);
      return { slow: '20', standard: '25', fast: '30' };
    }
  }
}

// Singleton instance
export const mempoolMonitor = new MempoolMonitor();
