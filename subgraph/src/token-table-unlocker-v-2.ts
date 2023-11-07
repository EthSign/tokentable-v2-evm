import {dataSource} from '@graphprotocol/graph-ts'
import {
    ActualCancelled as ActualCancelledEvent,
    ActualCreated as ActualCreatedEvent,
    Initialized as InitializedEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    PresetCreated as PresetCreatedEvent,
    TokensClaimed as TokensClaimedEvent,
    TokensDeposited as TokensDepositedEvent,
    TokensWithdrawn as TokensWithdrawnEvent
} from '../generated/templates/TokenTableUnlockerV2/TokenTableUnlockerV2'
import {Initialized, OwnershipTransferred, TTEvent} from '../generated/schema'

export function handleActualCancelled(event: ActualCancelledEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ActualCancelled'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.amountUnlockedLeftover = event.params.amountUnlockedLeftover
    entity.amountRefunded = event.params.amountRefunded
    entity.someAddress = event.params.refundFounderAddress

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleActualCreated(event: ActualCreatedEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ActualCreated'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.presetId = event.params.presetId
    entity.actualId = event.params.actualId

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
    let entity = new Initialized(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.version = event.params.version
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
}

export function handleOwnershipTransferred(
    event: OwnershipTransferredEvent
): void {
    let entity = new OwnershipTransferred(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.previousOwner = event.params.previousOwner
    entity.newOwner = event.params.newOwner
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
}

export function handlePresetCreated(event: PresetCreatedEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'PresetCreated'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.presetId = event.params.presetId

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleTokensClaimed(event: TokensClaimedEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensClaimed'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.someAddress = event.params.to
    entity.someBytes = event.params.caller
    entity.amount = event.params.amount

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleTokensDeposited(event: TokensDepositedEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensDeposited'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.amount = event.params.amount

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleTokensWithdrawn(event: TokensWithdrawnEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensWithdrawn'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.someAddress = event.params.by
    entity.amount = event.params.amount

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}
