const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "YOUR_RAFFLE_DEPLOYER_ADDRESS";
const EXISTING_COLLECTION_ADDRESS = "YOUR_ERC721_COLLECTION_ADDRESS";

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    if (!ethers.isAddress(EXISTING_COLLECTION_ADDRESS)) throw new Error("Set EXISTING_COLLECTION_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "Existing ERC721 Prize Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 100,
        winnersCount: 5,
        maxTicketsPerParticipant: 2,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: true,
        prizeCollection: EXISTING_COLLECTION_ADDRESS,
        standard: 0, // ERC721
        prizeTokenId: 0,
        amountPerWinner: 1,
        collectionName: "",
        collectionSymbol: "",
        collectionBaseURI: "",
        creator: creator.address,
        royaltyPercentage: 0,
        royaltyRecipient: ethers.ZeroAddress,
        maxSupply: 0,
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New existing ERC721 prize raffle at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 