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
import { toast } from '../components/ui/sonner';

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

// Utility to extract only the revert reason from contract errors
function extractRevertReason(error) {
  if (error?.reason) return error.reason;
  if (error?.data?.message) return error.data.message;
  const msg = error?.message || error?.data?.message || error?.toString() || '';
  const match = msg.match(/execution reverted:?\s*([^\n]*)/i);
  if (match && match[1]) return match[1].trim();
  return msg;
}

const TicketPurchaseSection = ({ raffle, onPurchase, timeRemaining, winners, shouldShowClaimPrize, prizeAlreadyClaimed, claimingPrize, handleClaimPrize, shouldShowClaimRefund, claimingRefund, handleClaimRefund, refundableAmount, isMintableERC721, showMintInput, setShowMintInput, mintWinnerAddress, setMintWinnerAddress, mintingToWinner, handleMintToWinner }) => {
  const { connected, address } = useWallet();
  const { getContractInstance, executeTransaction } = useContract();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [socialTasks, setSocialTasks] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [requestingRandomness, setRequestingRandomness] = useState(false);
  const [userTickets, setUserTickets] = useState(0);
  // In TicketPurchaseSection, add state for winning chance
  const [winningChance, setWinningChance] = useState(null);
  // Add state for activating
  const [activating, setActivating] = useState(false);
  // 1. Add usesCustomPrice state to TicketPurchaseSection
  const [usesCustomPrice, setUsesCustomPrice] = useState(null);
  // Add state for ending raffle
  const [endingRaffle, setEndingRaffle] = useState(false);

  useEffect(() => {
    loadSocialTasks();
    fetchUserTickets();
  }, [raffle.address, address]);

  // 2. In useEffect, after fetching raffle data, fetch usesCustomPrice
  useEffect(() => {
    async function fetchUsesCustomPrice() {
      if (!raffle.address) return;
      try {
        const raffleContract = getContractInstance(raffle.address, 'raffle');
        if (!raffleContract) return;
        const result = await raffleContract.usesCustomPrice();
        setUsesCustomPrice(result);
      } catch (e) {
        setUsesCustomPrice(null);
      }
    }
    fetchUsesCustomPrice();
  }, [raffle.address, getContractInstance]);

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

  // Update fetchUserTickets to also fetch participants.length and calculate winning chance
  const fetchUserTickets = async () => {
    if (!raffle.address || !address) {
      setUserTickets(0);
      setWinningChance(null);
      return;
    }
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) return;
      const tickets = await raffleContract.ticketsPurchased(address);
      setUserTickets(tickets.toNumber ? tickets.toNumber() : Number(tickets));
      // Fetch participants.length (total tickets sold)
      let totalTickets = 0;
      try {
        const participantsCount = await raffleContract.getParticipantsCount();
        totalTickets = participantsCount.toNumber();
      } catch (error) {
        // Fallback: count participants by iterating
        let index = 0;
        while (true) {
          try {
            await raffleContract.participants(index);
            totalTickets++;
            index++;
          } catch {
            break;
          }
        }
      }
      // Calculate winning chance
      if (totalTickets > 0 && tickets > 0) {
        setWinningChance(((tickets / totalTickets) * 100).toFixed(2));
      } else {
        setWinningChance(null);
      }
    } catch (e) {
      setUserTickets(0);
      setWinningChance(null);
    }
  };

  const handleTasksCompleted = (completed) => {
    setTasksCompleted(completed);
  };

  const handlePurchase = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tasksCompleted) {
      toast.error('Please complete all required social media tasks before purchasing tickets');
      return;
    }

    setLoading(true);
    try {
      await onPurchase(quantity);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error(extractRevertReason(error));
    } finally {
      setLoading(false);
    }
  };
  const handleActivateRaffle = async () => {
    setActivating(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      const result = await executeTransaction(raffleContract.activate);
      if (result.success) {
        toast.success('Raffle activated successfully!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(extractRevertReason(err));
    } finally {
      setActivating(false);
    }
  };
  
  const handleRequestRandomness = async () => {
    setRequestingRandomness(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      const result = await executeTransaction(raffleContract.requestRandomWords);
      if (result.success) {
        toast.success('Randomness requested successfully!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(extractRevertReason(error));
    } finally {
      setRequestingRandomness(false);
    }
  };

  const handleEndRaffle = async () => {
    setEndingRaffle(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      const result = await executeTransaction(raffleContract.endRaffle);
      if (result.success) {
        toast.success('Raffle ended successfully!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(extractRevertReason(err));
    } finally {
      setEndingRaffle(false);
    }
  };

  const canPurchaseTickets = () => {
    // Can only purchase tickets if raffle is active AND tasks are completed
    return raffle.state?.toLowerCase() === 'active' && tasksCompleted;
  };

  const isRaffleEnded = () => {
    const now = Math.floor(Date.now() / 1000);
    const raffleEndTime = raffle.startTime + raffle.duration;
    
    // Raffle is ended if:
    // 1. Raffle is in 'Active' state AND current time has passed the raffle's end time, OR
    // 2. Contract state is Ended/Completed/Drawing, OR
    // 3. Timer shows "Ended"
    return (raffle.state === 'Active' && now >= raffleEndTime) ||
           raffle.state === 'Ended' || 
           raffle.state === 'Completed' || 
           raffle.state === 'Drawing' || 
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

  const now = Math.floor(Date.now() / 1000);
  const canActivate = raffle && raffle.startTime ? now >= raffle.startTime : false;

  // Add before the return statement in TicketPurchaseSection:
  const canClaimPrize = () => {
    // Can only claim if:
    // 1. User is connected
    // 2. Raffle is completed
    // 3. Raffle has prizes (not whitelist)
    // 4. User is a winner
    // 5. User hasn't claimed yet
    if (!address || !raffle.isPrized) return false;
    if (raffle.stateNum !== 4 && raffle.stateNum !== 7) return false;
    if (!winners) return false;
    const winner = winners.find(w => w.address.toLowerCase() === address.toLowerCase());
    return winner && !winner.prizeClaimed;
  };

  const canClaimRefund = () => {
    // Allow refund claim if:
    // 1. Raffle is prized (not whitelist)
    // 2. State is Completed, All Prizes Claimed, or Unengaged
    // 3. User has refundable amount > 0
    return (
      raffle.isPrized &&
      (raffle.stateNum === 4 || raffle.stateNum === 7 || raffle.stateNum === 8) &&
      refundableAmount && refundableAmount.gt && refundableAmount.gt(0)
    );
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Ticket className="h-5 w-5" />
        Purchase Tickets
      </h3>

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

        {/* Replace the grid in the purchase card with the new arrangement */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
            <span className="text-muted-foreground">Ticket Price{usesCustomPrice === true ? ' (set by Creator)' : usesCustomPrice === false ? ' (Protocol Ticket Fee)' : ''}:</span>
              <p className="font-semibold text-lg">{ethers.utils.formatEther(raffle.ticketPrice || '0')} ETH</p>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining tickets:</span>
              <p className="font-semibold text-lg">{remainingTickets}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Your tickets:</span>
            <p className="font-semibold text-lg">{userTickets || 0}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Winning Chance:</span>
            <p className="font-semibold text-lg">{winningChance !== null ? `${winningChance}%` : 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Max per user:</span>
              <p className="font-semibold text-lg">{raffle.maxTicketsPerParticipant}</p>
            </div>
            {canClaimRefund && refundableAmount && refundableAmount.gt && refundableAmount.gt(0) && (
              <div>
                <span className="text-muted-foreground">Your Refundable Amount:</span>
                <p className="font-semibold text-lg">{ethers.utils.formatEther(refundableAmount)} ETH</p>
              </div>
            )}
          <div></div>
          </div>

        {/* Button/message area */}
        {(raffle.stateNum === 4 || raffle.stateNum === 7 || raffle.stateNum === 8) ? (
          (canClaimPrize() || canClaimRefund()) ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {canClaimPrize() && (
                <button
                  onClick={handleClaimPrize}
                  disabled={claimingPrize || !connected}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-md hover:from-yellow-600 hover:to-orange-700 transition-colors disabled:opacity-50"
                >
                  {claimingPrize ? (isMintableERC721 ? 'Minting...' : 'Claiming...') : (isMintableERC721 ? 'Mint Prize' : 'Claim Prize')}
                </button>
              )}
              {canClaimRefund() && (
                <button
                  onClick={handleClaimRefund}
                  disabled={claimingRefund || !connected}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-md hover:from-green-600 hover:to-teal-700 transition-colors disabled:opacity-50"
                >
                  {claimingRefund ? 'Claiming...' : 'Claim Refund'}
                </button>
              )}
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white px-6 py-3 rounded-md opacity-60 cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              Sold Out
            </button>
          )
        ) : (
          // All other main action buttons (Activate, Purchase, Sold Out, etc.)
          <>
            {/* ...existing main action button logic here (Activate, Purchase, Sold Out, etc.)... */}
        {raffle.state?.toLowerCase() === 'pending' && canActivate ? (
          <button
            onClick={handleActivateRaffle}
            disabled={activating}
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-md hover:from-green-600 hover:to-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {activating ? 'Activating...' : 'Activate Raffle'}
          </button>
            ) : raffle.stateNum === 2 && (address?.toLowerCase() === raffle.creator.toLowerCase() || userTickets > 0) ? (
          <>
            <button
              onClick={handleRequestRandomness}
              disabled={requestingRandomness}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {requestingRandomness ? 'Requesting...' : 'Request Randomness'}
            </button>
            <p className="text-muted-foreground mt-4 text-center text-sm">
                  The raffle has ended. {address?.toLowerCase() === raffle.creator.toLowerCase() ? 'As the creator' : 'As a participant'}, you can request the randomness to initiate winner selection.
            </p>
          </>
            ) : (raffle.state === 'Completed' || raffle.stateNum === 4 || raffle.stateNum === 7) ? (
              <button
                disabled
                className="w-full bg-gray-400 text-white px-6 py-3 rounded-md opacity-60 cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                Sold Out
              </button>
        ) : isRaffleEnded() ? (
          <button
            onClick={handleEndRaffle}
            disabled={endingRaffle}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-md hover:from-red-600 hover:to-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {endingRaffle ? 'Ending...' : 'End Raffle'}
          </button>
        ) : maxPurchasable <= 0 ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white px-6 py-3 rounded-md opacity-60 cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            Sold Out
          </button>
        ) : userTickets >= raffle.maxTicketsPerParticipant ? (
          <button
            disabled
            className="w-full bg-gray-400 text-white px-6 py-3 rounded-md opacity-60 cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            Limit Reached
          </button>
        ) : (
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
              <button
                onClick={handlePurchase}
                disabled={loading || !connected || !canPurchaseTickets()}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ticket className="h-4 w-4" />
                {loading ? 'Processing...' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </button>
              </>
            )}
            {!connected && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Please connect your wallet to purchase tickets.
                </p>
              </div>
            )}
            </>
          )}

          {!connected && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Please connect your wallet to purchase tickets.
              </p>
            </div>
          )}
        </div>
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

const WinnersSection = ({ raffle, isMintableERC721 }) => {
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
  // In WinnersSection, add state for open stats and stats data
  const [openStatsIndex, setOpenStatsIndex] = useState(null);
  const [winnerStats, setWinnerStats] = useState({});

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
      toast.error('Please connect your wallet to claim your prize');
      return;
    }

    // Check if user is a winner
    const isWinner = winners.some(winner => 
      winner.address.toLowerCase() === connectedAddress.toLowerCase()
    );

    if (!isWinner) {
      toast.error('You are not a winner of this raffle');
      return;
    }

    // Check if prize is already claimed
    const winner = winners.find(w => 
      w.address.toLowerCase() === connectedAddress.toLowerCase()
    );

    if (winner && winner.prizeClaimed) {
      toast.error('You have already claimed your prize');
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

        toast.success(`Successfully claimed your ${prizeType}!`);
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      toast.error(extractRevertReason(error));
    } finally {
      setClaimingPrize(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!connectedAddress || !raffle || !getContractInstance) {
      toast.error('Please connect your wallet to claim your refund');
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
        toast.success('Successfully claimed your refund!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error claiming refund:', error);
      toast.error(extractRevertReason(error));
    } finally {
      setClaimingRefund(false);
    }
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
              <div style={{ maxHeight: '320px', overflowY: 'auto' }} className="px-3">
                {winners.map((winner, i) => (
                    <div
                      key={winner.index}
                    className={`p-4 bg-background rounded-xl border-2${i !== winners.length - 1 ? ' mb-4' : ''} ${connectedAddress && winner.address.toLowerCase() === connectedAddress.toLowerCase() ? 'border-[#FFD700]' : 'border-border'}`}
                    >
                        <p
                      className="text-blue-600 dark:text-blue-400 font-mono cursor-pointer underline text-base text-center"
                          onClick={() => handleWinnerClick(winner, i)}
                        >
                          {winner.address}
                        </p>
                      </div>
                ))}
                {/* Render the modal only once, after the winners list */}
                {openStatsIndex !== null && winners[openStatsIndex] && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setOpenStatsIndex(null)}
                  >
                    <div
                      className="border border-border rounded-lg shadow-lg p-6 w-80 flex flex-col items-center"
                      style={{ background: '#111', minHeight: '240px' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {winnerStats[winners[openStatsIndex].address] ? (
                        winnerStats[winners[openStatsIndex].address].error ? (
                          <span className="text-red-500">{winnerStats[winners[openStatsIndex].address].error}</span>
                        ) : (
                          <>
                            <div className="mb-2 text-center font-semibold text-white">Winner Stats</div>
                            <div className="flex flex-col gap-2 w-full text-white">
                              <div className="flex justify-between w-full"><span>Tickets Purchased:</span><span>{winnerStats[winners[openStatsIndex].address].ticketsPurchased}</span></div>
                              <div className="flex justify-between w-full"><span>Winning Tickets:</span><span>{winnerStats[winners[openStatsIndex].address].winningTickets}</span></div>
                              <div className="flex justify-between w-full"><span>Losing Tickets:</span><span>{winnerStats[winners[openStatsIndex].address].losingTickets}</span></div>
                              <div className="flex justify-between w-full"><span>Prize Claimed:</span><span>{!raffle.isPrized ? 'No Prize' : (winnerStats[winners[openStatsIndex].address].prizeClaimed ? 'Yes' : 'No')}</span></div>
                            </div>
                          </>
                        )
                      ) : (
                        <span className="text-white">Loading...</span>
                      )}
                    </div>
                  </div>
                )}
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

  const handleWinnerClick = async (winner, index) => {
    if (openStatsIndex === index) {
      setOpenStatsIndex(null);
      return;
    }
    setOpenStatsIndex(index);
    // Fetch stats if not already fetched
    if (!winnerStats[winner.address]) {
      try {
        const raffleContract = getContractInstance(raffle.address, 'raffle');
        const ticketsPurchased = await raffleContract.ticketsPurchased(winner.address);
        const winningTickets = await raffleContract.winsPerAddress(winner.address);
        const prizeClaimed = await raffleContract.prizeClaimed(winner.address);
        setWinnerStats(prev => ({
          ...prev,
          [winner.address]: {
            ticketsPurchased: ticketsPurchased.toNumber ? ticketsPurchased.toNumber() : Number(ticketsPurchased),
            winningTickets: winningTickets.toNumber ? winningTickets.toNumber() : Number(winningTickets),
            losingTickets: (ticketsPurchased.toNumber ? ticketsPurchased.toNumber() : Number(ticketsPurchased)) - (winningTickets.toNumber ? winningTickets.toNumber() : Number(winningTickets)),
            prizeClaimed: !!prizeClaimed
          }
        }));
      } catch (e) {
        setWinnerStats(prev => ({
          ...prev,
          [winner.address]: { error: 'Failed to fetch stats' }
        }));
      }
    }
  };

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Winners</CardTitle>
        <div className="flex gap-2"></div>
      </CardHeader>
      <CardContent className="overflow-y-auto p-2">
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

// Helper function to get the correct explorer link for the prize collection
function getExplorerLink(address) {
  let chainId = 1;
  if (window.ethereum && window.ethereum.chainId) {
    chainId = parseInt(window.ethereum.chainId, 16);
  }
  const explorerMap = {
    1: 'https://etherscan.io',
    10: 'https://optimistic.etherscan.io',
    56: 'https://bscscan.com',
    97: 'https://testnet.bscscan.com',
    43113: 'https://testnet.snowscan.xyz', // updated
    43114: 'https://snowscan.xyz', // updated
    8453: 'https://basescan.org',
    84532: 'https://sepolia.basescan.org',
    11155111: 'https://sepolia.etherscan.io',
    11155420: 'https://sepolia-optimism.etherscan.io',
    2020: 'https://app.roninchain.com',
    2021: 'https://saigon-app.roninchain.com/explorer',
    42161: 'https://arbiscan.io',
    421614: 'https://sepolia.arbiscan.io',
  };
  const baseUrl = explorerMap[chainId] || explorerMap[1];
  return `${baseUrl}/address/${address}`;
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
  // Add the missing isRefundable state
  const [isRefundable, setIsRefundable] = useState(null);

  // Add these states and handler at the top level of RaffleDetailPage (inside the component):
  const [showMintInput, setShowMintInput] = useState(false);
  const [mintWinnerAddress, setMintWinnerAddress] = useState("");
  const [mintingToWinner, setMintingToWinner] = useState(false);
  const handleMintToWinner = async () => {
    setMintingToWinner(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      if (!mintWinnerAddress || mintWinnerAddress.length !== 42) throw new Error('Please enter a valid address');
      const result = await executeTransaction(() => raffleContract.mintToWinner(mintWinnerAddress));
      if (result.success) {
        toast.success('mintToWinner() executed successfully!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(extractRevertReason(err));
    } finally {
      setMintingToWinner(false);
    }
  };

  // Add at the top level of RaffleDetailPage (inside the component):
  const [showAssignPrizeInput, setShowAssignPrizeInput] = useState(false);
  const [assignPrizeAddress, setAssignPrizeAddress] = useState("");
  const [assigningPrize, setAssigningPrize] = useState(false);
  const handleAssignPrize = async () => {
    setAssigningPrize(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      if (!assignPrizeAddress || assignPrizeAddress.length !== 42) throw new Error('Please enter a valid address');
      const result = await executeTransaction(() => raffleContract.setExternalPrize(assignPrizeAddress));
      if (result.success) {
        toast.success('Prize assigned successfully!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error(extractRevertReason(err));
    } finally {
      setAssigningPrize(false);
    }
  };

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
        const [name, creator, startTime, duration, ticketPrice, ticketLimit, winnersCount, maxTicketsPerParticipant, isPrizedContract, prizeCollection, prizeTokenId, standard, stateNum, erc20PrizeToken, erc20PrizeAmount, ethPrizeAmount, usesCustomPrice, isRefundableFlag] = await Promise.all([
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
          raffleContract.usesCustomPrice?.(),
          raffleContract.isRefundable?.()
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
        setIsRefundable(isRefundableFlag);
      } catch (error) {
        console.error('Error fetching raffle data:', error);
        toast.error(extractRevertReason(error));
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
      let label = '';
      let seconds = 0;
      if ([2,3,4,5,6,7,8].includes(raffle.stateNum)) {
        label = 'Duration';
        seconds = raffle.duration;
        setTimeLabel(label);
        setTimeValue(formatDuration(seconds));
        return;
      }
      if (now < raffle.startTime) {
        label = 'Starts In';
        seconds = raffle.startTime - now;
        } else {
        label = 'Ends In';
        seconds = (raffle.startTime + raffle.duration) - now;
        }
      setTimeLabel(label);
      setTimeValue(seconds > 0 ? formatTime(seconds) : 'Ended');
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
      toast.success('Approval successful! You can now deposit the prize.');
    } catch (e) {
      toast.error(extractRevertReason(e));
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
      toast.success('ERC20 approval successful! You can now deposit the prize.');
    } catch (e) {
      toast.error(extractRevertReason(e));
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
      toast.success('ERC721 approval successful! You can now deposit the prize.');
    } catch (e) {
      toast.error(extractRevertReason(e));
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
      toast.success(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      // Refresh raffle data
      window.location.reload();
    } else {
      throw new Error(result.error);
    }
  };

  const handleDeleteRaffle = async () => {
    if (!raffle || !getContractInstance) return;
    
    // Debug logging
    console.log('Attempting to delete raffle:', {
      address: raffle.address,
      state: raffle.state,
      stateNum: raffle.stateNum,
      creator: raffle.creator,
      userAddress: address,
      isCreator: address?.toLowerCase() === raffle.creator.toLowerCase(),
      prizeCollection: raffle.prizeCollection,
      usesCustomPrice: raffle.usesCustomPrice,
      canDelete: canDelete()
    });
    
    setDeletingRaffle(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) {
        throw new Error('Contract instance not available');
      }

      const tx = await raffleContract.deleteRaffle();
      await tx.wait();
      
      // Show success message or redirect
      toast.success('Raffle deleted successfully!');
        navigate('/');
    } catch (error) {
      console.error('Error deleting raffle:', error);
      toast.error(extractRevertReason(error));
    } finally {
      setDeletingRaffle(false);
    }
  };

  const canDelete = () => {
    // Only show if user is creator, raffle is Pending or Active, and (isRefundable or usesCustomPrice)
    return (
      connected &&
           address?.toLowerCase() === raffle?.creator.toLowerCase() && 
      (raffle?.state === 'Pending' || raffle?.state === 'Active') &&
      (isRefundable === true || raffle?.usesCustomPrice === true)
    );
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

  async function handleWithdrawPrize() {
    setWithdrawingPrize(true);
    try {
      const contract = getContractInstance(raffleAddress, 'raffle');
      const tx = await contract.withdrawEscrowedPrize();
      await tx.wait();
      toast.success('Prize withdrawn successfully!');
    } catch (e) {
      toast.error(extractRevertReason(e));
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

  // Determine if activation is allowed
  const now = Math.floor(Date.now() / 1000);
  const canActivate = raffle && raffle.startTime ? now >= raffle.startTime : false;

  // ... at the top of RaffleDetailPage, after other useState hooks ...
  const [timeLabel, setTimeLabel] = useState('');
  const [timeValue, setTimeValue] = useState('');

  // 1. Move winner/refund state and logic to RaffleDetailPage
  // (Insert after other useState hooks in RaffleDetailPage)
  const [winners, setWinners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [claimingPrize, setClaimingPrize] = useState(false);
  const [claimingRefund, setClaimingRefund] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [eligibleForRefund, setEligibleForRefund] = useState(false);
  const [refundClaimed, setRefundClaimed] = useState(false);
  const [refundableAmount, setRefundableAmount] = useState(null);
  const [nonWinningTickets, setNonWinningTickets] = useState(0);

  // Winner/refund logic for rendering
  const winnerObj = winners.find(w => w.address.toLowerCase() === address?.toLowerCase());
  const shouldShowClaimPrize = !!winnerObj && raffle?.isPrized && (raffle?.stateNum === 4 || raffle?.stateNum === 7);
  const prizeAlreadyClaimed = winnerObj && winnerObj.prizeClaimed;
  const shouldShowClaimRefund =
    raffle?.isPrized &&
    (raffle?.stateNum === 4 || raffle?.stateNum === 7) &&
    eligibleForRefund &&
    refundableAmount && refundableAmount.gt && refundableAmount.gt(0);

  useEffect(() => {
    async function fetchWinners() {
      if (!raffle || (raffle.stateNum !== 4 && raffle.stateNum !== 7)) {
        setWinners([]);
        setIsWinner(false);
        setEligibleForRefund(false);
        setRefundClaimed(false);
        setRefundableAmount(null);
        setNonWinningTickets(0);
        return;
      }
      setLoadingWinners(true);
      try {
        const raffleContract = getContractInstance && getContractInstance(raffle.address, 'raffle');
        if (!raffleContract) {
          setWinners([]);
          setLoadingWinners(false);
          return;
        }
        const winnersCount = await raffleContract.winnersCount();
        const count = winnersCount.toNumber ? winnersCount.toNumber() : Number(winnersCount);
        if (count === 0) {
          setWinners([]);
          setLoadingWinners(false);
          return;
        }
        const winnersArray = [];
        for (let i = 0; i < count; i++) {
          try {
            const winnerAddress = await raffleContract.winners(i);
            if (winnerAddress === ethers.constants.AddressZero || winnerAddress === '0x0000000000000000000000000000000000000000') {
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
            continue;
          }
        }
        setWinners(winnersArray);
        const winner = winnersArray.find(w => w.address.toLowerCase() === address?.toLowerCase());
        setIsWinner(!!winner);
        if (address && raffle.isPrized) {
          try {
            const refundable = await raffleContract.getRefundableAmount(address);
            setRefundableAmount(refundable);
            setEligibleForRefund(refundable && refundable.gt && refundable.gt(0));
          } catch (e) {
            setRefundableAmount(null);
            setEligibleForRefund(false);
          }
        }
        setNonWinningTickets(0);
      } catch (error) {
        setWinners([]);
        setIsWinner(false);
        setEligibleForRefund(false);
        setRefundClaimed(false);
        setRefundableAmount(null);
        setNonWinningTickets(0);
      } finally {
        setLoadingWinners(false);
      }
    }
    fetchWinners();
  }, [raffle, getContractInstance, address]);

  const handleClaimPrize = async () => {
    if (!address || !raffle || !getContractInstance) {
      toast.error('Please connect your wallet to claim your prize');
      return;
    }
    const isWinner = winners.some(winner => winner.address.toLowerCase() === address.toLowerCase());
    if (!isWinner) {
      toast.error('You are not a winner of this raffle');
      return;
    }
    const winner = winners.find(w => winner.address.toLowerCase() === address.toLowerCase());
    if (winner && winner.prizeClaimed) {
      toast.error('You have already claimed your prize');
      return;
    }
    setClaimingPrize(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      const result = await executeTransaction(raffleContract.claimPrize);
      if (result.success) {
        let prizeType = 'prize';
        if (raffle.ethPrizeAmount && raffle.ethPrizeAmount.gt && raffle.ethPrizeAmount.gt(0)) {
          prizeType = `${ethers.utils.formatEther(raffle.ethPrizeAmount)} ETH`;
        } else if (raffle.erc20PrizeToken && raffle.erc20PrizeToken !== ethers.constants.AddressZero && raffle.erc20PrizeAmount && raffle.erc20PrizeAmount.gt && raffle.erc20PrizeAmount.gt(0)) {
          prizeType = `${ethers.utils.formatUnits(raffle.erc20PrizeAmount, 18)} ERC20 tokens`;
        } else if (raffle.prizeCollection && raffle.prizeCollection !== ethers.constants.AddressZero) {
          prizeType = raffle.standard === 0 ? 'ERC721 NFT' : 'ERC1155 NFT';
        }
        toast.success(`Successfully claimed your ${prizeType}!`);
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(extractRevertReason(error));
    } finally {
      setClaimingPrize(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!address || !raffle || !getContractInstance) {
      toast.error('Please connect your wallet to claim your refund');
      return;
    }
    setClaimingRefund(true);
    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) throw new Error('Failed to get raffle contract');
      const result = await executeTransaction(raffleContract.claimRefund);
      if (result.success) {
        toast.success('Successfully claimed your refund!');
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(extractRevertReason(error));
    } finally {
      setClaimingRefund(false);
    }
  };

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

  // After loading raffle in RaffleDetailPage, define:
  const isMintableERC721 = (
    raffle &&
    raffle.prizeCollection &&
    raffle.prizeCollection !== ethers.constants.AddressZero &&
    raffle.standard === 0
  );

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
            {canDelete() && (
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
              (raffle.isPrized || isMintableERC721) &&
              raffle.prizeCollection &&
              raffle.prizeCollection !== ethers.constants.AddressZero &&
              (!raffle.erc20PrizeAmount || raffle.erc20PrizeAmount.isZero?.() || raffle.erc20PrizeAmount === '0') &&
              (!raffle.ethPrizeAmount || raffle.ethPrizeAmount.isZero?.() || raffle.ethPrizeAmount === '0') &&
              !isEscrowedPrize && (
              <div className="flex flex-col gap-2">
                {!showMintInput ? (
              <Button
                    onClick={() => setShowMintInput(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
              >
                Mint to Winner
              </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Enter winner address"
                      value={mintWinnerAddress}
                      onChange={e => setMintWinnerAddress(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background w-72 font-mono"
                      disabled={mintingToWinner}
                    />
                    <Button
                      onClick={handleMintToWinner}
                      disabled={mintingToWinner || !mintWinnerAddress || mintWinnerAddress.length !== 42}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50"
                    >
                      {mintingToWinner ? 'Minting...' : 'Submit'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowMintInput(false)}
                      disabled={mintingToWinner}
                      className="ml-2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
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
            {!raffle.isPrized &&
              raffle.stateNum === 0 &&
              connected &&
              address?.toLowerCase() === raffle.creator.toLowerCase() && (
                <div className="flex flex-col gap-2">
                  {!showAssignPrizeInput ? (
                    <Button
                      onClick={() => setShowAssignPrizeInput(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                    >
                      Assign Prize
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Enter prize collection address"
                        value={assignPrizeAddress}
                        onChange={e => setAssignPrizeAddress(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md bg-background w-72 font-mono"
                        disabled={assigningPrize}
                      />
                      <Button
                        onClick={handleAssignPrize}
                        disabled={assigningPrize || !assignPrizeAddress || assignPrizeAddress.length !== 42}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors disabled:opacity-50"
                      >
                        {assigningPrize ? 'Assigning...' : 'Submit'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAssignPrizeInput(false)}
                        disabled={assigningPrize}
                        className="ml-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
            )}
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
            <p className="text-2xl font-bold">{timeValue}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{timeLabel}</p>
          </div>
          {/* Refundability Tag as a column */}
          <div className="flex justify-center lg:justify-end items-center h-full w-full">
            {isRefundable && raffle && raffle.standard !== 2 && raffle.standard !== 3 && (() => {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Half - Raffle Engagement */}
        <div className="space-y-6 h-full">
          <TicketPurchaseSection
            raffle={raffle}
            onPurchase={handlePurchaseTickets}
            timeRemaining={timeRemaining}
            winners={winners}
            shouldShowClaimPrize={shouldShowClaimPrize}
            prizeAlreadyClaimed={prizeAlreadyClaimed}
            claimingPrize={claimingPrize}
            handleClaimPrize={handleClaimPrize}
            shouldShowClaimRefund={shouldShowClaimRefund}
            claimingRefund={claimingRefund}
            handleClaimRefund={handleClaimRefund}
            refundableAmount={refundableAmount}
            isMintableERC721={isMintableERC721}
            showMintInput={showMintInput}
            setShowMintInput={setShowMintInput}
            mintWinnerAddress={mintWinnerAddress}
            setMintWinnerAddress={setMintWinnerAddress}
            mintingToWinner={mintingToWinner}
            handleMintToWinner={handleMintToWinner}
          />
          
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
                <>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Prize Collection:</span>
                    <a
                      href={getExplorerLink(raffle.prizeCollection)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      {raffle.prizeCollection.slice(0, 10)}...{raffle.prizeCollection.slice(-8)}
                    </a>
                </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Collection Type:</span>
                    <span className="font-semibold">
                      {(() => {
                        if (typeof isEscrowedPrize === 'boolean' && typeof raffle.standard !== 'undefined') {
                          if (!isEscrowedPrize && raffle.standard === 0) return 'Mintable ERC721';
                          if (!isEscrowedPrize && raffle.standard === 1) return 'Mintable ERC1155';
                          if (isEscrowedPrize && raffle.standard === 0) return 'Escrowed ERC721';
                          if (isEscrowedPrize && raffle.standard === 1) return 'Escrowed ERC1155';
                        }
                        return 'Unknown';
                      })()}
                    </span>
                  </div>
                </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Half - Prize Art and Winners */}
        <div className="flex flex-col gap-6 h-full">
          <PrizeImageCard raffle={raffle} />
          <WinnersSection raffle={raffle} isMintableERC721={isMintableERC721} />
        </div>
      </div>
    </PageContainer>
  );
};

export default RaffleDetailPage;

