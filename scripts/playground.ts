import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {TTUDeployerLiteZkSync} from '../typechain-types/index'

async function main() {
    const Factory = await ethers.getContractFactory('TTUDeployerLiteZkSync')
    const instance = Factory.attach(
        '0x4f8FBEAF5232Aa2015AEE627B5FaE64b69Ac43b0'
    ) as TTUDeployerLiteZkSync

    const mockERC20TokenAddressZkSyncTestnet =
        '0x0ad1Bd24CD3374b7Bb74CE494B093e5DE6F30A91'
    await instance.deployTTSuite(
        mockERC20TokenAddressZkSyncTestnet,
        'test project id 0',
        false,
        true,
        true,
        true,
        true
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
