import React, { useState } from 'react';
import { Play, Square, Zap, Award, Settings } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';

const OperatorCard = ({ title, description, icon: Icon, action, loading, disabled }) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <button
      onClick={action}
      disabled={loading || disabled}
      className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {loading ? 'Processing...' : title}
    </button>
  </div>
);

const OperatorDashboard = () => {
  const { connected } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState({
    activate: false,
    end: false,
    randomness: false,
    process: false
  });

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const handleActivateRaffles = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoadingState('activate', true);
    try {
      // In a real implementation, you would:
      // 1. Fetch raffles that need activation (state = pending, startTime <= now)
      // 2. Call activate() on each raffle contract
      
      // For demo purposes, we'll show a success message
      alert('Activating raffles... In a real implementation, this would fetch pending raffles and activate them.');
      
      // Example of how it would work:
      // const pendingRaffles = await fetchPendingRaffles();
      // for (const raffle of pendingRaffles) {
      //   const raffleContract = getContractInstance(raffle.address, 'raffle');
      //   await executeTransaction(raffleContract.activate);
      // }
      
    } catch (error) {
      console.error('Error activating raffles:', error);
      alert('Error activating raffles: ' + error.message);
    } finally {
      setLoadingState('activate', false);
    }
  };

  const handleEndRaffles = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoadingState('end', true);
    try {
      // In a real implementation, you would:
      // 1. Fetch active raffles that have ended (state = active, endTime <= now)
      // 2. Call endRaffle() on each raffle contract
      
      alert('Ending raffles... In a real implementation, this would fetch expired active raffles and end them.');
      
      // Example:
      // const expiredRaffles = await fetchExpiredRaffles();
      // for (const raffle of expiredRaffles) {
      //   const raffleContract = getContractInstance(raffle.address, 'raffle');
      //   await executeTransaction(raffleContract.endRaffle);
      // }
      
    } catch (error) {
      console.error('Error ending raffles:', error);
      alert('Error ending raffles: ' + error.message);
    } finally {
      setLoadingState('end', false);
    }
  };

  const handleRequestRandomness = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoadingState('randomness', true);
    try {
      // In a real implementation, you would:
      // 1. Fetch ended raffles that need randomness (state = ended)
      // 2. Call requestRandomWords() on each raffle contract
      
      alert('Requesting randomness... In a real implementation, this would fetch ended raffles and request VRF randomness.');
      
      // Example:
      // const endedRaffles = await fetchEndedRaffles();
      // for (const raffle of endedRaffles) {
      //   const raffleContract = getContractInstance(raffle.address, 'raffle');
      //   await executeTransaction(raffleContract.requestRandomWords);
      // }
      
    } catch (error) {
      console.error('Error requesting randomness:', error);
      alert('Error requesting randomness: ' + error.message);
    } finally {
      setLoadingState('randomness', false);
    }
  };

  const handleProcessWinners = async () => {
    if (!contracts.raffleManager) {
      alert('RaffleManager contract not configured');
      return;
    }

    setLoadingState('process', true);
    try {
      // In a real implementation, you would:
      // 1. Fetch raffles in drawing state (randomness received)
      // 2. Call processBatch() and completeDrawing() on each raffle contract
      
      alert('Processing winners... In a real implementation, this would fetch raffles with randomness and process winners.');
      
      // Example:
      // const drawingRaffles = await fetchDrawingRaffles();
      // for (const raffle of drawingRaffles) {
      //   const raffleContract = getContractInstance(raffle.address, 'raffle');
      //   await executeTransaction(raffleContract.processBatch);
      //   await executeTransaction(raffleContract.completeDrawing);
      // }
      
    } catch (error) {
      console.error('Error processing winners:', error);
      alert('Error processing winners: ' + error.message);
    } finally {
      setLoadingState('process', false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to access operator functions.
          </p>
        </div>
      </div>
    );
  }

  const operatorActions = [
    {
      title: 'Activate Raffles',
      description: 'Activate pending raffles that have reached their start time',
      icon: Play,
      action: handleActivateRaffles,
      loading: loading.activate
    },
    {
      title: 'End Raffles',
      description: 'End active raffles that have reached their end time',
      icon: Square,
      action: handleEndRaffles,
      loading: loading.end
    },
    {
      title: 'Request Randomness',
      description: 'Request VRF randomness for ended raffles',
      icon: Zap,
      action: handleRequestRandomness,
      loading: loading.randomness
    },
    {
      title: 'Process Winners',
      description: 'Process winners for raffles with received randomness',
      icon: Award,
      action: handleProcessWinners,
      loading: loading.process
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
        <p className="text-muted-foreground">
          Manage raffle lifecycle operations and automation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {operatorActions.map((action, index) => (
          <OperatorCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            action={action.action}
            loading={action.loading}
            disabled={!contracts.raffleManager}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Operator Instructions</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>1. Activate Raffles:</strong> Run this to activate raffles that have reached their start time.
          </p>
          <p>
            <strong>2. End Raffles:</strong> Run this to end active raffles that have reached their end time.
          </p>
          <p>
            <strong>3. Request Randomness:</strong> Run this to request VRF randomness for ended raffles.
          </p>
          <p>
            <strong>4. Process Winners:</strong> Run this to process winners for raffles that have received randomness.
          </p>
          <p className="mt-4">
            <strong>Note:</strong> In a production environment, these operations would be automated or triggered by external systems.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;

