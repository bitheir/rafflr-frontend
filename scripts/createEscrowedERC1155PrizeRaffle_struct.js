const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0xD7fD72d4Dba1229Bc1b841e1655b2bDA615b8C17";
const ERC1155_ADDRESS = "0xc22cB08Bb25E5E3daefEFd1e17D4D60e7eEE20b8";
const PRIZE_TOKEN_ID = 1; // Set to the tokenId you want to escrow
const AMOUNT_PER_WINNER = 1; // Set to the amount per winner

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    if (!ethers.isAddress(ERC1155_ADDRESS)) throw new Error("Set ERC1155_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "Escrowed ERC1155 Prize Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 100,
        winnersCount: 5,
        maxTicketsPerParticipant: 2,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: false,
        prizeCollection: ERC1155_ADDRESS,
        standard: 1, // ERC1155
        prizeTokenId: PRIZE_TOKEN_ID,
        amountPerWinner: AMOUNT_PER_WINNER,
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
    console.log("New escrowed ERC1155 prize raffle at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 