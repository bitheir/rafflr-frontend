const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0xD7fD72d4Dba1229Bc1b841e1655b2bDA615b8C17";
const CUSTOM_TICKET_PRICE = ethers.parseEther("0.01"); // 0.01 ETH custom ticket price

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "NFT Prize Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 100,
        winnersCount: 5,
        maxTicketsPerParticipant: 2,
        isPrized: true,
        customTicketPrice: CUSTOM_TICKET_PRICE, // Custom ticket price
        erc721Drop: false,
        prizeCollection: ethers.ZeroAddress, // Will deploy new collection
        standard: 0, // ERC721
        prizeTokenId: 0,
        amountPerWinner: 1,
        collectionName: "My Prize Collection",
        collectionSymbol: "MPC",
        collectionBaseURI: "https://api.example.com/metadata/",
        creator: creator.address,
        royaltyPercentage: 500, // 5%
        royaltyRecipient: creator.address,
        maxSupply: 10, // Must be >= winnersCount
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0
    };

    // Create the raffle
    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    const raffleAddress = event.args.raffle;
    console.log("New NFT prize raffle at:", raffleAddress);
    console.log("Custom ticket price:", ethers.formatEther(CUSTOM_TICKET_PRICE), "ETH");
    console.log("Prize collection will be deployed automatically");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 