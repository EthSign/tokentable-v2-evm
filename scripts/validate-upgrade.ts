/* eslint-disable camelcase */
import {ethers, upgrades} from 'hardhat'
import {log} from '../config/logging'

async function main() {
    const FTFactory__old = await ethers.getContractFactory(
        'TTFutureTokenV2__old'
    )
    const FTFactory = await ethers.getContractFactory('TTFutureTokenV2')
    await upgrades.validateUpgrade(FTFactory__old, FTFactory, {kind: 'beacon'})
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
