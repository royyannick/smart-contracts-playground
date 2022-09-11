function sleep(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

async function moveBlocks(amount, sleepAmount = 0) {
  console.log(`Moving ${amount} blocks. (sleeping for: ${sleepAmount})`);
  for (let index = 0; index < amount; index++) {
    await network.provider.request({ method: "evm_mine", params: [] });
    if (sleepAmount) {
      console.log("Sleeping...");
      sleep(sleepAmount);
    }
  }
}

module.exports = { moveBlocks };
