const { moveBlocks } = require("../utils/move-blocks");

async function moveDemBlocks() {
  if (network.config.chainId == "31337") {
    await moveBlocks(2, (sleepAmount = 1000));
  }
}

moveDemBlocks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
