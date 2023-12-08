import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-storage-layout'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import {config} from 'dotenv'
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'
import '@matterlabs/hardhat-zksync-verify'
import '@openzeppelin/hardhat-upgrades'
import 'solidity-docgen'

if (process.env.NODE_ENV !== 'PRODUCTION') {
    config()
}

export default {
    contractSizer: {
        strict: true
    },
    networks: {
        hardhat: {
            chainId: 33133,
            allowUnlimitedContractSize: false,
            loggingEnabled: false,
            zksync: false
        },
        sepolia: {
            chainId: 11155111,
            url: 'https://eth-sepolia.g.alchemy.com/v2/irTlUXcBaYDlCFNi9dHbjUxzm1pIfWbt',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        goerli: {
            chainId: 5,
            url: 'https://ethereum-goerli.publicnode.com',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        scrollAlpha: {
            chainId: 534353,
            url: 'https://alpha-rpc.scroll.io/l2',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        mantleTestnet: {
            chainId: 5001,
            url: 'https://rpc.ankr.com/mantle_testnet',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        zkSyncTestnet: {
            chainId: 280,
            url: 'https://testnet.era.zksync.dev',
            ethNetwork: 'https://ethereum-goerli.publicnode.com',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: true,
            verifyURL:
                'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
        },
        zkSyncEra: {
            chainId: 324,
            url: 'https://mainnet.era.zksync.io',
            ethNetwork: 'https://ethereum.publicnode.com',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: true,
            verifyURL:
                'https://zksync2-mainnet-explorer.zksync.io/contract_verification'
        },
        baseGoerli: {
            url: 'https://base-goerli.g.alchemy.com/v2/C9AsPfiYm2YWRnCHy5QXWDlRD3FqktoH',
            chainId: 84531,
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            gasPrice: 100000050,
            zksync: false
        },
        bnbMainnet: {
            url: 'https://bsc-dataseed.bnbchain.org/',
            chainId: 56,
            // gasPrice: 20000000000,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        polygonMumbai: {
            url: 'https://rpc.ankr.com/polygon_mumbai',
            chainId: 80001,
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        ethereum: {
            url: 'https://eth-mainnet.g.alchemy.com/v2/udrqNPSB6i5n5L6QSM31Ng72h_hFOrVT',
            chainId: 1,
            loggingEnabled: true,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        mantaPacificTestnet: {
            chainId: 3441005,
            url: 'https://pacific-rpc.testnet.manta.network/http',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        mantaPacific: {
            chainId: 169,
            url: 'https://pacific-rpc.manta.network/http',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        avaxC: {
            chainId: 43114,
            url: 'https://rpc.ankr.com/avalanche',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        zetachainTestnet: {
            chainId: 7001,
            url: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        },
        scroll: {
            chainId: 534352,
            url: 'https://rpc.ankr.com/scroll',
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            zksync: false
        }
    },
    solidity: {
        compilers: [
            {
                version: '0.8.20',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    zksolc: {
        version: '1.3.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            libraries: {
                'contracts/libraries/Clones.sol': {
                    /*
                     * zkSync Era Mainnet: 0x52cb8d348604aBB1720a713eADf3e4Afef650f93
                     * zkSync Era Testnet: 0x222C78A7CaDC3D63c72cE39F9A382B6aF075fC74
                     */
                    Clones: '0x52cb8d348604aBB1720a713eADf3e4Afef650f93'
                }
            }
        }
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    etherscan: {
        apiKey: {
            polygonMumbai: process.env.POLYGONSCAN_KEY,
            mantaPacific: process.env.MANTAPACIFIC_KEY,
            mantaPacificTestnet: process.env.MANTAPACIFIC_TEST_KEY,
            avaxC: process.env.SNOWTRACE_KEY,
            sepolia: process.env.ETHERSCAN_KEY,
            mainnet: process.env.ETHERSCAN_KEY,
            zetachainTestnet: process.env.ETHERSCAN_KEY
        },
        customChains: [
            {
                network: 'mantaPacific',
                chainId: 169,
                urls: {
                    apiURL: 'https://manta-pacific.calderaexplorer.xyz/api',
                    browserURL: 'https://pacific-explorer.manta.network/'
                }
            },
            {
                network: 'mantaPacificTestnet',
                chainId: 3441005,
                urls: {
                    apiURL: 'https://pacific-explorer.testnet.manta.network/api',
                    browserURL:
                        'https://pacific-explorer.testnet.manta.network/'
                }
            },
            {
                network: 'avaxC',
                chainId: 43114,
                urls: {
                    apiURL: 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan',
                    browserURL: 'https://avascan.info/'
                }
            },
            {
                network: 'zetachainTestnet',
                chainId: 7001,
                urls: {
                    apiURL: 'https://zetachain-athens-3.blockscout.com/api',
                    browserURL: 'https://zetachain-athens-3.blockscout.com/'
                }
            }
        ]
    },
    docgen: {
        pages: 'files',
        exclude: ['libraries', 'mock']
    }
}
