// TypeScript
import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'

const deployTTUDeployer: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()

    await deploy('TTUDeployer', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
}

export default deployTTUDeployer
deployTTUDeployer.tags = ['all', 'TTUDeployer']
