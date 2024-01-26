/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'

const deployClone: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()

    await deploy('KYCHook', {
        from: deployer,
        log: true,
        args: ['0x29Dd65cb8654aE596d04bdf73Dd8995AAe4934b7'],
        waitConfirmations: 1
    })
}

export default deployClone
deployClone.tags = ['KYCHook']
