/* eslint-disable no-mixed-operators */
import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {address as mockERC20Address} from '../deployments/zkSyncEra/MockERC20.json'
import {MockERC20} from '../typechain-types/index'

async function main() {
    const MockERC20Factory = await ethers.getContractFactory('MockERC20')
    const mockERC20Instance = MockERC20Factory.attach(
        mockERC20Address
    ) as MockERC20
    const decimals = await mockERC20Instance.decimals()
    await mockERC20Instance.mint(
        '0x300337e51198910270f85de9b5aa22a2829441F5',
        BigInt(10) ** decimals * BigInt(1000)
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
