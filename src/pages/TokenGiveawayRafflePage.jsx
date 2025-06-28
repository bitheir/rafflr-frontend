import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { Coins, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { RaffleCard } from './LandingPage';
import { PageContainer } from '../components/Layout';

const TokenGiveawayRafflePage = () => {
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
      const validRaffles = raffleData.filter(r => r && r.isPrized && !r.prizeCollection);
      setRaffles(validRaffles);
      if (validRaffles.length === 0) setError('No token giveaway raffles found.');
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
      <PageContainer className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">ETH & Token Giveaways</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Feeling lucky? Here are some 'cash' giveaways you should try!
          </p>
        </div>
        <div className="text-center py-16">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view and interact with raffles on the blockchain.
          </p>
        </div>
      </PageContainer>
    );
  }
  if (loading) {
    return (
      <PageContainer className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">ETH & Token Giveaways</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Feeling lucky? Here are some 'cash' giveaways you should try!
          </p>
        </div>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading token giveaway raffles from blockchain...</p>
        </div>
      </PageContainer>
    );
  }
  if (error) {
    return (
      <PageContainer className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">ETH & Token Giveaways</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Feeling lucky? Here are some 'cash' giveaways you should try!
          </p>
        </div>
        <div className="text-center py-16">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Unable to Load Token Giveaway Raffles</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Try Again</button>
        </div>
      </PageContainer>
    );
  }
  return (
    <PageContainer className="pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">ETH & Token Giveaways</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Feeling lucky? Here are some 'cash' giveaways you should try!
        </p>
      </div>
      <div className="mt-16">
      {raffles.length === 0 ? (
        <div className="text-center py-16">
          <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Token Giveaway Raffles Available</h3>
          <p className="text-muted-foreground">There are currently no token giveaway raffles. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...raffles.filter(r => r.state === 'pending' || r.state === 'active')].reverse().map(raffle => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      )}
      </div>
    </PageContainer>
  );
};

export default TokenGiveawayRafflePage; 