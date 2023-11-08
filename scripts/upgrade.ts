/* eslint-disable @typescript-eslint/no-unused-vars */
import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {address as ttuDeployerAddress} from '../deployments/zkSyncEra/TTUDeployerLite.json'
import {address as ttuAddress} from '../deployments/zkSyncEra/TokenTableUnlockerV2.json'
import {address as ftAddress} from '../deployments/zkSyncEra/TTFutureTokenV2.json'
import {address as ttAddress} from '../deployments/zkSyncEra/TTTrackerTokenV2.json'
import {TTUV2BeaconManager, TTUDeployerLite} from '../typechain-types/index'

async function getBeaconManagerInstance(): Promise<TTUV2BeaconManager> {
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
    return ttuV2BeaconManagerInstance
}

async function ttu() {
    const ttuV2BeaconManagerInstance = await getBeaconManagerInstance()
    await ttuV2BeaconManagerInstance.upgradeUnlocker(ttuAddress)
}

async function ft() {
    const ttuV2BeaconManagerInstance = await getBeaconManagerInstance()
    await ttuV2BeaconManagerInstance.upgradeFutureToken(ftAddress)
}

async function tt() {
    const ttuV2BeaconManagerInstance = await getBeaconManagerInstance()
    await ttuV2BeaconManagerInstance.upgradePreviewToken(ttAddress)
}

async function main() {
    await ft()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
