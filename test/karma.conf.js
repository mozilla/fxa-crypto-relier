// karma.conf.js
module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],
    files: [
      '*.js'
    ],
    browsers: ['Firefox'],
    nocache: true,
    client: {
      mocha: {
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html',

        // require specific files after Mocha is initialized
        require: [
          require.resolve('../node_modules/chai/chai.js'),
          require.resolve('../dist/fxa-crypto-relier/fxa-crypto-deriver.js'),
          require.resolve('../dist/fxa-crypto-relier/fxa-crypto-relier.js'),
        ],
      }
    }
  });
};
