// TypeScript
import {DeployFunction} from 'hardhat-deploy/dist/types'
import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {run} from 'hardhat'

const deployMockERC20: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {deploy} = hre.deployments
    const {deployer} = await hre.getNamedAccounts()

    const mockERC20Result = await deploy('MockERC20', {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1
    })

    await run('verify:verify', {
        address: mockERC20Result.address,
        contract: 'contracts/mock/MockERC20.sol:MockERC20'
    })
}

export default deployMockERC20
deployMockERC20.tags = ['MockERC20']
