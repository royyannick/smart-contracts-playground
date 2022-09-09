const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic NTF Unit Tests", async function () {
      let basicNFT;

      beforeEach(async function () {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["basicnft"]); // tags from the deploy script!!!
        basicNFT = await ethers.getContract("BasicNFT");
      });

      // Skipping CTOR Test...

      // TOKEN_URI
      describe("tokenURI", async function () {
        it("should return the const Token URI", async function () {
          const tokenURI = await basicNFT.tokenURI(0);

          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });
      });

      // mint && Token ID
      describe("mintNft", async function () {
        it("should increase the Token ID by 1", async function () {
          const txResponse = await basicNft.mintNft();
          await txResponse.wait(1);

          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(tokenCounter.toString(), "1");
        });
      });
    });
