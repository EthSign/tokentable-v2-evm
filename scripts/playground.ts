import {ethers} from 'hardhat'
import {log} from '../config/logging'
import {address} from '../deployments/zkSyncEra/TTUV2BeaconManager.json'
import {TTUV2BeaconManager, UpgradeableBeacon} from '../typechain-types/index'

async function main() {
    const Factory = await ethers.getContractFactory('TTUV2BeaconManager')
    const instance = Factory.attach(address) as TTUV2BeaconManager

    const BeaconProxyFactory =
        await ethers.getContractFactory('UpgradeableBeacon')
    const unlockerBeacon = BeaconProxyFactory.attach(
        await instance.unlockerBeacon()
    ) as UpgradeableBeacon
    const ftBeacon = BeaconProxyFactory.attach(
        await instance.futureTokenBeacon()
    ) as UpgradeableBeacon
    const ttBeacon = BeaconProxyFactory.attach(
        await instance.trackerTokenBeacon()
    ) as UpgradeableBeacon
    log.info(
        await unlockerBeacon.implementation(),
        await ftBeacon.implementation(),
        await ttBeacon.implementation()
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        log.error(error)
        process.exit(1)
    })
