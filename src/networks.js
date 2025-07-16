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
      raffleManager: '0x76ea083E10F4BcC63191a1c609DB3E59C46e9bBe',
      raffleDeployer: '0xD08A9598803522b6b7d80963bF94829f68A0441e',
      revenueManager: '0xF19a11A3F8211bcB9381bFb367cE937c63e7E478',
      nftFactory: '0x586FE8ADd022B0aafE86Fb42e8d007Cd89bDfE97'
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
      raffleManager: '0xAD93510aCFb38b88B9898AD3cD600C8a3eb741AF',
      raffleDeployer: '0x1Ef2c682596c74460cF5585Fc886f4C598050286',
      revenueManager: '0x460Fd5E3CBCD43B0150983114b8f402114D3E28C',
      nftFactory: '0x99cC5Dd49A4096A461cC8905Dbd519Ac9A83E557'
    }
  },
  11155111: {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io',
    explorer: 'https://sepolia.etherscan.io',
    contractAddresses: {
      raffleManager: '0x82DEB79fE0a2380aB2799F8675Af296A1133F40F',
      raffleDeployer: '0xa8BDbf8bBFa823a0058A2830Ce88201A24b033cB',
      revenueManager: '0xa22a2105fBe227Db05FD0D76ccbC317A53EC9aC5',
      nftFactory: '0x1e4181Bd5940cB1BBdB8FFf1fd467F79C905c029'
    }
  },
  11155420: {
    name: 'OP Sepolia Testnet',
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
    contractAddresses: {
      raffleManager: '0x95F4C0d1b4ED8fA971473B038adD95f903Be1BF1',
      raffleDeployer: '0x5C2a42Bbb38e7f2fE7Cb59F0f917497FFdeD8055',
      revenueManager: '0xb36535a55bdD756A08Cc7d3978BB78F860B49c04',
      nftFactory: '0xFb3cD95C572E310FEd736AE61C84685056Edb735'
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
      raffleManager: '0x6c1b11A6070128A703Fa0a2814243c8cF17Dc28f',
      raffleDeployer: '0x6D1Cc2eF5e1A49039253b782D0e4772d9b6FA012',
      revenueManager: '0x34899A2ddF8EA3923964251d967ABFdF0b6af9d2',
      nftFactory: '0x1B71Ee19F1E9E910dEB53C0bBEcb06d238662C4C'
    }
  },
}; 