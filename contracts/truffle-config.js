/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require("truffle-hdwallet-provider-privkey");

// const HDWalletProvider = require('truffle-hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

    networks: {
        // Useful for testing. The `development` name is special - truffle uses it by default
        // if it's defined here and no other network is specified at the command line.
        // You should run a client (like ganache-cli, geth or parity) in a separate terminal
        // tab if you use this network and you must also set the `host`, `port` and `network_id`
        // options below to some value.
        //
        development: {
            host: "127.0.0.1",     // Localhost (default: none)
            port: 8545,            // Standard Ethereum port (default: none)
            network_id: "*",       // Any network (default: none)
            skipDryRun: true
        },
        rsk_regtest: {
            host: "127.0.0.1",
            port: 4444,
            network_id: "*",
            skipDryRun: true
        },
        ganache_testing: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
            skipDryRun: true
        },
        ganache_zos: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
            skipDryRun: true
        },
        rinkeby: {
          from: "0xC69FBF17f088235085fa0D29E229D7C7b2C209f8",
          provider: () => {
              return new HDWalletProvider(["3b7fe967dfa11684539ceb1f3c8606aa5af6915bd1d31f32f7f8a59757dcc8a5"], "https://rinkeby.infura.io/v3/969e1fd3ca714562b67169f695159e1a");
          },
          network_id: "*",
          skipDryRun: true
        },
        e2e_test: {
            host: "127.0.0.1",
            port: 5656,
            network_id: "*",
            skipDryRun: true
        },
        rsk_testnet: {
            network_id: "*",
            from: "0xC69FBF17f088235085fa0D29E229D7C7b2C209f8",
            networkCheckTimeout: 1000000,
            provider: () => {
                return new HDWalletProvider(["3b7fe967dfa11684539ceb1f3c8606aa5af6915bd1d31f32f7f8a59757dcc8a5"], "https://public-node.testnet.rsk.co");
            },
//            gas: 2500000,
            gasPrice: 59240000,
            skipDryRun: true
        },
        rsk_nodes: {
            network_id: "*",
            from: "0xC69FBF17f088235085fa0D29E229D7C7b2C209f8",
            networkCheckTimeout: 1000000,
            provider: () => {
                return new HDWalletProvider(["3b7fe967dfa11684539ceb1f3c8606aa5af6915bd1d31f32f7f8a59757dcc8a5"], "http://rsknodes:4446");
            },
            // VERY IMPORTANT, if this number is too big: near gasLimit (the default) transaction are QUEUED for
            // a long time, on the other hand if it is too small some big transactions can fail!!!
            // Tune it to your needs.
            gas: 4200000,
            gasPrice: 59240000,
            skipDryRun: true
        }


    // Another network with more advanced options...
    // Another network with more advanced options...
    // advanced: {
      // port: 8777,             // Custom port
      // network_id: 1342,       // Custom network
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
      // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
      // network_id: 3,       // Ropsten's id
      // gas: 5500000,        // Ropsten has a lower block limit than mainnet
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },

    // Useful for private networks
    // private: {
      // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
      // network_id: 2111,   // This network is yours, in the cloud.
      // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : {
        currency: 'USD',
        // gasPrice: 20,
    }
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
       version: "0.6.0",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
            enabled: false,
          runs: 200
        },
      //  evmVersion: "byzantium"
       }
    }
  },
  plugins: [ "solidity-coverage" ]
}
