/**
 * Utility functions for raffle categorization and filtering
 */

/**
 * Check if a raffle's duration has elapsed
 * @param {Object} raffle - Raffle object with startTime and duration
 * @returns {boolean} - True if duration has elapsed
 */
export const isDurationElapsed = (raffle) => {
  const now = Math.floor(Date.now() / 1000);
  return (raffle.startTime + raffle.duration) <= now;
};

/**
 * Categorize raffles based on both contract state and duration
 * @param {Array} raffles - Array of raffle objects
 * @returns {Object} - Categorized raffles
 */
export const categorizeRaffles = (raffles) => {
  const pending = raffles.filter(raffle => 
    raffle.stateNum === 0 && !isDurationElapsed(raffle)
  );
  
  const active = raffles.filter(raffle => 
    raffle.stateNum === 1 && !isDurationElapsed(raffle)
  );
  
  // Raffles whose duration has elapsed go to ended regardless of contract state
  const ended = raffles.filter(raffle => 
    isDurationElapsed(raffle) && 
    raffle.stateNum !== 3 && 
    raffle.stateNum !== 4 // Not completed or all prizes claimed
  );
  
  // Corrected: Drawing is stateNum === 3
  const drawing = raffles.filter(raffle => 
    raffle.stateNum === 3 && !isDurationElapsed(raffle)
  );
  
  const completed = raffles.filter(raffle => 
    (raffle.stateNum === 4 || raffle.stateNum === 7) // Completed or all prizes claimed
  );

  return { pending, active, ended, drawing, completed };
};

/**
 * Filter raffles for display on specialized pages (NFT, Token, Whitelist)
 * Only shows pending/active raffles whose duration hasn't elapsed
 * @param {Array} raffles - Array of raffle objects
 * @returns {Array} - Filtered raffles
 */
export const filterActiveRaffles = (raffles) => {
  return raffles.filter(raffle => {
    return (raffle.stateNum === 0 || raffle.stateNum === 1) && !isDurationElapsed(raffle);
  });
}; 