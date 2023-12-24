import {BigInt, DataSourceContext} from '@graphprotocol/graph-ts'
import {TokenTableSuiteDeployed as TokenTableSuiteDeployedEvent} from '../generated/TTUDeployer/TTUDeployer'
import {
    TokenTableSuiteDeployed,
    TTUV2InstanceMetadata
} from '../generated/schema'
import {TokenTableUnlockerV2, TTFutureTokenV2} from '../generated/templates'
import {TokenTableUnlockerV2 as TTUV2Instance} from '../generated/templates/TokenTableUnlockerV2/TokenTableUnlockerV2'

export function handleTokenTableSuiteDeployed(
    event: TokenTableSuiteDeployedEvent
): void {
    let entity = new TokenTableSuiteDeployed(event.params.projectId)
    entity.from = event.params.by
    entity.unlocker = event.params.unlocker
    entity.futureToken = event.params.futureToken
    entity.trackerToken = event.params.trackerToken
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.projectToken = TTUV2Instance.bind(
        event.params.unlocker
    ).getProjectToken()
    entity.save()

    let metadata = new TTUV2InstanceMetadata(event.params.projectId)
    metadata.totalAmountClaimed = BigInt.fromI32(0)
    metadata.save()

    let context = new DataSourceContext()
    context.setString('projectId', event.params.projectId)
    context.setBytes('unlockerAddress', event.params.unlocker)
    context.setBytes('futureTokenAddress', event.params.futureToken)

    TokenTableUnlockerV2.createWithContext(event.params.unlocker, context)
    TTFutureTokenV2.createWithContext(event.params.futureToken, context)
}
