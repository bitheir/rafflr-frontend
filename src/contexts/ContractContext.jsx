import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { contractABIs } from '../contracts/contractABIs';
import { CONTRACT_ADDRESSES } from '../constants';

const ContractContext = createContext();

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider = ({ children }) => {
  const { signer, provider, connected } = useWallet();
  const [contracts, setContracts] = useState({});

  // Initialize contracts when wallet is connected and addresses are available
  useEffect(() => {
    if (connected && signer) {
      initializeContracts();
    } else {
      setContracts({});
    }
  }, [connected, signer]);

  const initializeContracts = () => {
    const newContracts = {};

    try {
      // Initialize main contracts
      if (CONTRACT_ADDRESSES.raffleManager) {
        newContracts.raffleManager = new ethers.Contract(
          CONTRACT_ADDRESSES.raffleManager,
          contractABIs.raffleManager,
          signer
        );
      }

      if (CONTRACT_ADDRESSES.raffleDeployer) {
        newContracts.raffleDeployer = new ethers.Contract(
          CONTRACT_ADDRESSES.raffleDeployer,
          contractABIs.raffleDeployer,
          signer
        );
      }

      if (CONTRACT_ADDRESSES.revenueManager) {
        newContracts.revenueManager = new ethers.Contract(
          CONTRACT_ADDRESSES.revenueManager,
          contractABIs.revenueManager,
          signer
        );
      }

      if (CONTRACT_ADDRESSES.nftFactory) {
        newContracts.nftFactory = new ethers.Contract(
          CONTRACT_ADDRESSES.nftFactory,
          contractABIs.nftFactory,
          signer
        );
      }

      setContracts(newContracts);
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  };

  // Create contract instance for a specific address
  const getContractInstance = (address, abiType) => {
    if (!address || !signer) return null;
    
    try {
      return new ethers.Contract(address, contractABIs[abiType], signer);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      return null;
    }
  };

  // Helper function to handle contract transactions
  const executeTransaction = async (contractMethod, ...args) => {
    try {
      const tx = await contractMethod(...args);
      const receipt = await tx.wait();
      return { success: true, receipt, hash: tx.hash };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to handle contract calls (view functions)
  const executeCall = async (contractMethod, ...args) => {
    try {
      const result = await contractMethod(...args);
      return { success: true, result };
    } catch (error) {
      console.error('Contract call failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    contracts,
    getContractInstance,
    executeTransaction,
    executeCall
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};


