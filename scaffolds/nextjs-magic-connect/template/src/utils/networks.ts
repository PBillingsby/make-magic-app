export enum Network {
  POLYGON_MUMBAI = 'polygon-mumbai',
  POLYGON = 'polygon',
  ETHEREUM_GOERLI = 'ethereum-goerli',
  ETHEREUM = 'ethereum',
}

export const getNetworkUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 'https://polygon-rpc.com/';
    case Network.POLYGON_MUMBAI:
      return 'https://rpc-mumbai.maticvigil.com/';
    case Network.ETHEREUM_GOERLI:
      return 'https://eth-goerli.g.alchemy.com/v2/demo';
    case Network.ETHEREUM:
      return 'https://eth-mainnet.g.alchemy.com/v2/demo';
    default:
      throw new Error('Network not supported');
  }
};

export const getChainId = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 137;
    case Network.POLYGON_MUMBAI:
      return 80001;
    case Network.ETHEREUM_GOERLI:
      return 5;
    case Network.ETHEREUM:
      return 1;
  }
};

export const getNetworkToken = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_MUMBAI:
    case Network.POLYGON:
      return 'MATIC';
    case Network.ETHEREUM:
    case Network.ETHEREUM_GOERLI:
      return 'ETH';
  }
};

export const getFaucetUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_MUMBAI:
      return 'https://faucet.polygon.technology/';
    case Network.ETHEREUM_GOERLI:
      return 'https://goerlifaucet.com/';
  }
};

export const getNetworkName = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 'Polygon (Mainnet)';
    case Network.POLYGON_MUMBAI:
      return 'Polygon (Mumbai)';
    case Network.ETHEREUM_GOERLI:
      return 'Ethereum (Goerli)';
    case Network.ETHEREUM:
      return 'Ethereum (Mainnet)';
  }
};
