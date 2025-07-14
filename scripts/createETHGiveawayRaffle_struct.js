const { ethers } = require("hardhat");

// The address of your deployed RaffleDeployer contract
const RAFFLE_DEPLOYER_ADDRESS = "0xc0C162cbBD3bC92e166786E831b19c6329552331";

// --- Raffle Configuration ---
const TOTAL_ETH_PRIZE = ethers.parseEther("0.00001"); // Total prize is 0.00001 ETH
const WINNERS_COUNT = 1; // There will be 1 winner

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) {
        throw new Error("Set a valid RAFFLE_DEPLOYER_ADDRESS");
    }
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    // --- Raffle Parameters for an ETH Giveaway ---
    const params = {
        name: "ETH Giveaway Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120, // Starts in 2 minutes
        duration: 1 * 24 * 60 * 60, // 1 day
        ticketLimit: 200,
        winnersCount: WINNERS_COUNT,
        maxTicketsPerParticipant: 5,
        isPrized: true,
        customTicketPrice: 0, // ETH raffles use the global ticket price
        erc721Drop: false,
        erc1155Drop: false,
        prizeCollection: ethers.ZeroAddress, // No NFT collection for an ETH prize
        standard: 3, // 3 = PrizeTypes.Standard.ETH
        prizeTokenId: 0,
        amountPerWinner: 0, // Not used for ETH prizes
        collectionName: "",
        collectionSymbol: "",
        collectionBaseURI: "",
        creator: creator.address,
        royaltyPercentage: 0,
        royaltyRecipient: ethers.ZeroAddress,
        maxSupply: 0,
        erc20PrizeToken: ethers.ZeroAddress, // No ERC20 token
        erc20PrizeAmount: 0,
        ethPrizeAmount: TOTAL_ETH_PRIZE, // Set the total ETH prize amount
        revealType: 0,
        unrevealedBaseURI: "",
        revealTime: 0
    };

    console.log(`Creating ETH giveaway raffle with a total prize of ${ethers.formatEther(TOTAL_ETH_PRIZE)} ETH...`);

    // Call createRaffle and send the total ETH prize amount with the transaction
    const tx = await raffleDeployer.createRaffle(params, { value: TOTAL_ETH_PRIZE });
    
    console.log("Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait(1);

    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) {
        throw new Error("RaffleCreated event not found in transaction receipt.");
    }

    console.log(`✅ ETH giveaway raffle created successfully!`);
    console.log(`   Raffle Address: ${event.args.raffle}`);
    console.log(`   Transaction Hash: ${receipt.hash}`);
}

main().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
