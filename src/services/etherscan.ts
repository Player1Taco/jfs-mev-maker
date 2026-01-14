// Etherscan API service for real blockchain data
const ETHERSCAN_API_KEY = 'YourApiKeyToken'; // Free tier works for basic queries
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
    return data.status === '1' ? data.result : [];
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
    return data.status === '1' ? data.result : [];
  } catch (error) {
    console.error('Etherscan API error:', error);
    return [];
  }
}

export async function getTokenTransfers(
  address: string
): Promise<any[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    return data.status === '1' ? data.result : [];
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
    return data.status === '1' ? data.result : { SafeGasPrice: '0', ProposeGasPrice: '0', FastGasPrice: '0' };
  } catch (error) {
    console.error('Etherscan API error:', error);
    return { SafeGasPrice: '0', ProposeGasPrice: '0', FastGasPrice: '0' };
  }
}

export async function getEthPrice(): Promise<{ ethbtc: string; ethusd: string }> {
  try {
    const response = await fetch(
      `${BASE_URL}?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`
    );
    const data = await response.json();
    return data.status === '1' ? data.result : { ethbtc: '0', ethusd: '0' };
  } catch (error) {
    console.error('Etherscan API error:', error);
    return { ethbtc: '0', ethusd: '0' };
  }
}
