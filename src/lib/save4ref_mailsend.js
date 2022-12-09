// const fetch = require('node-fetch');
// pulls in the .env file settings
require("dotenv").config();
 
const axios = require("axios");
const qs = require("qs");
 
const TENANT_ID = process.env.TENANT_ID || "";
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const AAD_ENDPOINT = process.env.AAD_ENDPOINT || "";
const GRAPH_ENDPOINT = process.env.GRAPH_ENDPOINT || "";
const from = process.env.FROM || "";
const subject = process.env.SUBJECT || "";
 
const recipientAddresses = {
  to: [{ address: "paul.green@dlink.com", name: "Paul Green" }]
};

// # Not using theses for now...
//  cc: [{ address: "me2@example.com", name: "Another Test Display Name" }],
//  bcc: [{ address: "me3@example.com", name: "A Third Test Display Name" }],

 
function addRecipients(messageBody, rcpts = {}) {
  cloned = Object.assign({}, messageBody);
 
  Object.keys(rcpts).forEach((element) => {
    if (rcpts[element].length > 0) {
      cloned.message[element + "Recipients"] = createRecipients(rcpts[element]);
    }
  });
 
  return cloned;
}
 
function createRecipients(rcpts) {
  return rcpts.map((rcpt) => {
    return {
      emailAddress: {
        address: rcpt.address,
        name: rcpt.name || "",
      },
    };
  });
}
 
const createEmailAsJson = (rcpts, subject, body) => {
  let messageAsJson = {
    message: {
      subject: subject,
      body: {
        contentType: "HTML",
        content: body,
      },
    },
  };
 
  messageAsJson = addRecipients(messageAsJson, rcpts);
 
  return messageAsJson;
};
 
const getAuthToken = async () => {
  const formData = {
    grant_type: "client_credentials",
    scope: `${GRAPH_ENDPOINT}/.default`,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };
 
  console.log("url", `${AAD_ENDPOINT}/${TENANT_ID}/oauth2/v2.0/token`);
 
  const tokenObject = await axios({
    url: `${AAD_ENDPOINT}/${TENANT_ID}/oauth2/v2.0/token`,
    method: "POST",
    data: qs.stringify(formData),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
 
  const {
    data: { access_token },
  } = tokenObject;
 
  return access_token;
};
 
const sendNotification = async (from, message) => {
  const access_token = await getAuthToken();
  try {
    const response = await axios({
      url: `${GRAPH_ENDPOINT}/v1.0/users/${from}/sendMail`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(message),
    });
 
    console.log("sendNotification status", response.statusText);
  } catch (error) {
    console.log(error);
  }
};
 
const body = "<h1>Test from Paul</h1><p>HTML message sent via MS Graph</p>";
 
const message = createEmailAsJson(recipientAddresses, subject, body);
console.log(JSON.stringify(message, null, "  "));
sendNotification(from, message);
