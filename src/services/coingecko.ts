// CoinGecko API for cryptocurrency prices and market data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CoinPrice {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
  };
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface GasPrice {
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
}

// Get simple price for multiple coins
export async function getSimplePrice(
  coinIds: string[],
  vsCurrencies: string[] = ['usd'],
  includeChange: boolean = true
): Promise<CoinPrice> {
  try {
    const params = new URLSearchParams({
      ids: coinIds.join(','),
      vs_currencies: vsCurrencies.join(','),
      include_24hr_change: includeChange.toString(),
      include_24hr_vol: 'true',
      include_market_cap: 'true',
    });

    const response = await fetch(`${COINGECKO_API}/simple/price?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return {};
  }
}

// Get ETH price
export async function getEthPrice(): Promise<{ usd: number; change24h: number }> {
  try {
    const data = await getSimplePrice(['ethereum']);
    return {
      usd: data.ethereum?.usd || 0,
      change24h: data.ethereum?.usd_24h_change || 0,
    };
  } catch (error) {
    console.error('Failed to get ETH price:', error);
    return { usd: 0, change24h: 0 };
  }
}

// Get market data for top coins
export async function getTopCoins(limit: number = 100): Promise<CoinMarketData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return [];
  }
}

// Get coin by ID
export async function getCoinById(coinId: string): Promise<any> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return null;
  }
}

// Get trending coins
export async function getTrendingCoins(): Promise<any[]> {
  try {
    const response = await fetch(`${COINGECKO_API}/search/trending`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return [];
  }
}

// Get global market data
export async function getGlobalData(): Promise<any> {
  try {
    const response = await fetch(`${COINGECKO_API}/global`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return null;
  }
}

// Get DeFi market data
export async function getDefiData(): Promise<any> {
  try {
    const response = await fetch(`${COINGECKO_API}/global/decentralized_finance_defi`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return null;
  }
}
