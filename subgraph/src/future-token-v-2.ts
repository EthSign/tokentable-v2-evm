import {BigInt, dataSource} from '@graphprotocol/graph-ts'
import {Transfer as TransferEvent} from '../generated/templates/TTFutureTokenV2/TTFutureTokenV2'
import {TTEvent, TokenTableUser} from '../generated/schema'

function findIndexWithMatching(
    projectId: string,
    actualId: BigInt,
    projectIds: string[],
    actualIds: BigInt[]
): i32 {
    for (let i = 0; i < projectIds.length; i++) {
        if (projectIds[i] == projectId && actualIds[i] == actualId) {
            return i
        }
    }
    return -1
}

export function handleTransfer(event: TransferEvent): void {
    const projectId = dataSource.context().getString('projectId')
    if (
        event.params.from.toHexString() !=
        '0x0000000000000000000000000000000000000000'
    ) {
        let from = TokenTableUser.load(event.params.from)!
        const indexToRemoveFromFrom = findIndexWithMatching(
            projectId,
            event.params.tokenId,
            from.projectIds!,
            from.actualIds!
        )
        let fromProjectIds = from.projectIds!
        let fromActualIds = from.actualIds!
        fromProjectIds.splice(indexToRemoveFromFrom, 1)
        fromActualIds.splice(indexToRemoveFromFrom, 1)
        from.projectIds = fromProjectIds
        from.actualIds = fromActualIds
        from.save()
    }
    let to = TokenTableUser.load(event.params.to)
    if (to == null) {
        to = new TokenTableUser(event.params.to)
    }
    if (to.projectIds == null) {
        to.projectIds = [projectId]
        to.actualIds = [event.params.tokenId]
    } else {
        let projectIds = to.projectIds!
        let actualIds = to.actualIds!
        projectIds.push(projectId)
        actualIds.push(event.params.tokenId)
        to.projectIds = projectIds
        to.actualIds = actualIds
    }
    to.save()

    let transferEvent = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    transferEvent.event = 'FutureTokenTransferred'
    transferEvent.from = event.params.from
    transferEvent.to = event.params.to
    transferEvent.actualId = event.params.tokenId
    transferEvent.timestamp = event.block.timestamp
    transferEvent.projectId = projectId
    transferEvent.transactionHash = event.transaction.hash
    transferEvent.save()
}
