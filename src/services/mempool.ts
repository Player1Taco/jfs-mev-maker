// Mempool monitoring service
import { ethers } from 'ethers';

export interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  data: string;
  nonce: number;
  timestamp: number;
}

export class MempoolMonitor {
  private provider: ethers.WebSocketProvider | null = null;
  private callbacks: ((tx: PendingTransaction) => void)[] = [];
  private isRunning = false;

  constructor(private wsUrl: string = 'wss://eth-mainnet.g.alchemy.com/v2/demo') {}

  async start() {
    if (this.isRunning) return;

    try {
      this.provider = new ethers.WebSocketProvider(this.wsUrl);
      this.isRunning = true;

      this.provider.on('pending', async (txHash) => {
        try {
          const tx = await this.provider!.getTransaction(txHash);
          if (tx) {
            const pendingTx: PendingTransaction = {
              hash: tx.hash,
              from: tx.from,
              to: tx.to || '',
              value: ethers.formatEther(tx.value),
              gasPrice: ethers.formatGwei(tx.gasPrice || 0n),
              gasLimit: tx.gasLimit.toString(),
              data: tx.data,
              nonce: tx.nonce,
              timestamp: Date.now(),
            };

            this.callbacks.forEach((cb) => cb(pendingTx));
          }
        } catch (error) {
          // Transaction might have been mined already
        }
      });
    } catch (error) {
      console.error('Failed to start mempool monitor:', error);
      this.isRunning = false;
    }
  }

  stop() {
    if (this.provider) {
      this.provider.removeAllListeners();
      this.provider = null;
    }
    this.isRunning = false;
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
}

// Singleton instance
export const mempoolMonitor = new MempoolMonitor();
