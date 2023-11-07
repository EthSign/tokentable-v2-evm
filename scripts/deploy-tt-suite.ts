import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {address as ttuDeployerAddress} from '../deployments/sepolia/TTUDeployerLite.json'
import {address as mockERC20Address} from '../deployments/sepolia/MockERC20.json'
import {TTUDeployer} from '../typechain-types/index'

async function main() {
    const TTUDeployerFactory = await ethers.getContractFactory('TTUDeployer')
    const ttuDeployerInstance = TTUDeployerFactory.attach(
        ttuDeployerAddress
    ) as TTUDeployer

    await ttuDeployerInstance.deployTTSuite(
        mockERC20Address,
        'Test project ID',
        false,
        true
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
