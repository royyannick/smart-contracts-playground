const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");

const pinataKey = process.env.PINATA_API_KEY;
const pinataSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataKey, pinataSecret);

async function storeImages(imagesFilePath) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);

  let responses = [];

  console.log("Uploading to Pinata - IPFS");
  for (fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    console.log(`${fullImagesPath}/${files[fileIndex]}`);
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      //console.log(response);
      responses.push(response);
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { storeImages, storeTokenUriMetadata };
