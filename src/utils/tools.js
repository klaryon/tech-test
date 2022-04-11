var sgMail = require('@sendgrid/mail');
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const { BlobServiceClient } = require("@azure/storage-blob");

const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.CUSTOMCONNSTR_AZURE_STORAGE_CONNECTION_STRING
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = ({ to, from, subject, text, html }) =>
    sgMail.send({ to, from, subject, text, html })

const streamToJson = (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => {
            // const jsonObject = Buffer.concat(chunks).toString('utf8');
            const jsonBuffer = Buffer.concat(chunks);
            return resolve(JSON.parse(jsonBuffer));
        });
    })
};

const getMobileOperatingSystem = (userAgent) => {

//    // Windows Phone must come first because its UA also contains "Android"
//    if (/windows phone/i.test(userAgent)) {
//        return "Windows Phone";
//    }
   if (/android/i.test(userAgent)) {
       return "Android";
   }

   // iOS detection from: http://stackoverflow.com/a/9039885/177710
   if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
       return "iOS";
   }

   return "Desktop";
}

const getConfigFile = async (blobName) => {
    // Use the config container
    const containerName = "config";
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // // Create a unique name for the blob
    // const blobName = "tiers.json";

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
    const downloadBlockBlobResponse = await blockBlobClient.download(0);    
    const tiersContent = await streamToJson(downloadBlockBlobResponse.readableStreamBody);

    // // <snippet_ListBlobs>
    // console.log("\nListing blobs...", containerClient);

    // // // List the blob(s) in the container.
    // // for await (const blob of containerClient.listBlobsFlat()) {
    // //     console.log("\t", blob.name);
    // // }
    // // List the blob(s) in the container.
    // let iter = containerClient.listBlobsFlat();
    // for await (const item of iter) {
    //     console.log(`\tBlobItem: name - ${item.name}`);
    // };
    
    // let blobItem = await iter.next();
    // while (!blobItem.done) {
    //     console.log("\t", blobItem);
    //     // fileList.size += 1;
    //     // fileList.innerHTML += `<option>${blobItem.value.name}</option>`;
    //     blobItem = await iter.next();
    // }
    return Promise.resolve(tiersContent);
    // return JSON.parse(tiersContent);
}

const putConfigFile = async () => {  
    // Use the config container
    const containerName = "config";
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    
    // Get a block blob client
    const blobName = "vaults.json";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log("\nUploading to Azure storage as blob:\n\t", blobName);

    // Upload data to the blob
    const data = {tiers: [ { tier: 1, prizes: 1, percentage: 3300, amount: 2000,  }, { tier: 2, prizes: 1, percentage: 3300, amount: 500 }, { tier: 3, prizes: 1, percentage: 3300, amount: 50,  }]};
    const uploadBlobResponse = await blockBlobClient.uploadData(Buffer.from(JSON.stringify(data)));
    console.log(
    "Blob was uploaded successfully. requestId: ",
    uploadBlobResponse.requestId
    );

    return uploadBlobResponse;
    // return JSON.parse(tiersContent);
}

const getSecret = async (secretName) => {

  if (!secretName) {
      throw Error("getSecret: Required params missing")
  }
  
  if (!process.env.AZURE_TENANT_ID ||
      !process.env.AZURE_CLIENT_ID ||
      !process.env.AZURE_CLIENT_SECRET) {
      throw Error("KeyVault can't use DefaultAzureCredential");
  }
  
  const credential = new DefaultAzureCredential();
   
  const url = `https://rand-${process.env.TARGET_ENV}-keys.vault.azure.net`;
   
  try {
      const client = new SecretClient(url, credential);
      const latestSecret = await client.getSecret(secretName);
      
      return latestSecret.value;
  } catch (ex) {
      console.log(ex)
      throw ex;
  }
}

module.exports = { getMobileOperatingSystem, getConfigFile, putConfigFile, sendMail, getSecret }; 
