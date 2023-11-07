import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {address as ttuDeployerAddress} from '../deployments/sepolia/TTUDeployerLite.json'
import {address as ttuAddress} from '../deployments/sepolia/TokenTableUnlockerV2.json'
import {TTUV2BeaconManager, TTUDeployerLite} from '../typechain-types/index'

async function main() {
    const TTUDeployerFactory =
        await ethers.getContractFactory('TTUDeployerLite')
    const ttuDeployerInstance = TTUDeployerFactory.attach(
        ttuDeployerAddress
    ) as TTUDeployerLite
    const TTUV2BeaconManagerFactory =
        await ethers.getContractFactory('TTUV2BeaconManager')
    const ttuV2BeaconManagerInstance = TTUV2BeaconManagerFactory.attach(
        await ttuDeployerInstance.beaconManager()
    ) as TTUV2BeaconManager
    await ttuV2BeaconManagerInstance.upgradeUnlocker(ttuAddress)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
