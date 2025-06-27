import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { Trophy } from 'lucide-react';
import { ethers } from 'ethers';
import { RaffleCard } from './LandingPage';

const NFTPrizedRafflePage = () => {
  const { connected } = useWallet();
  const { contracts, getContractInstance, onContractEvent } = useContract();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRaffles = React.useCallback(async (isBackground = false) => {
    if (!connected) {
      setRaffles([]);
      setError('Please connect your wallet to view raffles');
      return;
    }
    if (!contracts.raffleManager) {
      setError('Contracts not initialized. Please try refreshing the page.');
      return;
    }
    if (isBackground) {
      setBackgroundLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const registeredRaffles = await contracts.raffleManager.getAllRaffles ? await contracts.raffleManager.getAllRaffles() : await contracts.raffleManager.getRegisteredRaffles();
      if (!registeredRaffles || registeredRaffles.length === 0) {
        setRaffles([]);
        setError('No raffles found on the blockchain');
        return;
      }
      const rafflePromises = registeredRaffles.map(async (raffleAddress) => {
        try {
          const raffleContract = getContractInstance(raffleAddress, 'raffle');
          if (!raffleContract) return null;
          const [name, creator, startTime, duration, ticketPrice, ticketLimit, winnersCount, maxTicketsPerParticipant, isPrized, prizeCollection, state] = await Promise.all([
            raffleContract.name(),
            raffleContract.creator(),
            raffleContract.startTime(),
            raffleContract.duration(),
            raffleContract.ticketPrice(),
            raffleContract.ticketLimit(),
            raffleContract.winnersCount(),
            raffleContract.maxTicketsPerParticipant(),
            raffleContract.isPrized(),
            raffleContract.prizeCollection(),
            raffleContract.state()
          ]);
          let ticketsSold = 0;
          try {
            let count = 0;
            while (true) {
              try {
                await raffleContract.participants(count);
                count++;
              } catch {
                break;
              }
            }
            ticketsSold = count;
          } catch {}
          let raffleState;
          if (state === 0) raffleState = 'pending';
          else if (state === 1) raffleState = 'active';
          else if (state === 2) raffleState = 'drawing';
          else if (state === 3 || state === 4) raffleState = 'completed';
          else if (state === 5) raffleState = 'ended';
          else raffleState = 'ended';
          return {
            id: raffleAddress,
            name,
            address: raffleAddress,
            creator,
            startTime: startTime.toNumber(),
            duration: duration.toNumber(),
            ticketPrice,
            ticketLimit: ticketLimit.toNumber(),
            ticketsSold,
            winnersCount: winnersCount.toNumber(),
            maxTicketsPerParticipant: maxTicketsPerParticipant.toNumber(),
            isPrized,
            prizeCollection: !!isPrized ? prizeCollection : null,
            state: raffleState
          };
        } catch {
          return null;
        }
      });
      const raffleData = await Promise.all(rafflePromises);
      const validRaffles = raffleData.filter(r => r && r.isPrized && r.prizeCollection);
      setRaffles(validRaffles);
      if (validRaffles.length === 0) setError('No NFT-prized raffles found.');
    } catch (e) {
      setError('Failed to fetch raffles');
      setRaffles([]);
    } finally {
      if (isBackground) {
        setBackgroundLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [contracts, getContractInstance, connected]);

  useEffect(() => {
    fetchRaffles();
    const interval = setInterval(() => fetchRaffles(true), 30000);
    return () => clearInterval(interval);
  }, [fetchRaffles]);

  useEffect(() => {
    if (!onContractEvent) return;
    const unsubRaffleCreated = onContractEvent('RaffleCreated', () => {
      fetchRaffles(true);
    });
    const unsubWinnersSelected = onContractEvent('WinnersSelected', () => {
      fetchRaffles(true);
    });
    const unsubPrizeClaimed = onContractEvent('PrizeClaimed', () => {
      fetchRaffles(true);
    });
    return () => {
      unsubRaffleCreated && unsubRaffleCreated();
      unsubWinnersSelected && unsubWinnersSelected();
      unsubPrizeClaimed && unsubPrizeClaimed();
    };
  }, [onContractEvent, fetchRaffles]);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">NFT-Prized Raffles</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ahoy Collector! Look, there's plenty of jpegs lying around, you may end up leaving with one!
          </p>
        </div>
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view and interact with raffles on the blockchain.
          </p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading NFT-prized raffles from blockchain...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">NFT-Prized Raffles</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ahoy Collector! Look, there's plenty of jpegs lying around, you may end up leaving with one!
          </p>
        </div>
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Unable to Load NFT-Prized Raffles</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">NFT-Prized Raffles</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ahoy Collector! Look, there's plenty of jpegs lying around, you may end up leaving with one!
        </p>
      </div>
      <div className="mt-16">
      {raffles.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No NFT-Prized Raffles Available</h3>
          <p className="text-muted-foreground">There are currently no NFT-prized raffles. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-w-0">
          {raffles.filter(r => r.state === 'pending' || r.state === 'active').map(raffle => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default NFTPrizedRafflePage; 