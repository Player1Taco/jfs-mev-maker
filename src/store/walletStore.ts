import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  chainName: string;
  isConnecting: boolean;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon',
  42161: 'Arbitrum One',
  10: 'Optimism',
  8453: 'Base',
};

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  balance: '0',
  chainId: null,
  chainName: '',
  isConnecting: false,
  isConnected: false,
  provider: null,
  signer: null,
  error: null,

  connect: async () => {
    if (typeof window.ethereum === 'undefined') {
      set({ error: 'Please install MetaMask or another Web3 wallet' });
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);
      const chainId = Number(network.chainId);

      set({
        address: accounts[0],
        balance: ethers.formatEther(balance),
        chainId,
        chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
        provider,
        signer,
        isConnecting: false,
        isConnected: true,
        error: null,
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          get().disconnect();
        } else {
          const currentProvider = get().provider;
          if (currentProvider) {
            const balance = await currentProvider.getBalance(newAccounts[0]);
            set({
              address: newAccounts[0],
              balance: ethers.formatEther(balance),
            });
          }
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', async (newChainId: string) => {
        const chainId = parseInt(newChainId, 16);
        const currentProvider = get().provider;
        const currentAddress = get().address;
        
        if (currentProvider && currentAddress) {
          const balance = await currentProvider.getBalance(currentAddress);
          set({
            chainId,
            chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
            balance: ethers.formatEther(balance),
          });
        }
      });

      // Listen for disconnect
      window.ethereum.on('disconnect', () => {
        get().disconnect();
      });

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    }
  },

  disconnect: () => {
    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners?.('accountsChanged');
      window.ethereum.removeAllListeners?.('chainChanged');
      window.ethereum.removeAllListeners?.('disconnect');
    }

    set({
      address: null,
      balance: '0',
      chainId: null,
      chainName: '',
      provider: null,
      signer: null,
      isConnected: false,
      error: null,
    });
  },

  updateBalance: async () => {
    const { provider, address } = get();
    if (provider && address) {
      try {
        const balance = await provider.getBalance(address);
        set({ balance: ethers.formatEther(balance) });
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    }
  },

  switchChain: async (chainId: number) => {
    if (!window.ethereum) {
      set({ error: 'No wallet connected' });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added to wallet
      if (error.code === 4902) {
        set({ error: 'Please add this network to your wallet first' });
      } else {
        set({ error: error.message || 'Failed to switch chain' });
      }
    }
  },
}));
