export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  10: {
    name: 'OP Mainnet',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  56: {
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc.blockrazor.xyz',
    explorer: 'https://bscscan.com',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  97: {
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
    explorer: 'https://testnet.bscscan.com',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  43113: {
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://avalanche-fuji.drpc.org',
    explorer: 'https://testnet.snowscan.xyz',
    contractAddresses: {
      raffleManager: '0x8a2E3103455Eb95e56D3413d56F779a0f0812448',
      raffleDeployer: '0x00bCe62355Ee88320dFBac2D4d404e39dc22ECCf',
      revenueManager: '0xba0cE105F4095a90aC455e61E45732673Bc11db5',
      nftFactory: '0xDD88bb2ddC61bB6ecB7523ede6A69f4210D9efcd'
    }
  },
  43114: {
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://avalanche.drpc.org',
    explorer: 'https://snowscan.xyz',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  8453: {
    name: 'Base Mainnet',
    rpcUrl: 'https://base.drpc.org',
    explorer: 'https://basescan.org',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  84532: {
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.basescan.org',
    contractAddresses: {
      raffleManager: '0xF55fA638d7a57F6df6eB5085C967b3D92Cf0036b',
      raffleDeployer: '0x7e90F6e99094E3A7fee807171ef68688cb1046E7',
      revenueManager: '0x88B59DE2b0de6CCaB96D3cCA1Ca4F8C3dCe661E6',
      nftFactory: '0x9bC3241118A0FE86B1c41D2D47E8F83954b8EeD4'
    }
  },
  11155111: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io',
    explorer: 'https://sepolia.etherscan.io',
    contractAddresses: {
      raffleManager: '0x3daF166fbb2e1aC7b69E0918e8Ffd3Bc20E052E0',
      raffleDeployer: '0xBd930204282679EAf9fA5FCb11CdfD8dcD307076',
      revenueManager: '0x449E0d165603885df26c79d769436f4469570B4f',
      nftFactory: '0x615dDD4747526D19462c546047ef7EC2fF838cb3'
    }
  },
  11155420: {
    name: 'OP Sepolia Testnet',
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
    contractAddresses: {
      raffleManager: '0x2C94b1d6AeC9bDA276636adac485230461EBc2A1',
      raffleDeployer: '0xF19a11A3F8211bcB9381bFb367cE937c63e7E478',
      revenueManager: '0xD0aCe301B4274868b98918788d08893Cd3238B80',
      nftFactory: '0xF0763B46Ea63C8F1c8d4115F70E6680981250FD0'
    }
  },
  2020: {
    name: 'Ronin Mainnet',
    rpcUrl: 'https://ronin.drpc.org',
    explorer: 'https://app.roninchain.com/',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  2021: {
    name: 'Ronin Saigon Testnet',
    rpcUrl: 'https://saigon-testnet.roninchain.com/rpc',
    explorer: 'https://saigon-app.roninchain.com/explorer',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  42161: {
    name: 'Arbitrum One',
    rpcUrl: 'https://arbitrum.drpc.org',
    explorer: 'https://arbiscan.io',
    contractAddresses: {
      raffleManager: '0x...',
      raffleDeployer: '0x...',
      revenueManager: '0x...',
      nftFactory: '0x...'
    }
  },
  421614: {
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
    explorer: 'https://sepolia.arbiscan.io',
    contractAddresses: {
      raffleManager: '0x55E92864195037379aA39C3a316fd5aaC233f789',
      raffleDeployer: '0x6E8eEB11cd5Ce7AfBb1d84ea2A5B580B0af15437',
      revenueManager: '0xA0C32b7bEC6ADE839cB2eBDae508b14fd63628d2',
      nftFactory: '0x7B514C19f51fABdB327969458e571527249DF4E2'
    }
  },
}; 