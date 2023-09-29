import Chain from 'src/models/chain'

// export const gnosisChain: Chain = {
//   id: '0x64',
//   token: 'xDai',
//   shortName: 'gno',
//   label: 'Gnosis Chain',
//   rpcUrl: 'https://rpc.gnosischain.com',
//   blockExplorerUrl: 'https://gnosisscan.io',
//   color: '#3e6957',
//   transactionServiceUrl: 'https://safe-transaction-gnosis-chain.safe.global',
//   isStripePaymentsEnabled: false,
//   isMoneriumPaymentsEnabled: false
// }

export const goerliChain: Chain = {
  id: '0x5',
  token: 'gETH',
  label: 'Görli',
  shortName: 'gor',
  rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  blockExplorerUrl: 'https://goerli.etherscan.io',
  color: '#fbc02d',
  transactionServiceUrl: 'https://safe-transaction-goerli.safe.global',
  isStripePaymentsEnabled: false,
  isMoneriumPaymentsEnabled: true,
  bridgeChainId: 'ethereum',
  bridgeToken: {
    address: '0x254d06f33bDc5b8ee05b2ea472107E300226659A',
    symbol: 'aUSDC'
  }
}

// export const mainnetChain: Chain = {
//   id: '0x1',
//   token: 'ETH',
//   label: 'Ethereum',
//   shortName: 'eth',
//   rpcUrl: 'https://cloudflare-eth.com',
//   blockExplorerUrl: 'https://etherscan.io',
//   color: '#DDDDDD',
//   transactionServiceUrl: 'https://safe-transaction-mainnet.safe.global',
//   isStripePaymentsEnabled: false,
//   isMoneriumPaymentsEnabled: false
// }

// export const polygonChain: Chain = {
//   id: '0x89',
//   token: 'matic',
//   shortName: 'matic',
//   label: 'Polygon',
//   rpcUrl: 'https://polygon-rpc.com',
//   blockExplorerUrl: 'https://polygonscan.com',
//   color: '#8248E5',
//   transactionServiceUrl: 'https://safe-transaction-polygon.safe.global',
//   isStripePaymentsEnabled: false,
//   isMoneriumPaymentsEnabled: false
// }

export const mumbaiChain: Chain = {
  id: '0x13881',
  token: 'matic',
  shortName: 'matic',
  label: 'Mumbai',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
  blockExplorerUrl: 'https://mumbai.polygonscan.com',
  color: '#8248E5',
  isStripePaymentsEnabled: true,
  isMoneriumPaymentsEnabled: false,
  faucetUrl: 'https://mumbaifaucet.com/',
  bridgeChainId: 'polygon',
  bridgeToken: {
    address: '0x2c852e740B62308c46DD29B982FBb650D063Bd07',
    symbol: 'aUSDC'
  }
}

// export const avalanceFujiChain: Chain = {
//   id: '0xa869',
//   token: 'AVAX',
//   shortName: 'AVAX',
//   label: 'Avalanche Fuji',
//   rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
//   blockExplorerUrl: 'https://cchain.explorer.avax-test.network',
//   // fill red
//   color: '#f44336',
//   isStripePaymentsEnabled: false,
//   isMoneriumPaymentsEnabled: false
// }

const chains: Chain[] = [
  // gnosisChain,
  goerliChain,
  // mainnetChain,
  mumbaiChain
  // polygonChain,
  // avalanceFujiChain
]

export const initialChain = goerliChain

export const initialDestinationChain = mumbaiChain

export default chains
