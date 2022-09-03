const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function() {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("2");

  beforeEach(async function() {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function() {
    it("Sets the aggregator address correctly.", async function() {
      const response = await fundMe.getPriceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function() {
    //it("Fails if you don't send enough ETH.", async function() {
    //  await expect(fundMe.fund()).to.be.revertedWith(
    //    "You need to spend more ETH."
    //  );
    //});
    it("Updates the amount funded data structure.", async function() {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Adds funders to the funders array.", async function() {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.getFunder(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", async function() {
    beforeEach(async function() {
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from a singler funder.", async function() {
      // 1- Get initial balances.
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // 2 - Withdraw!
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // 3 - Get new balances.
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // 4 - Check the numbers!
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingFundMeBalance.add(startingDeployerBalance).toString()
      );
    });

    it("Withdraw ETH from multiple funders.", async function() {
      // 0 - Prep Funders.
      const accounts = await ethers.getSigners();
      for (i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      // 1- Get initial balances.
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // 2 - Withdraw!
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // 3 - Get new balances.
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // 4 - Check the numbers!
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingFundMeBalance.add(startingDeployerBalance).toString()
      );

      // 5 - Make sure there are no more funders... (all money went back)
      await expect(fundMe.getFunder(0)).to.be.reverted;

      //
      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("Only the Owner can Withdraw funds.", async function() {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      //await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
      //  `FundMe__NotOwner`
      //);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(
        attackerConnectedContract,
        "FundMe__NotOwner"
      );
    });
  });
});
