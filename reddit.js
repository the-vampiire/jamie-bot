require('dotenv').config();

// thanks to "reddit-oauth-helper": "^0.3.0"
const snoo = require('snoowrap');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN
const config = {
  userAgent: `http:${clientId}:0.0.1 (by /u/vampiire)`,
  clientId,
  clientSecret,
  refreshToken
};

module.exports = new snoo(config);