const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: 'SEvyTx3tiCeBoR6bLWjyp91eiL5GNJdn',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;