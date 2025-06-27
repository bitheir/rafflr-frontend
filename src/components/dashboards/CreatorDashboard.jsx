import React, { useState } from 'react';
import { Plus, Package, Settings, Calendar, DollarSign } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { ethers } from 'ethers';
import RoyaltyAdjustmentComponent from '../RoyaltyAdjustmentComponent';
import CreatorRevenueWithdrawalComponent from '../CreatorRevenueWithdrawalComponent';

const CreateRaffleForm = () => {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: '',
    isPrized: false,
    customTicketPrice: '',
    prizeSource: 'new',
    prizeCollection: '',
    prizeType: 'erc721',
    prizeTokenId: '',
    amountPerWinner: '1',
    useMintableWorkflow: false,
    isEscrowed: false,
    // New collection fields
    collectionName: '',
    collectionSymbol: '',
    baseURI: '',
    maxSupply: '',
    royaltyPercentage: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !contracts.raffleDeployer) {
      alert('Please connect your wallet and ensure contracts are configured');
      return;
    }

    setLoading(true);
    try {
      const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
      const duration = parseInt(formData.duration) * 60; // Convert minutes to seconds
      const customTicketPrice = formData.customTicketPrice ? 
        ethers.utils.parseEther(formData.customTicketPrice) : 0;

      let result;

      if (formData.isPrized && formData.prizeSource === 'new') {
        // Create raffle with new collection
        result = await executeTransaction(
          contracts.raffleDeployer.createRaffle,
          formData.name,
          startTime,
          duration,
          parseInt(formData.ticketLimit),
          parseInt(formData.winnersCount),
          parseInt(formData.maxTicketsPerParticipant),
          formData.isPrized,
          customTicketPrice,
          false, // useMintableWorkflow
          ethers.constants.AddressZero, // prizeCollection
          0, // standard (ERC721)
          0, // prizeTokenId
          1, // amountPerWinner
          formData.collectionName,
          formData.collectionSymbol,
          formData.baseURI,
          address, // creator
          parseInt(formData.royaltyPercentage || '0'),
          ethers.constants.AddressZero, // royaltyRecipient (will be set by contract)
          parseInt(formData.maxSupply || formData.winnersCount)
        );
      } else if (formData.isPrized && formData.prizeSource === 'existing') {
        // Create raffle with existing collection
        const standard = formData.prizeType === 'erc721' ? 0 : 1;
        
        result = await executeTransaction(
          contracts.raffleDeployer.createRaffle,
          formData.name,
          startTime,
          duration,
          parseInt(formData.ticketLimit),
          parseInt(formData.winnersCount),
          parseInt(formData.maxTicketsPerParticipant),
          formData.isPrized,
          customTicketPrice,
          formData.useMintableWorkflow,
          formData.prizeCollection,
          standard,
          parseInt(formData.prizeTokenId),
          parseInt(formData.amountPerWinner),
          '', // collectionName
          '', // collectionSymbol
          '', // baseURI
          address, // creator
          0, // royaltyPercentage
          ethers.constants.AddressZero, // royaltyRecipient
          0 // maxSupply
        );
      } else {
        // Create non-prized raffle
        result = await executeTransaction(
          contracts.raffleDeployer.createRaffle,
          formData.name,
          startTime,
          duration,
          parseInt(formData.ticketLimit),
          parseInt(formData.winnersCount),
          parseInt(formData.maxTicketsPerParticipant),
          false, // isPrized
          0, // customTicketPrice
          false, // useMintableWorkflow
          ethers.constants.AddressZero, // prizeCollection
          0, // standard
          0, // prizeTokenId
          0, // amountPerWinner
          '', // collectionName
          '', // collectionSymbol
          '', // baseURI
          address, // creator
          0, // royaltyPercentage
          ethers.constants.AddressZero, // royaltyRecipient
          0 // maxSupply
        );
      }

      if (result.success) {
        alert(`Raffle created successfully! Transaction: ${result.hash}`);
        // Reset form
        setFormData({
          name: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          isPrized: false,
          customTicketPrice: '',
          prizeSource: 'new',
          prizeCollection: '',
          prizeType: 'erc721',
          prizeTokenId: '',
          amountPerWinner: '1',
          useMintableWorkflow: false,
          isEscrowed: false,
          collectionName: '',
          collectionSymbol: '',
          baseURI: '',
          maxSupply: '',
          royaltyPercentage: ''
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating raffle:', error);
      alert('Error creating raffle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Raffle Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ticket Limit</label>
            <input
              type="number"
              min="1"
              value={formData.ticketLimit}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Winners Count</label>
            <input
              type="number"
              min="1"
              value={formData.winnersCount}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Tickets Per Participant</label>
            <input
              type="number"
              min="1"
              value={formData.maxTicketsPerParticipant}
              onChange={(e) => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrized"
            checked={formData.isPrized}
            onChange={(e) => handleChange('isPrized', e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="isPrized" className="text-sm font-medium">Prized Raffle</label>
        </div>

        {formData.isPrized && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Price (ETH)</label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={formData.customTicketPrice}
                onChange={(e) => handleChange('customTicketPrice', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="Set 0 to use global ticket price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prize Source</label>
              <select
                value={formData.prizeSource}
                onChange={(e) => handleChange('prizeSource', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="new">Deploy New ERC721 Collection</option>
                <option value="existing">Use Existing Collection</option>
              </select>
            </div>

            {formData.prizeSource === 'new' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Collection Name</label>
                    <input
                      type="text"
                      value={formData.collectionName}
                      onChange={(e) => handleChange('collectionName', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Collection Symbol</label>
                    <input
                      type="text"
                      value={formData.collectionSymbol}
                      onChange={(e) => handleChange('collectionSymbol', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Base URI</label>
                  <input
                    type="text"
                    value={formData.baseURI}
                    onChange={(e) => handleChange('baseURI', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Supply</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxSupply}
                      onChange={(e) => handleChange('maxSupply', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Royalty Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.royaltyPercentage}
                      onChange={(e) => handleChange('royaltyPercentage', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.prizeSource === 'existing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prize Collection Address</label>
                    <input
                      type="text"
                      value={formData.prizeCollection}
                      onChange={(e) => handleChange('prizeCollection', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prize Type</label>
                    <select
                      value={formData.prizeType}
                      onChange={(e) => handleChange('prizeType', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="erc721">ERC721</option>
                      <option value="erc1155">ERC1155</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Token ID</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.prizeTokenId}
                      onChange={(e) => handleChange('prizeTokenId', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount Per Winner (for ERC1155)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.amountPerWinner}
                      onChange={(e) => handleChange('amountPerWinner', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useMintableWorkflow"
                      checked={formData.useMintableWorkflow}
                      onChange={(e) => handleChange('useMintableWorkflow', e.target.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="useMintableWorkflow" className="text-sm">
                      Use Mintable Workflow (only for internal ERC721)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isEscrowed"
                      checked={formData.isEscrowed}
                      onChange={(e) => handleChange('isEscrowed', e.target.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="isEscrowed" className="text-sm">Is Escrowed Prize</label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !connected}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {loading ? 'Creating...' : 'Create Raffle'}
        </button>
      </form>
    </div>
  );
};

const DeployERC1155Form = () => {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    uri: '',
    royaltyPercentage: '',
    royaltyRecipient: '',
    tokenId: '',
    maxSupply: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !contracts.nftFactory) {
      alert('Please connect your wallet and ensure contracts are configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.nftFactory.deployERC1155Collection,
        formData.uri,
        address, // owner
        parseInt(formData.royaltyPercentage),
        formData.royaltyRecipient || address,
        parseInt(formData.tokenId),
        parseInt(formData.maxSupply)
      );

      if (result.success) {
        alert(`ERC1155 collection deployed successfully! Transaction: ${result.hash}`);
        setFormData({
          uri: '',
          royaltyPercentage: '',
          royaltyRecipient: '',
          tokenId: '',
          maxSupply: ''
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deploying collection:', error);
      alert('Error deploying collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Base URI</label>
          <input
            type="text"
            value={formData.uri}
            onChange={(e) => handleChange('uri', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Royalty Percentage (max 10%)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.royaltyPercentage}
              onChange={(e) => handleChange('royaltyPercentage', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Royalty Recipient</label>
            <input
              type="text"
              value={formData.royaltyRecipient}
              onChange={(e) => handleChange('royaltyRecipient', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder={address}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Token ID</label>
            <input
              type="number"
              min="0"
              value={formData.tokenId}
              onChange={(e) => handleChange('tokenId', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Supply</label>
            <input
              type="number"
              min="1"
              value={formData.maxSupply}
              onChange={(e) => handleChange('maxSupply', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !connected}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Package className="h-4 w-4" />
          {loading ? 'Deploying...' : 'Deploy Collection'}
        </button>
      </form>
    </div>
  );
};

const CreatorDashboard = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to create raffles and manage collections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-muted-foreground">
          Create and manage your raffles and prize collections
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Raffle
        </h2>
        <CreateRaffleForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Deploy ERC1155 Prize Collection
        </h2>
        <DeployERC1155Form />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Manage Collection Royalties
        </h2>
        <RoyaltyAdjustmentComponent />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Withdraw Creator Revenue
        </h2>
        <CreatorRevenueWithdrawalComponent />
      </div>
    </div>
  );
};

export default CreatorDashboard;

