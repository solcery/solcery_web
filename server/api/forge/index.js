const db = require("../../db/connection");
const { ObjectId } = require("mongodb");
const { 
  FORGE_DB,
  OBJECT_COLLECTION
} = require("../../db/names");
const AWS = require('aws-sdk');
const fs = require('fs');
const request = require('request');
const im = require('imagemagick');
const { Metaplex } = require('@metaplex-foundation/js');
var path = require('path');

const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('https://solana-api.projectserum.com');
const metaplex = new Metaplex(connection);

const downloadAsFile = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    let extension = res.headers['content-type'].split('/')[1];
    request(uri).pipe(fs.createWriteStream(`${filename}.${extension}`)).on('close', () => callback(extension));
  });
};

const checkNftForAllCollections = (nft, collections) => {
    for (let collection of collections) {
        if (checkNftForCollection(nft, collection)) return collection;
    }
}

const checkNftForCollection = (nft, collection) => {
    let collectionFields = collection.fields
    if (collectionFields.symbol !== nft.symbol) return false;
    let verifiedCreators = nft.creators.filter(creator => creator.verified);
    for (let creator of verifiedCreators) {
        if (!collectionFields.creators.includes(creator.address.toBase58())) return false;
    }
    if (collectionFields.vc) {
        if (!nft.collection) return false;
        if (!nft.collection.verified) return false;
        if (nft.collection.key.toBase58() !== collectionFields.vc) return false;
    }
    return true;
}

forgeNft = async function ({ nft, collection }, publicKey, dirName) {
  let metadata = await metaplex.nfts().load({ metadata: nft }).run();

  let mint = nft.mintAddress.toBase58();
  if (!metadata.json) {
    // TODO: error
    return;
  }
  let imageUrl = metadata.json.image;
  return new Promise(resolve => {
    downloadAsFile(imageUrl, path.join(dirName, `orig_${mint}`), (extension) => {
      im.resize({
        srcPath: path.join(dirName, `orig_${mint}.${extension}`),
        dstPath: path.join(dirName, `${mint}.jpg`),
        width: "512!",
        height: "512!",
      }, function(err, stdout, stderr) {
        if (err) console.log(imageUrl);
        if (err) throw err;

        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ID,
          secretAccessKey: process.env.AWS_KEY
        })

        const filename = `${mint}.jpg`;
        const fileContent = fs.readFileSync(path.join(dirName,filename));
        const params = {
          Bucket: 'solcery-nfts',
          Key: `nfts/${filename}`,
          Body: fileContent
        }
        const cloudFrontUrl = 'https://d393qv2jpv391c.cloudfront.net';

        let x = s3.upload(params, (err, data) => {
          if (err) throw err;
          resolve({
            mint,
            forger: publicKey.toBase58(),
            creationTime: Math.floor(Date.now() / 1000),
            name: nft.name,
            image: `${cloudFrontUrl}/nfts/${filename}`,
            collection: collection._id.toString(),
          })
        })
      });
    });
  })
}

const funcs = {};

funcs.getPlayerNfts = async function(data) {
  let publicKey = new PublicKey(data.params.publicKey);
  let parsedTokens = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }); // TODO: filter?
  parsedTokens = parsedTokens.value.filter(token => token.account.data.parsed.info.tokenAmount.uiAmount === 1);
  let mints = parsedTokens.map(accountData => new PublicKey(accountData.account.data.parsed.info.mint));
  let nftDatas = await metaplex
    .nfts()
    .findAllByMintList({ mints })
    .run();
  nftDatas = nftDatas.filter(nft => nft);
  let collections = await db
    .getDb(FORGE_DB)
    .collection(OBJECT_COLLECTION)
    .find({ template: 'collections' })
    .toArray();

  let supportedNfts = [];
  for (let nft of nftDatas) {
      let collection = checkNftForAllCollections(nft, collections);
      if (!collection) continue;
      if (nft.mintAddress.toBase58() === 'AErFXRFobDFzy1A5KkoTGPagHh4HySaNZFUXxFDmFcy6') continue; //TODO;
      supportedNfts.push({ nft, collection });
  }
  let supportedNftMints = supportedNfts.map(nft => nft.nft.mintAddress.toBase58());
  let forgedNfts = await db
    .getDb(FORGE_DB)
    .collection(OBJECT_COLLECTION)
    .find({ template: 'nfts', 'fields.mint': { $in: supportedNftMints }})
    .toArray();
  let forgedNftMints = forgedNfts.map(nft => nft.fields.mint).filter(mint => mint);
  let unsupportedNfts = supportedNfts.filter(nft => !forgedNftMints.includes(nft.nft.mintAddress.toBase58()));

  if (unsupportedNfts.length === 0) {
    return forgedNfts.map(data => data.fields);
    // TODO: wrap forgedNftMints
  } else {
    let dirName = path.join('tmp', new ObjectId().toString()); // random unique string
    fs.mkdirSync(dirName, { recursive: true });
    let forgedNftDatas = await Promise.all(unsupportedNfts.map(nft => forgeNft(nft, publicKey, dirName)));
    fs.rmSync(dirName, { recursive: true, force: true });
    let newlyForgedNfts = forgedNftDatas.map(fields => ({
      _id: new ObjectId(),
      template: 'nfts',
      fields
    }));
    let newlyForgedNftMints = newlyForgedNfts.map(nft => nft.fields.mint);
    let bulk = db
      .getDb(FORGE_DB)
      .collection(OBJECT_COLLECTION)
      .initializeOrderedBulkOp();
    bulk.find({ template: 'nfts', 'fields.mint': { $in: newlyForgedNftMints }}).delete();
    for (let newlyForgedNft of newlyForgedNfts) {
      bulk.insert(newlyForgedNft)
    }
    await bulk.execute();
    return forgedNfts.concat(newlyForgedNfts).map(data => data.fields);
  }
}

funcs.getForgedNftsByMints = async function(data) {
  let mints = data.params.mints;
  let res = await db
    .getDb(FORGE_DB)
    .collection(OBJECT_COLLECTION)
    .find({ template: 'nfts', 'fields.mint': { $in: mints }})
    .toArray();
  return res.map(nft => nft.fields);
}

const commands = require('./commands');
module.exports = { commands, funcs };
