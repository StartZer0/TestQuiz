// This file is used to wrap our Express server as a Netlify function
const serverless = require('serverless-http');
const server = require('../../dist/index.js');

// Export the serverless handler
exports.handler = serverless(server);
