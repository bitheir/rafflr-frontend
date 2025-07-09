import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Clock, Trophy, Users, ArrowLeft, AlertCircle, CheckCircle, DollarSign, Trash2, Info } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PageContainer } from '../components/Layout';
import SocialTaskCompletion from '../components/SocialTaskCompletion';
import { SocialTaskService } from '../lib/socialTaskService';
import { contractABIs } from '../contracts/contractABIs';

const RAFFLE_STATE_LABELS = [
  'Pending',
  'Active',
  'Ended',
  'Drawing',
  'Completed',
  'Deleted',
  'Activation Failed',
  'All Prizes Claimed',
  'Unengaged'
];

const TicketPurchaseSection = ({ raffle, onPurchase, timeRemaining }) => {
  const { connected, address } = useWallet();
  const { getContractInstance, executeTransaction } = useContract();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [socialTasks, setSocialTasks] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [requestingRandomness, setRequestingRandomness] = useState(false);
  const [userTickets, setUserTickets] = useState(0);

  useEffect(() => {
    loadSocialTasks();
    fetchUserTickets();
  }, [raffle.address, address]);

  const loadSocialTasks = async () => {
    if (!raffle.address) return;
    
    setLoadingTasks(true);
    try {
      const result = await SocialTaskService.getRaffleTasks(raffle.address);
      if (result.success) {
        setSocialTasks(result.data);
        
        // Check if user has completed all required tasks
        if (result.data.length > 0) {
          const completionResult = await SocialTaskService.checkUserTaskCompletion(
            connected ? window.ethereum.selectedAddress : null,
            raffle.address
          );
          
          if (completionResult.success) {
            setTasksCompleted(completionResult.data.completed);
          }
        } else {
          setTasksCompleted(true); // No tasks required
        }
      }
    } catch (error) {
      console.error('Error loading social tasks:', error);
      setTasksCompleted(true); // Allow purchase if tasks can't be loaded
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchUserTickets = async () => {
    if (!raffle.address || !address) {
      setUserTickets(0);
      return;
    }
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) return;
      const tickets = await raffleContract.ticketsPurchased(address);
      setUserTickets(tickets.toNumber ? tickets.toNumber() : Number(tickets));
    } catch (e) {
      setUserTickets(0);
    }
  };

  const handleTasksCompleted = (completed) => {
    setTasksCompleted(completed);
  };

  const handlePurchase = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!tasksCompleted) {
      alert('Please complete all required social media tasks before purchasing tickets');
      return;
    }

    setLoading(true);
    try {
      await onPurchase(quantity);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRandomness = async () => {
    setRequestingRandomness(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      const result = await executeTransaction(raffleContract.requestRandomWords);
      if (result.success) {
        alert('Randomness requested successfully!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Failed to request randomness: ' + error.message);
    } finally {
      setRequestingRandomness(false);
    }
  };

  const canPurchaseTickets = () => {
    // Can only purchase tickets if raffle is active AND tasks are completed
    return raffle.state?.toLowerCase() === 'active' && tasksCompleted;
  };

  const isRaffleEnded = () => {
    // Raffle is ended if state is ended/completed/drawing or timer shows "Ended"
    return raffle.state === 'ended' || 
           raffle.state === 'completed' || 
           raffle.state === 'drawing' || 
           timeRemaining === 'Ended';
  };

  const totalCost = ethers.utils.formatEther(
    ethers.BigNumber.from(raffle.ticketPrice || '0').mul(quantity)
  );

  const remainingTickets = raffle.ticketLimit - raffle.ticketsSold;
  const maxPurchasable = Math.min(
    remainingTickets,
    raffle.maxTicketsPerParticipant,
    raffle.userTicketsRemaining || raffle.maxTicketsPerParticipant
  );

  // Replace purchase button with randomness button if raffle ended and user is a participant
  if (raffle.stateNum === 2 && userTickets > 0) {
  return (
      <div className="bg-background border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Request Randomness
        </h3>
        <div className="text-center py-8">
          <button
            onClick={handleRequestRandomness}
            disabled={requestingRandomness}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {requestingRandomness ? 'Requesting...' : 'Request Randomness'}
          </button>
          <p className="text-muted-foreground mt-4">
            The raffle has ended. As a participant, you can request the random draw to select winners.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Ticket className="h-5 w-5" />
        Purchase Tickets
      </h3>

      {remainingTickets <= 0 ? (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">All tickets have been sold!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Social Media Tasks Section */}
          {socialTasks.length > 0 && (
            <div className="mb-6">
              <SocialTaskCompletion
                raffleAddress={raffle.address}
                tasks={socialTasks}
                onTasksCompleted={handleTasksCompleted}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Price per ticket:</span>
              <p className="font-semibold text-lg">{ethers.utils.formatEther(raffle.ticketPrice || '0')} ETH</p>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining tickets:</span>
              <p className="font-semibold text-lg">{remainingTickets}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Your tickets:</span>
              <p className="font-semibold text-lg">{raffle.userTickets || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Max per user:</span>
              <p className="font-semibold text-lg">{raffle.maxTicketsPerParticipant}</p>
            </div>
          </div>

          {maxPurchasable > 0 ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={maxPurchasable}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxPurchasable, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: {maxPurchasable} tickets
                </p>
              </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-lg font-bold">{totalCost} ETH</span>
                </div>
              </div>

              {!canPurchaseTickets() && (
                <div className="text-center py-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isRaffleEnded() 
                      ? 'Raffle has ended' 
                      : 'Raffle has not started yet'}
                  </p>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={loading || !connected || !canPurchaseTickets()}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ticket className="h-4 w-4" />
                {loading ? 'Processing...' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                You have reached the maximum number of tickets for this raffle.
              </p>
            </div>
          )}

          {!connected && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Please connect your wallet to purchase tickets.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PrizeImageCard = ({ raffle }) => {
  const { getContractInstance } = useContract();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrizeImage() {
      if (!raffle.isPrized) return;
      setLoading(true);
      try {
        let uri;
        if (raffle.standard === 0) {
          const contract = getContractInstance(raffle.prizeCollection, 'erc721Prize');
          uri = await contract.tokenURI(raffle.prizeTokenId);
        } else if (raffle.standard === 1) {
          const contract = getContractInstance(raffle.prizeCollection, 'erc1155Prize');
          uri = await contract.uri(raffle.prizeTokenId);
        } else {
          setImageUrl(null);
          setLoading(false);
          return;
        }
        if (uri.startsWith('ipfs://')) {
          uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        if (raffle.standard === 1 && uri.includes('{id}')) {
          const hexId = BigInt(raffle.prizeTokenId).toString(16).padStart(64, '0');
          uri = uri.replace('{id}', hexId);
        }
        const res = await fetch(uri);
        const metadata = await res.json();
        setImageUrl(metadata.image || null);
      } catch (err) {
        setImageUrl(null);
      }
      setLoading(false);
    }
    if (raffle.isPrized) fetchPrizeImage();
  }, [raffle, getContractInstance]);

  if (!raffle.isPrized || loading || !imageUrl) return null;

  return (
    <Card className="h-full flex flex-col items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center">
        <img
          src={imageUrl}
          alt="Prize Art"
          className="w-48 h-48 object-contain rounded-lg border"
          style={{ background: '#fff' }}
        />
      </CardContent>
    </Card>
  );
};

const WinnersSection = ({ raffle }) => {
  const { getContractInstance, executeTransaction } = useContract();
  const { address: connectedAddress } = useWallet();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingPrize, setClaimingPrize] = useState(false);
  const [claimingRefund, setClaimingRefund] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [eligibleForRefund, setEligibleForRefund] = useState(false);
  const [refundClaimed, setRefundClaimed] = useState(false);
  const [refundableAmount, setRefundableAmount] = useState(null);
  const [nonWinningTickets, setNonWinningTickets] = useState(0);

  // Winner/refund logic for rendering
  const winnerObj = winners.find(w => w.address.toLowerCase() === connectedAddress?.toLowerCase());
  const shouldShowClaimPrize = !!winnerObj && raffle.isPrized && (raffle.stateNum === 4 || raffle.stateNum === 7);
  const prizeAlreadyClaimed = winnerObj && winnerObj.prizeClaimed;
  const shouldShowClaimRefund =
    raffle.isPrized &&
    (raffle.stateNum === 4 || raffle.stateNum === 7) &&
    eligibleForRefund &&
    refundableAmount && refundableAmount.gt && refundableAmount.gt(0);

  useEffect(() => {
    const fetchWinners = async () => {
      console.log('Fetching winners for raffle state:', raffle.stateNum, raffle.state);
      
      if (raffle.stateNum !== 4 && raffle.stateNum !== 7) {
        console.log('Raffle not in completed state, skipping winners fetch');
        setWinners([]);
        setIsWinner(false);
        setEligibleForRefund(false);
        setRefundClaimed(false);
        setRefundableAmount(null);
        setNonWinningTickets(0); // Reset non-winning tickets
        return;
      }
      setLoading(true);
      try {
        const raffleContract = getContractInstance && getContractInstance(raffle.address, 'raffle');
        if (!raffleContract) {
          setWinners([]);
          setLoading(false);
          return;
        }
        // Fetch winnersCount
        const winnersCount = await raffleContract.winnersCount();
        const count = winnersCount.toNumber ? winnersCount.toNumber() : Number(winnersCount);
        
        console.log('Winners count:', count);
        
        // Only proceed if there are winners
        if (count === 0) {
          console.log('No winners found');
          setWinners([]);
          setLoading(false);
          return;
        }
        
        // Fetch each winner by index
        const winnersArray = [];
        for (let i = 0; i < count; i++) {
            try {
              const winnerAddress = await raffleContract.winners(i);
              console.log(`Winner at index ${i}:`, winnerAddress);
              
              // Skip if the address is zero (no winner at this index)
              if (winnerAddress === ethers.constants.AddressZero || winnerAddress === '0x0000000000000000000000000000000000000000') {
                console.log(`Skipping zero address at index ${i}`);
                continue;
              }
              
              const claimedWins = await raffleContract.claimedWins(winnerAddress);
              const prizeClaimed = await raffleContract.prizeClaimed(winnerAddress);
              
              winnersArray.push({
                address: winnerAddress,
                index: i,
                claimedWins: claimedWins.toNumber ? claimedWins.toNumber() : Number(claimedWins),
                prizeClaimed: prizeClaimed
              });
            } catch (error) {
              console.warn(`Error fetching winner at index ${i}:`, error);
              // Continue to next winner instead of adding a zero address
              continue;
            }
        }
        console.log('Final winners array:', winnersArray);
        setWinners(winnersArray);
        // Check if connected user is a winner
        const winner = winnersArray.find(w => w.address.toLowerCase() === connectedAddress?.toLowerCase());
        setIsWinner(!!winner);
        // Fetch refundable amount using getRefundableAmount
        if (connectedAddress && raffle.isPrized) {
          try {
            const refundable = await raffleContract.getRefundableAmount(connectedAddress);
            setRefundableAmount(refundable);
            setEligibleForRefund(refundable && refundable.gt && refundable.gt(0));
          } catch (e) {
            setRefundableAmount(null);
            setEligibleForRefund(false);
          }
        } else {
          setEligibleForRefund(false);
        }
        // Remove old nonWinningTickets logic
        setNonWinningTickets(0);
      } catch (error) {
        setWinners([]);
        setIsWinner(false);
        setEligibleForRefund(false);
        setRefundClaimed(false);
        setRefundableAmount(null);
        setNonWinningTickets(0); // Reset non-winning tickets on error
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, [raffle, getContractInstance, connectedAddress]);

  useEffect(() => {
    console.log('[WinnersSection Debug]');
    console.log('nonWinningTickets:', nonWinningTickets);
    console.log('shouldShowClaimRefund:', shouldShowClaimRefund);
    console.log('refundClaimed:', refundClaimed);
    console.log('raffle.stateNum:', raffle.stateNum);
    console.log('raffle.isPrized:', raffle.isPrized);
  }, [nonWinningTickets, shouldShowClaimRefund, refundClaimed, raffle]);

  const handleClaimPrize = async () => {
    if (!connectedAddress || !raffle || !getContractInstance) {
      alert('Please connect your wallet to claim your prize');
      return;
    }

    // Check if user is a winner
    const isWinner = winners.some(winner => 
      winner.address.toLowerCase() === connectedAddress.toLowerCase()
    );

    if (!isWinner) {
      alert('You are not a winner of this raffle');
      return;
    }

    // Check if prize is already claimed
    const winner = winners.find(w => 
      w.address.toLowerCase() === connectedAddress.toLowerCase()
    );

    if (winner && winner.prizeClaimed) {
      alert('You have already claimed your prize');
      return;
    }

    setClaimingPrize(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) {
        throw new Error('Failed to get raffle contract');
      }

      // Call claimPrize function
      const result = await executeTransaction(
        raffleContract.claimPrize
      );

      if (result.success) {
        // Determine prize type for success message
        let prizeType = 'prize';
        if (raffle.ethPrizeAmount && raffle.ethPrizeAmount.gt && raffle.ethPrizeAmount.gt(0)) {
          prizeType = `${ethers.utils.formatEther(raffle.ethPrizeAmount)} ETH`;
        } else if (raffle.erc20PrizeToken && raffle.erc20PrizeToken !== ethers.constants.AddressZero && raffle.erc20PrizeAmount && raffle.erc20PrizeAmount.gt && raffle.erc20PrizeAmount.gt(0)) {
          prizeType = `${ethers.utils.formatUnits(raffle.erc20PrizeAmount, 18)} ERC20 tokens`;
        } else if (raffle.prizeCollection && raffle.prizeCollection !== ethers.constants.AddressZero) {
          prizeType = raffle.standard === 0 ? 'ERC721 NFT' : 'ERC1155 NFT';
        }

        alert(`Successfully claimed your ${prizeType}!`);
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('Failed to claim prize: ' + error.message);
    } finally {
      setClaimingPrize(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!connectedAddress || !raffle || !getContractInstance) {
      alert('Please connect your wallet to claim your refund');
      return;
    }
    setClaimingRefund(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) {
        throw new Error('Failed to get raffle contract');
      }
      const result = await executeTransaction(raffleContract.claimRefund);
      if (result.success) {
        alert('Successfully claimed your refund!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error claiming refund:', error);
      alert('Failed to claim refund: ' + error.message);
    } finally {
      setClaimingRefund(false);
    }
  };

  const canClaimPrize = () => {
    // Can only claim if:
    // 1. User is connected
    // 2. Raffle is completed
    // 3. Raffle has prizes (not whitelist)
    // 4. User is a winner
    // 5. User hasn't claimed yet
    if (!connectedAddress || !raffle.isPrized) return false;
    
    if (raffle.stateNum !== 4 && raffle.stateNum !== 7) return false;
    
    const winner = winners.find(w => 
      w.address.toLowerCase() === connectedAddress.toLowerCase()
    );
    
    return winner && !winner.prizeClaimed;
  };

  const canClaimRefund = () => {
    // Only for completed raffles, prized raffles, not whitelist, user is eligible, and not already claimed
    return (
      raffle.isPrized &&
      (raffle.stateNum === 4 || raffle.stateNum === 7) &&
      eligibleForRefund &&
      !refundClaimed &&
      refundableAmount && refundableAmount.gt && refundableAmount.gt(0)
    );
  };

  const getPrizeTypeDescription = () => {
    if (raffle.ethPrizeAmount && raffle.ethPrizeAmount.gt && raffle.ethPrizeAmount.gt(0)) {
      return `${ethers.utils.formatEther(raffle.ethPrizeAmount)} ETH`;
    } else if (raffle.erc20PrizeToken && raffle.erc20PrizeToken !== ethers.constants.AddressZero && raffle.erc20PrizeAmount && raffle.erc20PrizeAmount.gt && raffle.erc20PrizeAmount.gt(0)) {
      return `${ethers.utils.formatUnits(raffle.erc20PrizeAmount, 18)} ERC20 tokens`;
    } else if (raffle.prizeCollection && raffle.prizeCollection !== ethers.constants.AddressZero) {
      return raffle.standard === 0 ? 'ERC721 NFT' : 'ERC1155 NFT';
    }
    return 'prize';
  };

  const getStateDisplay = () => {
    const label = RAFFLE_STATE_LABELS[raffle.stateNum] || 'Unknown';
    switch (label) {
      case 'Pending':
        return (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Pending</h3>
            <p className="text-muted-foreground">Winners will be announced after the raffle ends and drawing is complete.</p>
          </div>
        );
      case 'Active':
        return (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Active</h3>
            <p className="text-muted-foreground">Raffle is currently active. Winners will be announced after it ends.</p>
          </div>
        );
      case 'Ended':
        return (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Ended</h3>
            <p className="text-muted-foreground">Raffle has ended. Waiting for winner selection.</p>
          </div>
        );
      case 'Drawing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Drawing in Progress</h3>
            <p className="text-muted-foreground">Winners are being selected. Please wait...</p>
          </div>
        );
      case 'Completed':
      case 'All Prizes Claimed':
        return (
          <div className="bg-background rounded-lg">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading winners...</p>
              </div>
            ) : winners.length > 0 ? (
              <div className="space-y-3">
                {winners.map((winner) => (
                  <div key={winner.index} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      {/* Trophy icon if connected account is this winner */}
                      {connectedAddress && winner.address.toLowerCase() === connectedAddress.toLowerCase() && (
                        <Trophy className="h-5 w-5 text-yellow-500" title="You!" />
                      )}
                    <div>
                      <p className="font-medium">Winner #{winner.index + 1}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {winner.address.slice(0, 10)}...{winner.address.slice(-8)}
                      </p>
                      {raffle.isPrized && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Prizes claimed: {winner.claimedWins}
                        </p>
                      )}
                      </div>
                    </div>
                    <div className="text-right">
                      {raffle.isPrized ? (
                        winner.prizeClaimed ? (
                          <span className="text-green-600 text-sm">Claimed</span>
                        ) : (
                          <span className="text-orange-600 text-sm">Pending</span>
                        )
                      ) : (
                        <span className="text-blue-600 text-sm">Winner</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No winners data available.</p>
            )}
          </div>
        );
      case 'Deleted':
        return (
          <div className="text-center py-8">
            <Trash2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Deleted</h3>
            <p className="text-muted-foreground">This raffle has been deleted and is no longer active.</p>
          </div>
        );
      case 'Activation Failed':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Activation Failed</h3>
            <p className="text-muted-foreground">Raffle activation failed. Please contact support or try again.</p>
          </div>
        );
      case 'Unengaged':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unengaged Raffle</h3>
            <p className="text-muted-foreground">This raffle did not receive enough engagement and was closed.</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unknown raffle state.</p>
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col bg-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Winners</CardTitle>
        <div className="flex gap-2">
          {shouldShowClaimPrize && (
            <Button
              onClick={handleClaimPrize}
              disabled={claimingPrize || prizeAlreadyClaimed}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {/* <Trophy className="h-4 w-4" /> Removed icon */}
              {claimingPrize ? 'Claiming...' : prizeAlreadyClaimed ? 'Prize Claimed' : 'Claim Prize'}
            </Button>
          )}
          {shouldShowClaimRefund && (
            <Button
              onClick={handleClaimRefund}
              disabled={claimingRefund}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              {claimingRefund ? 'Claiming...' : `Claim Refund${refundableAmount && refundableAmount.gt && refundableAmount.gt(0) ? ` (${ethers.utils.formatEther(refundableAmount)} ETH)` : ''}`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[600px] pb-4">
        {getStateDisplay()}
      </CardContent>
    </Card>
  );
};

function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0 || days > 0) formatted += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m`;
  if (!formatted) formatted = '0m';
  return formatted.trim();
}

function ERC20PrizeAmount({ token, amount }) {
  const [symbol, setSymbol] = React.useState('TOKEN');
  React.useEffect(() => {
    let isMounted = true;
    async function fetchSymbol() {
      try {
        if (!window.__erc20SymbolCache) window.__erc20SymbolCache = {};
        if (window.__erc20SymbolCache[token]) {
          setSymbol(window.__erc20SymbolCache[token]);
          return;
        }
        const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
        const erc20Abi = ["function symbol() view returns (string)"];
        const contract = new ethers.Contract(token, erc20Abi, provider);
        const sym = await contract.symbol();
        if (isMounted) {
          setSymbol(sym);
          window.__erc20SymbolCache[token] = sym;
        }
      } catch {
        if (isMounted) setSymbol('TOKEN');
      }
    }
    fetchSymbol();
    return () => { isMounted = false; };
  }, [token]);
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">Prize Amount:</span>
      <span>{ethers.utils.formatUnits(amount, 18)} {symbol}</span>
    </div>
  );
}

function getRefundability(raffle) {
  if (!raffle) return { label: 'Non-Refundable', refundable: false, reason: 'Unknown' };
  // If deleted before Ended, always refundable
  if (raffle.state === 'Deleted') {
    return { label: 'All Tickets Refundable', refundable: true, reason: 'Raffle was deleted before ending. All tickets are refundable.' };
  }
  // NFT-prized, single winner, not deleted
  if (raffle.isPrized && raffle.winnersCount === 1 && raffle.standard !== undefined && (raffle.standard === 0 || raffle.standard === 1)) {
    return { label: 'Tickets Refundable if Deleted', refundable: false, reason: 'Single-winner NFT raffles are not refundable unless deleted before ending.' };
  }
  // Otherwise, refundable
  return { label: 'Non-winning Tickets Refundable', refundable: true, reason: 'This raffle supports refunds for non-winning tickets.' };
}

const RaffleDetailPage = () => {
  const { raffleAddress } = useParams();
  const navigate = useNavigate();
  const { connected, address } = useWallet();
  const { getContractInstance, executeTransaction } = useContract();
  
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isEscrowedPrize, setIsEscrowedPrize] = useState(false);
  const [depositingPrize, setDepositingPrize] = useState(false);
  const [withdrawingPrize, setWithdrawingPrize] = useState(false);
  const [deletingRaffle, setDeletingRaffle] = useState(false);
  const [is1155Approved, setIs1155Approved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [approving, setApproving] = useState(false);
  // ERC20 approval state
  const [isERC20Approved, setIsERC20Approved] = useState(false);
  const [checkingERC20Approval, setCheckingERC20Approval] = useState(false);
  const [approvingERC20, setApprovingERC20] = useState(false);
  // ERC721 approval state
  const [isERC721Approved, setIsERC721Approved] = useState(false);
  const [checkingERC721Approval, setCheckingERC721Approval] = useState(false);
  const [approvingERC721, setApprovingERC721] = useState(false);

  // Fetch actual raffle data from blockchain
  useEffect(() => {
    const fetchRaffleData = async () => {
      setLoading(true);
      try {
        if (!raffleAddress) {
          throw new Error('No raffle address provided');
        }
        if (!connected || !getContractInstance) {
          setLoading(true);
          return;
        }
        const raffleContract = getContractInstance(raffleAddress, 'raffle');
        if (!raffleContract) {
          setLoading(true);
          return;
        }
        const [name, creator, startTime, duration, ticketPrice, ticketLimit, winnersCount, maxTicketsPerParticipant, isPrizedContract, prizeCollection, prizeTokenId, standard, stateNum, erc20PrizeToken, erc20PrizeAmount, ethPrizeAmount, usesCustomPrice] = await Promise.all([
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
          raffleContract.prizeTokenId(),
          raffleContract.standard(),
          raffleContract.state(),
          raffleContract.erc20PrizeToken?.(),
          raffleContract.erc20PrizeAmount?.(),
          raffleContract.ethPrizeAmount?.(),
          raffleContract.usesCustomPrice?.()
        ]);

        // Get tickets sold by counting participants
        let ticketsSold = 0;
        try {
          // Try to get participants count if the contract has this method
          const participantsCount = await raffleContract.getParticipantsCount();
          ticketsSold = participantsCount.toNumber();
        } catch (error) {
          // Fallback: count participants by iterating through the array
          let index = 0;
          while (true) {
            try {
              await raffleContract.participants(index);
              ticketsSold++;
              index++;
            } catch {
              break;
            }
          }
        }

        // Get user-specific data if connected
        let userTickets = 0;
        let userTicketsRemaining = maxTicketsPerParticipant.toNumber();
        
        if (connected && address) {
          try {
            // Try to get user's ticket count directly if available
            const userTicketCount = await raffleContract.ticketsPurchased(address);
            userTickets = userTicketCount.toNumber();
            userTicketsRemaining = Math.max(0, maxTicketsPerParticipant.toNumber() - userTickets);
          } catch (error) {
            console.warn('Could not fetch user ticket data:', error);
            // Fallback: count user participations manually
            let index = 0;
            while (index < ticketsSold) {
              try {
                const participant = await raffleContract.participants(index);
                if (participant.toLowerCase() === address.toLowerCase()) {
                  userTickets++;
                }
                index++;
              } catch {
                break;
              }
            }
            userTicketsRemaining = Math.max(0, maxTicketsPerParticipant.toNumber() - userTickets);
          }
        }

        const isPrized = !!isPrizedContract;

        const raffleData = {
          address: raffleAddress,
          name,
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
          stateNum: stateNum,
          state: RAFFLE_STATE_LABELS[stateNum] || 'Unknown',
          erc20PrizeToken,
          erc20PrizeAmount,
          ethPrizeAmount,
          usesCustomPrice,
          standard,
          prizeTokenId,
        };
        
        setRaffle(raffleData);
      } catch (error) {
        console.error('Error fetching raffle data:', error);
        alert('Error loading raffle data: ' + error.message);
        // Navigate back if raffle doesn't exist
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (raffleAddress && getContractInstance) {
      fetchRaffleData();
    }
  }, [raffleAddress, getContractInstance, connected, address, navigate]);

  // Update countdown timer
  useEffect(() => {
    if (!raffle) return;
    let interval;
    function updateTimer() {
      const now = Math.floor(Date.now() / 1000);
      let targetTime;
      if (raffle.stateNum === 0) { // Pending
        targetTime = raffle.startTime;
        const remaining = targetTime - now;
        if (remaining > 0) {
          setTimeRemaining(formatTime(remaining));
        } else {
          // If still pending after start time, start counting down to end time
          targetTime = raffle.startTime + raffle.duration;
          const remainingToEnd = targetTime - now;
          if (remainingToEnd > 0) {
            setTimeRemaining(formatTime(remainingToEnd));
          } else {
            setTimeRemaining('Ended');
          }
        }
      } else if (raffle.stateNum === 1) { // Active
        targetTime = raffle.startTime + raffle.duration;
        const remaining = targetTime - now;
        if (remaining > 0) {
          setTimeRemaining(formatTime(remaining));
        } else {
          setTimeRemaining('Ended');
        }
      } else {
        setTimeRemaining('Ended');
      }
    }
    function formatTime(seconds) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      let formatted = '';
      if (days > 0) formatted += `${days}d `;
      if (hours > 0 || days > 0) formatted += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
      formatted += `${secs}s`;
      return formatted.trim();
    }
    updateTimer();
    interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [raffle]);

  useEffect(() => {
    async function fetchEscrowedPrizeFlag() {
      if (raffleAddress && getContractInstance) {
        try {
          const contract = getContractInstance(raffleAddress, 'raffle');
          if (contract) {
            const flag = await contract.isEscrowedPrize();
            setIsEscrowedPrize(flag);
          }
        } catch (e) {
          setIsEscrowedPrize(false);
        }
      }
    }
    fetchEscrowedPrizeFlag();
  }, [raffleAddress, getContractInstance]);

  // Check ERC1155 approval status if needed
  useEffect(() => {
    const checkApproval = async () => {
      if (
        raffle &&
        raffle.standard === 1 &&
        raffle.prizeCollection &&
        address &&
        address.toLowerCase() === raffle.creator.toLowerCase()
      ) {
        setCheckingApproval(true);
        try {
          const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
          const signer = provider.getSigner();
          const erc1155 = new ethers.Contract(
            raffle.prizeCollection,
            contractABIs.erc1155Prize,
            signer
          );
          const approved = await erc1155.isApprovedForAll(address, raffle.address);
          setIs1155Approved(approved);
        } catch (e) {
          setIs1155Approved(false);
        } finally {
          setCheckingApproval(false);
        }
      }
    };
    checkApproval();
  }, [raffle, address]);

  // Approve ERC1155 for raffle contract
  const handleApprove1155 = async () => {
    if (!raffle || !raffle.prizeCollection || !address) return;
    setApproving(true);
    try {
      const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
      const signer = provider.getSigner();
      const erc1155 = new ethers.Contract(
        raffle.prizeCollection,
        contractABIs.erc1155Prize,
        signer
      );
      const tx = await erc1155.setApprovalForAll(raffle.address, true);
      await tx.wait();
      setIs1155Approved(true);
      alert('Approval successful! You can now deposit the prize.');
    } catch (e) {
      alert('Approval failed: ' + (e?.reason || e?.message || e));
    } finally {
      setApproving(false);
    }
  };

  // Check ERC20 approval (allowance) if needed
  useEffect(() => {
    const checkERC20Approval = async () => {
      if (
        raffle &&
        raffle.erc20PrizeToken &&
        raffle.erc20PrizeToken !== ethers.constants.AddressZero &&
        raffle.erc20PrizeAmount &&
        address &&
        address.toLowerCase() === raffle.creator.toLowerCase()
      ) {
        setCheckingERC20Approval(true);
        try {
          const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
          const signer = provider.getSigner();
          const erc20 = new ethers.Contract(
            raffle.erc20PrizeToken,
            contractABIs.erc20,
            signer
          );
          const allowance = await erc20.allowance(address, raffle.address);
          setIsERC20Approved(allowance.gte(raffle.erc20PrizeAmount));
        } catch (e) {
          setIsERC20Approved(false);
        } finally {
          setCheckingERC20Approval(false);
        }
      }
    };
    checkERC20Approval();
  }, [raffle, address]);

  // Approve ERC20 for raffle contract
  const handleApproveERC20 = async () => {
    if (!raffle || !raffle.erc20PrizeToken || !raffle.erc20PrizeAmount || !address) return;
    setApprovingERC20(true);
    try {
      const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
      const signer = provider.getSigner();
      const erc20 = new ethers.Contract(
        raffle.erc20PrizeToken,
        contractABIs.erc20,
        signer
      );
      // Approve max uint256 for convenience
      const tx = await erc20.approve(raffle.address, ethers.constants.MaxUint256);
      await tx.wait();
      setIsERC20Approved(true);
      alert('ERC20 approval successful! You can now deposit the prize.');
    } catch (e) {
      alert('ERC20 approval failed: ' + (e?.reason || e?.message || e));
    } finally {
      setApprovingERC20(false);
    }
  };

  // Check ERC721 approval if needed
  useEffect(() => {
    const checkERC721Approval = async () => {
      if (
        raffle &&
        raffle.standard === 0 &&
        raffle.prizeCollection &&
        typeof raffle.prizeTokenId !== 'undefined' &&
        address &&
        address.toLowerCase() === raffle.creator.toLowerCase()
      ) {
        setCheckingERC721Approval(true);
        try {
          const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
          const signer = provider.getSigner();
          const erc721 = new ethers.Contract(
            raffle.prizeCollection,
            contractABIs.erc721Prize,
            signer
          );
          // Check getApproved for the specific tokenId
          const approvedAddress = await erc721.getApproved(raffle.prizeTokenId);
          if (approvedAddress && approvedAddress.toLowerCase() === raffle.address.toLowerCase()) {
            setIsERC721Approved(true);
          } else {
            // Check isApprovedForAll as fallback
            const isAll = await erc721.isApprovedForAll(address, raffle.address);
            setIsERC721Approved(isAll);
          }
        } catch (e) {
          setIsERC721Approved(false);
        } finally {
          setCheckingERC721Approval(false);
        }
      }
    };
    checkERC721Approval();
  }, [raffle, address]);

  // Approve ERC721 for raffle contract
  const handleApproveERC721 = async () => {
    if (!raffle || !raffle.prizeCollection || typeof raffle.prizeTokenId === 'undefined' || !address) return;
    setApprovingERC721(true);
    try {
      const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.getDefaultProvider();
      const signer = provider.getSigner();
      const erc721 = new ethers.Contract(
        raffle.prizeCollection,
        contractABIs.erc721Prize,
        signer
      );
      const tx = await erc721.approve(raffle.address, raffle.prizeTokenId);
      await tx.wait();
      setIsERC721Approved(true);
      alert('ERC721 approval successful! You can now deposit the prize.');
    } catch (e) {
      alert('ERC721 approval failed: ' + (e?.reason || e?.message || e));
    } finally {
      setApprovingERC721(false);
    }
  };

  const handlePurchaseTickets = async (quantity) => {
    if (!connected || !raffle) {
      throw new Error('Wallet not connected or raffle not loaded');
    }

    const raffleContract = getContractInstance(raffle.address, 'raffle');
    if (!raffleContract) {
      throw new Error('Failed to get raffle contract');
    }

    const totalCost = ethers.BigNumber.from(raffle.ticketPrice).mul(quantity);
    
    const result = await executeTransaction(
      raffleContract.purchaseTickets,
      quantity,
      { value: totalCost }
    );

    if (result.success) {
      alert(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      // Refresh raffle data
      window.location.reload();
    } else {
      throw new Error(result.error);
    }
  };

  const handleDeleteRaffle = async () => {
    if (!raffle || !getContractInstance) return;
    
    setDeletingRaffle(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) {
        throw new Error('Contract instance not available');
      }

      const tx = await raffleContract.deleteRaffle();
      await tx.wait();
      
      // Show success message or redirect
      alert('Raffle deleted successfully!');
        navigate('/');
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Failed to delete raffle: ' + error.message);
    } finally {
      setDeletingRaffle(false);
    }
  };

  const canDelete = () => {
    // Can delete if user is the creator and raffle is in pending or active state
    return connected && 
           address?.toLowerCase() === raffle?.creator.toLowerCase() && 
           (raffle?.state === 'pending' || raffle?.state === 'active');
  };

  const getStatusBadge = () => {
    if (!raffle) return null;
    const label = RAFFLE_STATE_LABELS[raffle.stateNum] || 'Unknown';
    const colorMap = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-green-100 text-green-800',
      'Ended': 'bg-red-100 text-red-800',
      'Drawing': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Deleted': 'bg-gray-200 text-gray-800',
      'Activation Failed': 'bg-red-200 text-red-900',
      'All Prizes Claimed': 'bg-blue-200 text-blue-900',
      'Unengaged': 'bg-gray-100 text-gray-800',
      'Unknown': 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-3 py-1 rounded-full text-sm ${colorMap[label] || colorMap['Unknown']}`}>{label}</span>;
  };

  async function handleDepositPrize() {
    setDepositingPrize(true);
    try {
      const contract = getContractInstance(raffleAddress, 'raffle');
      const tx = await contract.depositEscrowPrize({ value: raffle.ethPrizeAmount || 0 });
      await tx.wait();
      alert('Prize deposited successfully!');
    } catch (e) {
      alert('Deposit failed: ' + (e?.reason || e?.message || e));
    } finally {
      setDepositingPrize(false);
    }
  }

  async function handleWithdrawPrize() {
    setWithdrawingPrize(true);
    try {
      const contract = getContractInstance(raffleAddress, 'raffle');
      const tx = await contract.withdrawEscrowedPrize();
      await tx.wait();
      alert('Prize withdrawn successfully!');
    } catch (e) {
      alert('Withdraw failed: ' + (e?.reason || e?.message || e));
    } finally {
      setWithdrawingPrize(false);
    }
  }

  // Debug logging for raffle and approval states
  useEffect(() => {
    console.log('RAFFLE:', raffle);
    console.log('isEscrowedPrize:', isEscrowedPrize);
    console.log('is1155Approved:', is1155Approved);
    console.log('checkingApproval:', checkingApproval);
  }, [raffle, isEscrowedPrize, is1155Approved, checkingApproval]);

  if (loading) {
    return (
      <PageContainer variant="wide" className="py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading raffle details...</p>
        </div>
      </PageContainer>
    );
  }

  if (!raffle) {
    return (
      <PageContainer variant="wide" className="py-8">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Raffle Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The raffle you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide" className="py-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Raffles
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{raffle.name}</h1>
            <p className="text-muted-foreground">
              Created by {raffle.creator.slice(0, 10)}...{raffle.creator.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              (raffle.stateNum === 0 || raffle.stateNum === 1) &&
              raffle.prizeCollection &&
              raffle.prizeCollection !== ethers.constants.AddressZero &&
              raffle.usesCustomPrice && (
                <Button
                onClick={handleDeleteRaffle}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-pink-700 transition-colors text-sm font-medium"
                title={raffle.ticketsSold > 0 ? "Delete raffle (refunds will be processed automatically)" : "Delete this raffle"}
                  disabled={deletingRaffle}
              >
                <Trash2 className="h-4 w-4" />
                  {deletingRaffle ? 'Deleting...' : 'Delete Raffle'}
                </Button>
            )}
            {/* Mint to Winner: Only show for non-escrowed NFT prizes */}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              raffle.prizeCollection &&
              raffle.prizeCollection !== ethers.constants.AddressZero &&
              (!raffle.erc20PrizeAmount || raffle.erc20PrizeAmount.isZero?.() || raffle.erc20PrizeAmount === '0') &&
              (!raffle.ethPrizeAmount || raffle.ethPrizeAmount.isZero?.() || raffle.ethPrizeAmount === '0') &&
              !isEscrowedPrize && (
              <Button
                onClick={async () => {
                  try {
                    const raffleContract = getContractInstance(raffle.address, 'raffle');
                    if (!raffleContract) throw new Error('Failed to get raffle contract');
                    const result = await executeTransaction(raffleContract.mintToWinner);
                    if (result.success) {
                      alert('mintToWinner() executed successfully!');
                      window.location.reload();
                    } else {
                      throw new Error(result.error);
                    }
                  } catch (err) {
                    alert('mintToWinner failed: ' + err.message);
                  }
                }}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
              >
                Mint to Winner
              </Button>
            )}
            {/* ERC20 Approval and Deposit Prize logic */}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              isEscrowedPrize &&
              raffle.erc20PrizeToken &&
              raffle.erc20PrizeToken !== ethers.constants.AddressZero &&
              raffle.erc20PrizeAmount &&
              !isERC20Approved && (
                <Button
                  onClick={handleApproveERC20}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={approvingERC20 || checkingERC20Approval}
                >
                  {approvingERC20 ? 'Approving...' : 'Approve ERC20 Prize'}
                </Button>
            )}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              isEscrowedPrize &&
              raffle.erc20PrizeToken &&
              raffle.erc20PrizeToken !== ethers.constants.AddressZero &&
              raffle.erc20PrizeAmount &&
              isERC20Approved && (
                <Button
                  onClick={handleDepositPrize}
                  className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={depositingPrize}
                >
                  {depositingPrize ? 'Depositing...' : 'Deposit Prize'}
                </Button>
            )}
            {/* ERC721 Approval and Deposit Prize logic */}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              isEscrowedPrize &&
              raffle.standard === 0 &&
              raffle.prizeCollection &&
              typeof raffle.prizeTokenId !== 'undefined' &&
              !isERC721Approved && (
                <Button
                  onClick={handleApproveERC721}
                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={approvingERC721 || checkingERC721Approval}
                >
                  {approvingERC721 ? 'Approving...' : 'Approve NFT Prize'}
                </Button>
            )}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              isEscrowedPrize &&
              raffle.standard === 0 &&
              raffle.prizeCollection &&
              typeof raffle.prizeTokenId !== 'undefined' &&
              isERC721Approved && (
                <Button
                  onClick={handleDepositPrize}
                  className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={depositingPrize}
                >
                  {depositingPrize ? 'Depositing...' : 'Deposit Prize'}
                </Button>
            )}
            {/* ERC1155 Approval and Deposit Prize logic */}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              isEscrowedPrize &&
              raffle.standard === 1 &&
              (
                checkingApproval ? (
                  <Button disabled className="ml-2 bg-blue-300 text-white">Checking approval...</Button>
                ) : !is1155Approved ? (
                  <Button
                    onClick={handleApprove1155}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Approve NFT Prize'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleDepositPrize}
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={depositingPrize}
                  >
                    {depositingPrize ? 'Depositing...' : 'Deposit Prize'}
                  </Button>
                )
              )
            }
            {/* Withdraw Prize button for creator if escrowed and not withdrawn */}
            {connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() &&
              isEscrowedPrize &&
              raffle.standard === 1 &&
              (
                <Button
                  onClick={handleWithdrawPrize}
                  className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={withdrawingPrize}
                >
                  {withdrawingPrize ? 'Withdrawing...' : 'Withdraw Prize'}
                </Button>
              )
            }
          </div>
        </div>
        
        {/* Show deletion info for creators */}
        {canDelete() && raffle.ticketsSold > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ As the raffle creator, you can delete this raffle. Deletion will automatically process refunds for all {raffle.ticketsSold} sold tickets.
            </p>
          </div>
        )}
        
        {/* Show info when user is creator but can't delete */}
        {connected && 
         address?.toLowerCase() === raffle.creator.toLowerCase() && 
         !canDelete() && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-800">
              ℹ️ As the raffle creator, you can only delete this raffle when it's in pending or active state.
            </p>
          </div>
        )}
      </div>

      {/* Raffle Info */}
      <div className="mb-8 p-6 bg-background border border-border rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center items-center">
          <div>
            <p className="text-2xl font-bold">{raffle.ticketsSold}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tickets Sold</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{raffle.ticketLimit}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{raffle.winnersCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Winners</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{timeRemaining}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</p>
          </div>
          {/* Refundability Tag as a column */}
          <div className="flex justify-center lg:justify-end items-center h-full w-full">
            {(() => {
              const { refundable, reason, label } = getRefundability(raffle);
              return (
                <span className={`px-3 py-1 rounded-full font-semibold ${refundable ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'} text-xs`}
                  title={reason}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                  <Info className="inline-block ml-1 h-4 w-4 text-gray-400 align-middle" title={reason} />
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Half - Raffle Engagement */}
        <div className="space-y-6">
          <TicketPurchaseSection raffle={raffle} onPurchase={handlePurchaseTickets} timeRemaining={timeRemaining} />
          
          {/* Additional Raffle Details */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Raffle Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Contract Address:</span>
                <span className="font-mono">{raffle.address.slice(0, 10)}...{raffle.address.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Start Time:</span>
                <span>{new Date(raffle.startTime * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span>{formatDuration(raffle.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Ticket Price:</span>
                <span>{ethers.utils.formatEther(raffle.ticketPrice)} ETH</span>
              </div>
              {/* Prize Details */}
              {raffle.isPrized && (
                <>
                  {/* ETH Prize */}
                  {raffle.ethPrizeAmount && raffle.ethPrizeAmount.gt && raffle.ethPrizeAmount.gt(0) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prize Amount:</span>
                      <span>{ethers.utils.formatEther(raffle.ethPrizeAmount)} ETH</span>
                    </div>
                  )}
                  {/* ERC20 Prize */}
                  {raffle.erc20PrizeToken && raffle.erc20PrizeToken !== ethers.constants.AddressZero && raffle.erc20PrizeAmount && raffle.erc20PrizeAmount.gt && raffle.erc20PrizeAmount.gt(0) && (
                    <ERC20PrizeAmount token={raffle.erc20PrizeToken} amount={raffle.erc20PrizeAmount} />
                  )}
                  {/* NFT Prize */}
                  {raffle.prizeCollection && raffle.prizeCollection !== ethers.constants.AddressZero && (!raffle.erc20PrizeAmount || raffle.erc20PrizeAmount.isZero?.() || raffle.erc20PrizeAmount === '0') && (!raffle.ethPrizeAmount || raffle.ethPrizeAmount.isZero?.() || raffle.ethPrizeAmount === '0') && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Prize Collection:</span>
                  <span className="font-mono">{raffle.prizeCollection.slice(0, 10)}...{raffle.prizeCollection.slice(-8)}</span>
                </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Half - Prize Art and Winners */}
        <div className="flex flex-col gap-6 h-full">
          <PrizeImageCard raffle={raffle} />
          <WinnersSection raffle={raffle} />
        </div>
      </div>
    </PageContainer>
  );
};

export default RaffleDetailPage;

