import React, { useState } from 'react';
import { Shield, Settings, DollarSign, Clock, Users, Package } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { ethers } from 'ethers';

const ConfigSection = ({ title, icon: Icon, children }) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const VRFConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subscriptionId: '',
    coordinator: '',
    keyHash: '',
    gasLimit: ''
  });

  const handleSave = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.raffleManager.setVRFParams,
        formData.coordinator,
        formData.keyHash,
        parseInt(formData.gasLimit)
      );

      if (result.success) {
        alert('VRF configuration saved successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving VRF config:', error);
      alert('Error saving VRF config: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Subscription ID</label>
        <input
          type="text"
          value={formData.subscriptionId}
          onChange={(e) => setFormData(prev => ({ ...prev, subscriptionId: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">VRF Coordinator</label>
        <input
          type="text"
          value={formData.coordinator}
          onChange={(e) => setFormData(prev => ({ ...prev, coordinator: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Key Hash</label>
        <input
          type="text"
          value={formData.keyHash}
          onChange={(e) => setFormData(prev => ({ ...prev, keyHash: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Gas Limit</label>
        <input
          type="number"
          value={formData.gasLimit}
          onChange={(e) => setFormData(prev => ({ ...prev, gasLimit: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save VRF Configuration'}
      </button>
    </div>
  );
};

const TicketLimitsConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    minTickets: '',
    minNonPrized: '',
    maxTickets: '',
    maxPerParticipant: ''
  });

  const handleSave = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all([
        executeTransaction(
          contracts.raffleManager.setTicketLimits,
          parseInt(formData.minTickets),
          parseInt(formData.maxTickets)
        ),
        executeTransaction(
          contracts.raffleManager.setMinTicketLimitNonPrized,
          parseInt(formData.minNonPrized)
        ),
        executeTransaction(
          contracts.raffleManager.setMaxTicketsPerParticipant,
          parseInt(formData.maxPerParticipant)
        )
      ]);

      const allSuccessful = results.every(result => result.success);
      if (allSuccessful) {
        alert('Ticket limits saved successfully!');
      } else {
        throw new Error('Some transactions failed');
      }
    } catch (error) {
      console.error('Error saving ticket limits:', error);
      alert('Error saving ticket limits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Tickets</label>
          <input
            type="number"
            min="1"
            value={formData.minTickets}
            onChange={(e) => setFormData(prev => ({ ...prev, minTickets: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Tickets</label>
          <input
            type="number"
            min="1"
            value={formData.maxTickets}
            onChange={(e) => setFormData(prev => ({ ...prev, maxTickets: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Non-Prized</label>
          <input
            type="number"
            min="1"
            value={formData.minNonPrized}
            onChange={(e) => setFormData(prev => ({ ...prev, minNonPrized: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Per Participant</label>
          <input
            type="number"
            min="1"
            value={formData.maxPerParticipant}
            onChange={(e) => setFormData(prev => ({ ...prev, maxPerParticipant: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Ticket Limits'}
      </button>
    </div>
  );
};

const FeeConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    protocolFee: '',
    creationFee: '',
    refundablePercentage: '',
    ticketPrice: ''
  });

  const handleSave = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all([
        executeTransaction(
          contracts.raffleManager.setProtocolFee,
          parseInt(formData.protocolFee)
        ),
        executeTransaction(
          contracts.raffleManager.setCreationFeePercentage,
          parseInt(formData.creationFee)
        ),
        executeTransaction(
          contracts.raffleManager.setRefundablePercentage,
          parseInt(formData.refundablePercentage)
        ),
        executeTransaction(
          contracts.raffleManager.setGlobalTicketPrice,
          ethers.utils.parseEther(formData.ticketPrice)
        )
      ]);

      const allSuccessful = results.every(result => result.success);
      if (allSuccessful) {
        alert('Fee configuration saved successfully!');
      } else {
        throw new Error('Some transactions failed');
      }
    } catch (error) {
      console.error('Error saving fee config:', error);
      alert('Error saving fee config: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Protocol Fee (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.protocolFee}
            onChange={(e) => setFormData(prev => ({ ...prev, protocolFee: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Creation Fee (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.creationFee}
            onChange={(e) => setFormData(prev => ({ ...prev, creationFee: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Refundable Percentage (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.refundablePercentage}
            onChange={(e) => setFormData(prev => ({ ...prev, refundablePercentage: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Global Ticket Price (ETH)</label>
          <input
            type="number"
            min="0"
            step="0.001"
            value={formData.ticketPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Fee Configuration'}
      </button>
    </div>
  );
};

const DurationConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    minDuration: '',
    maxDuration: ''
  });

  const handleSave = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.raffleManager.setDurationLimits,
        parseInt(formData.minDuration),
        parseInt(formData.maxDuration)
      );

      if (result.success) {
        alert('Duration limits saved successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving duration limits:', error);
      alert('Error saving duration limits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={formData.minDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, minDuration: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={formData.maxDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Duration Limits'}
      </button>
    </div>
  );
};

const PrizedRafflesConfiguration = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prizedRafflesEnabled: false,
    allowExistingCollections: false
  });

  const handleSave = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all([
        executeTransaction(
          contracts.raffleManager.togglePrizedRaffles,
          formData.prizedRafflesEnabled
        ),
        executeTransaction(
          contracts.raffleManager.toggleAllowExistingCollections,
          formData.allowExistingCollections
        )
      ]);

      const allSuccessful = results.every(result => result.success);
      if (allSuccessful) {
        alert('Prized raffles configuration saved!');
      } else {
        throw new Error('Some transactions failed');
      }
    } catch (error) {
      console.error('Error saving prized raffles config:', error);
      alert('Error saving prized raffles config: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="prizedRafflesEnabled"
            checked={formData.prizedRafflesEnabled}
            onChange={(e) => setFormData(prev => ({ ...prev, prizedRafflesEnabled: e.target.checked }))}
            className="rounded border-border"
          />
          <label htmlFor="prizedRafflesEnabled" className="text-sm font-medium">
            Enable Prized Raffles
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowExistingCollections"
            checked={formData.allowExistingCollections}
            onChange={(e) => setFormData(prev => ({ ...prev, allowExistingCollections: e.target.checked }))}
            className="rounded border-border"
          />
          <label htmlFor="allowExistingCollections" className="text-sm font-medium">
            Allow Existing Collections
          </label>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
};

const AccessManagement = () => {
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [collectionData, setCollectionData] = useState({
    address: '',
    isInternal: false
  });
  const [operatorData, setOperatorData] = useState({
    address: ''
  });

  const handleAddCollection = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.raffleManager.addExternalCollection,
        collectionData.address
      );

      if (result.success) {
        alert('Collection added to whitelist!');
        setCollectionData({ address: '', isInternal: false });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding collection:', error);
      alert('Error adding collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.raffleManager.setOperator,
        operatorData.address,
        true
      );

      if (result.success) {
        alert('Operator added successfully!');
        setOperatorData({ address: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding operator:', error);
      alert('Error adding operator: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOperator = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.raffleManager.setOperator,
        operatorData.address,
        false
      );

      if (result.success) {
        alert('Operator removed successfully!');
        setOperatorData({ address: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error removing operator:', error);
      alert('Error removing operator: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRevenue = async () => {
    if (!contracts.revenueManager) {
      alert('RevenueManager contract not configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(contracts.revenueManager.withdraw);

      if (result.success) {
        alert('Revenue withdrawn successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error withdrawing revenue:', error);
      alert('Error withdrawing revenue: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Whitelist Collections</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Collection Address</label>
            <input
              type="text"
              value={collectionData.address}
              onChange={(e) => setCollectionData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isInternal"
              checked={collectionData.isInternal}
              onChange={(e) => setCollectionData(prev => ({ ...prev, isInternal: e.target.checked }))}
              className="rounded border-border"
            />
            <label htmlFor="isInternal" className="text-sm">Is Internal Collection</label>
          </div>
          <button
            onClick={handleAddCollection}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Add Collection
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Operator Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Operator Address</label>
            <input
              type="text"
              value={operatorData.address}
              onChange={(e) => setOperatorData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddOperator}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={handleRemoveOperator}
              disabled={loading}
              className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Management</h3>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground">Available Revenue</div>
            <div className="text-lg font-semibold">12.75 ETH</div>
          </div>
          <button
            onClick={handleWithdrawRevenue}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Withdraw Revenue
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to access admin functions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Configure and manage the Rafflhub settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigSection title="VRF Configuration" icon={Settings}>
          <VRFConfiguration />
        </ConfigSection>

        <ConfigSection title="Ticket Limits" icon={Users}>
          <TicketLimitsConfiguration />
        </ConfigSection>

        <ConfigSection title="Fee Configuration" icon={DollarSign}>
          <FeeConfiguration />
        </ConfigSection>

        <ConfigSection title="Duration Limits" icon={Clock}>
          <DurationConfiguration />
        </ConfigSection>

        <ConfigSection title="Prized Raffles" icon={Package}>
          <PrizedRafflesConfiguration />
        </ConfigSection>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Access Management
        </h2>
        <AccessManagement />
      </div>
    </div>
  );
};

export default AdminDashboard;

