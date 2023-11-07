import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {network, ethers, run} from 'hardhat'
import {TTUDeployerLite} from '../typechain-types'
import {log} from '../config/logging'

// Replicating logic in TTUDeployer
const deployLite: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const chainId = network.config.chainId!

    // Deploying contracts individually
    const unlockerDeploymentResult = await deploy('TokenTableUnlockerV2', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
    const ftDeploymentResult = await deploy('TTFutureTokenV2', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
    const ttDeploymentResult = await deploy('TTTrackerTokenV2', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
    const feeCollectorDeploymentResult = await deploy('TTUFeeCollector', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
    const deployerLiteDeploymentResult = await deploy('TTUDeployerLite', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
    const beaconManagerDeploymentResult = await deploy('TTUV2BeaconManager', {
        from: deployer,
        log: true,
        args: [
            unlockerDeploymentResult.address,
            ftDeploymentResult.address,
            ttDeploymentResult.address
        ],
        waitConfirmations: 1
    })
    // Getting instances
    const DeployerLiteFactory =
        await ethers.getContractFactory('TTUDeployerLite')
    const deployerLiteInstance = DeployerLiteFactory.attach(
        deployerLiteDeploymentResult.address
    ) as TTUDeployerLite
    // Setup
    await deployerLiteInstance.setFeeCollector(
        feeCollectorDeploymentResult.address
    )
    await deployerLiteInstance.setBeaconManager(
        beaconManagerDeploymentResult.address
    )
    /*
     * Run verification
     * await run('verify:verify', {
     *     address: beaconManagerDeploymentResult.address,
     *     constructorArguments: [
     *         unlockerDeploymentResult.address,
     *         ftDeploymentResult.address,
     *         ttDeploymentResult.address
     *     ]
     * })
     * await run('verify:verify', {
     *     address: deployerLiteDeploymentResult.address,
     *     contract: 'contracts/proxy/TTUDeployerLite.sol:TTUDeployerLite'
     * })
     * await run('verify:verify', {
     *     address: feeCollectorDeploymentResult.address
     * })
     * Print results to console (save this!)
     */
    log.info(
        `Chain ID: ${chainId} | BeaconManager: ${beaconManagerDeploymentResult.address} | FeeCollector: ${feeCollectorDeploymentResult.address} | DeployerLite: ${deployerLiteDeploymentResult.address}`
    )
}

export default deployLite
deployLite.tags = ['TTUDeployerLite']
