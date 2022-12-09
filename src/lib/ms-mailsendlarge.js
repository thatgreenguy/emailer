const Axios = require('axios');

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

//In order to send an email, we needed to draft the email first and get an emailId
const emailBody = {
  subject: "Sample Email (Test)",
  importance: "Low",
  body: {
    contentType: "HTML",
    content: `Hello! testing...`,
  },
  toRecipients: [
    {
      emailAddress: {
        address: `paul.green@dlink.com`,
      },
    },
  ],
  attachments: [
      {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'attachment.txt',
        contentType: 'text/plain',
        contentBytes: 'SGVsbG8gV29ybGQh'
      }
  ]
};

USER_ID = 'eu-noreply1@dlink.com';


const sendmail = async function() {

  let response;


  // Create msal application object
  const cca = new msal.ConfidentialClientApplication(msalConfig);
  //const cca = new msal.ConfidentialClientApplication(config);

  // With client credentials flows permissions need to be granted in the portal by a tenant administrator.
  // The scope is always in the format "<resource>/.default"
  const clientCredentialRequest = {
      scopes: ["https://graph.microsoft.com/.default"], // replace with your resource
  };

   const authResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);

  console.log("Got an auth token! ", authResponse.accessToken);


  //Given the token,you can now set it to the header of any Axios calls made to Microsoft Graph API
  const authHeader = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
   };
  };




  const draftEmailURL = `https://graph.microsoft.com/v1.0/users/${USER_ID}/messages`;
  response = await Axios.post(
    draftEmailURL,
    emailBody,
    authHeader(authResponse.accessToken)
  );

  const emailId = response.data.id;
  const sendEmailURL = `https://graph.microsoft.com/v1.0/users/${USER_ID}/messages/${emailId}/send`;
  response = await Axios.post(sendEmailURL, {}, authHeader(authResponse.accessToken));
}

sendmail();


