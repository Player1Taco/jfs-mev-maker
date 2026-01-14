import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  balance: '0',
  chainId: null,
  isConnecting: false,
  provider: null,
  signer: null,

  connect: async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    set({ isConnecting: true });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      // Check if on Ethereum Mainnet
      if (network.chainId !== 1n) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (switchError: any) {
          console.error('Failed to switch to Ethereum Mainnet:', switchError);
        }
      }

      set({
        address: accounts[0],
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        provider,
        signer,
        isConnecting: false,
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnect();
        } else {
          const balance = await provider.getBalance(accounts[0]);
          set({
            address: accounts[0],
            balance: ethers.formatEther(balance),
          });
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    set({
      address: null,
      balance: '0',
      chainId: null,
      provider: null,
      signer: null,
    });
  },

  updateBalance: async () => {
    const { provider, address } = get();
    if (provider && address) {
      const balance = await provider.getBalance(address);
      set({ balance: ethers.formatEther(balance) });
    }
  },
}));
