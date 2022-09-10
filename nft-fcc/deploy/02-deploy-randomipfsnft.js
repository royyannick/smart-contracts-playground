const { network, ethers } = require("hardhat");
const { TASK_ETHERSCAN_VERIFY } = require("hardhat-deploy");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");

const imagesLocation = "./img/";

const metaDataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "",
      value: 100,
    },
  ],
};

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoodinatorV2Address, subscriptionId;

  let dogTokenUris;
  if (process.env.PINATA_UPLOAD_TO == "true") {
    dogTokenUris = await handleTokenURIs();
  }

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoodinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    vrfCoodinatorV2Address = networkConfig[chainId].vrfCoodinatorV2;
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const args = [
    vrfCoodinatorV2Address,
    subscriptionId,
    networkConfig[chainId].gasLane,
    networkConfig[chainId].callbackGasLimit,
    dogTokenUris,
    networkConfig[chainId].mintFee,
  ];
  log("Deploying...");
  log(args);
  const rin = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.config.blockConfirmations || 1,
  });
  log("Deployed!");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(rin.address, args);
  }

  console.log("---------------------------------");
  await storeImages(imagesLocation);
};

async function handleTokenURIs() {
  tokenURIs = [];

  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  console.log(files);
  for (imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metaDataTemplate };
    // Metadata info.
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    // store the JSON on Pinata.
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );

    tokenURIs.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs Uploaded! Here they are: ");
  console.log(tokenURIs);

  return tokenURIs;
}

module.exports.tags = ["all", "ipfs", "main"];
