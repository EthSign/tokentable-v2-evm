import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'

const deployClone: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()

    await deploy('@openzeppelin/contracts/proxy/Clones.sol:Clones', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })
}

export default deployClone
deployClone.tags = ['Clones']
