// # Credentials
TENANT_ID = 'f0aab503-3e60-40f6-b952-a015640b0364';
CLIENT_ID = 'e76a3185-77fd-4e64-ae9a-cdd85f19b69c';
CLIENT_SECRET = 'P548Q~HBEU7IUrx3uROH0N63TZCUv2Ytl2s9UcC-';

// # Endpoints
AAD_ENDPOINT = 'https://login.microsoftonline.com';
GRAPH_ENDPOINT = 'https://graph.microsoft.com';



const msal = require("@azure/msal-node");
const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
  },
};
const cca = new msal.ConfidentialClientApplication(msalConfig);

const authResponse = await cca.acquireTokenByClientCredential(tokenRequest);

console.log("Got an auth token! ", authResponse.accessToken);

//Given the token,you can now set it to the header of any Axios calls made to Microsoft Graph API
const authHeader = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
