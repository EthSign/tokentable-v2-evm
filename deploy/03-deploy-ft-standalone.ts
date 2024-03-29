// TypeScript
import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'

const deployFTV2: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()

    await deploy('TTFutureTokenV2', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
}

export default deployFTV2
deployFTV2.tags = ['FTV2']
