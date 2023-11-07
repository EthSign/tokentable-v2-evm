import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {address as mockERC20Address} from '../deployments/zkSyncEra/MockERC20.json'
import {TokenTableUnlockerV2} from '../typechain-types/index'

async function main() {
    const Factory = await ethers.getContractFactory('TokenTableUnlockerV2')
    const instance = Factory.attach(
        '0xF98086477ae569120cdbe170e199aa908F0874Ae'
    ) as TokenTableUnlockerV2
    log.info(await instance.isHookable())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
