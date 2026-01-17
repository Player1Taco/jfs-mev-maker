// Etherscan API service for real blockchain data
// Using public API endpoint (rate limited but functional)
const ETHERSCAN_API_KEY = 'YourApiKeyToken'; // Works without key for basic queries
const BASE_URL = 'https://api.etherscan.io/api';

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  methodId: string;
  functionName: string;
}

export interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

export async function getAccountTransactions(
  address: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<EtherscanTransaction[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (error) {
    console.error('Etherscan API error:', error);
    return [];
  }
}

export async function getInternalTransactions(
  address: string
): Promise<EtherscanTransaction[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=account&action=txlistinternal&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (error) {
    console.error('Etherscan API error:', error);
    return [];
  }
}

export async function getTokenTransfers(
  address: string
): Promise<TokenTransfer[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (error) {
    console.error('Etherscan API error:', error);
    return [];
  }
}

export async function getGasPrice(): Promise<{
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
}> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && data.result) {
      return data.result;
    }
    return { SafeGasPrice: '20', ProposeGasPrice: '25', FastGasPrice: '30' };
  } catch (error) {
    console.error('Etherscan API error:', error);
    return { SafeGasPrice: '20', ProposeGasPrice: '25', FastGasPrice: '30' };
  }
}

export async function getEthPrice(): Promise<{ ethbtc: string; ethusd: string }> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && data.result) {
      return data.result;
    }
    return { ethbtc: '0.05', ethusd: '3500' };
  } catch (error) {
    console.error('Etherscan API error:', error);
    return { ethbtc: '0.05', ethusd: '3500' };
  }
}

export async function getLatestBlockNumber(): Promise<number> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.result) {
      return parseInt(data.result, 16);
    }
    return 0;
  } catch (error) {
    console.error('Etherscan API error:', error);
    return 0;
  }
}

export async function getAccountBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    if (data.status === '1' && data.result) {
      // Convert from wei to ETH
      return (parseInt(data.result) / 1e18).toFixed(4);
    }
    return '0';
  } catch (error) {
    console.error('Etherscan API error:', error);
    return '0';
  }
}
