// TypeScript
import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {run} from 'hardhat'

const deployMockZETA: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()

    const mockZETAResult = await deploy('MockZETA', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })

    await run('verify:verify', {
        address: mockZETAResult.address,
        contract: 'contracts/mock/MockZETA.sol:MockZETA'
    })
}

export default deployMockZETA
deployMockZETA.tags = ['MockZETA']
