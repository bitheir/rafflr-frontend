const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0xD7fD72d4Dba1229Bc1b841e1655b2bDA615b8C17";

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "New ERC721 Prize Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 100,
        winnersCount: 5,
        maxTicketsPerParticipant: 2,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: false,
        prizeCollection: ethers.ZeroAddress,
        standard: 0, // ERC721
        prizeTokenId: 0,
        amountPerWinner: 1,
        collectionName: "My NFT Collection",
        collectionSymbol: "MYNFT",
        collectionBaseURI: "ipfs://Qm.../",
        creator: creator.address,
        royaltyPercentage: 500, // 5%
        royaltyRecipient: creator.address,
        maxSupply: 100,
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New ERC721 prize raffle at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 