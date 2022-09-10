const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const TOKEN_ID = 0;
const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
  const basicNFT = await ethers.getContract("BasicNFT");
  const nftMarketplace = await ethers.getContract("NftMarketplace");

  console.log("Minting...");
  const mintTx = await basicNFT.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;

  console.log("Approving NFT...");
  const approvalTx = await basicNFT.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);

  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(basicNFT.address, tokenId, PRICE);
  await tx.wait(1);
  console.log("Listed!");
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
