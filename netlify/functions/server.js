// This file is used to wrap our Express server as a Netlify function
const serverless = require('serverless-http');

// Import the server
let server;
try {
  // Try to import the server from the dist directory
  server = require('../../dist/index.js');
} catch (error) {
  console.error('Error importing server:', error);
  // Fallback to a simple Express app if the server import fails
  const express = require('express');
  const app = express();
  app.get('*', (req, res) => {
    res.status(500).send('Server initialization error. Please check the logs.');
  });
  server = app;
}

// Export the serverless handler
exports.handler = serverless(server);
