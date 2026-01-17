// DEX Screener API for real-time token and pair data
const DEXSCREENER_API = 'https://api.dexscreener.com';

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  pairCreatedAt: number;
}

export interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: {
    type: string;
    label: string;
    url: string;
  }[];
}

// Get pairs by token address
export async function getPairsByToken(tokenAddress: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/latest/dex/tokens/${tokenAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return [];
  }
}

// Get pair by address
export async function getPairByAddress(chainId: string, pairAddress: string): Promise<DexPair | null> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/latest/dex/pairs/${chainId}/${pairAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.pair || null;
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return null;
  }
}

// Search for pairs
export async function searchPairs(query: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/latest/dex/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return [];
  }
}

// Get token profiles (boosted tokens)
export async function getTokenProfiles(): Promise<TokenProfile[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/token-profiles/latest/v1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return [];
  }
}

// Get trending/boosted tokens
export async function getBoostedTokens(): Promise<TokenProfile[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/token-boosts/latest/v1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return [];
  }
}

// Get top boosted tokens
export async function getTopBoostedTokens(): Promise<TokenProfile[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/token-boosts/top/v1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return [];
  }
}

// Get orders for a token (paid orders)
export async function getTokenOrders(chainId: string, tokenAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`${DEXSCREENER_API}/orders/v1/${chainId}/${tokenAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('DEX Screener API error:', error);
    return [];
  }
}
