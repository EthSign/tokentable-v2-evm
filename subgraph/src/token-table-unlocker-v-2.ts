import {Bytes, dataSource, store} from '@graphprotocol/graph-ts'
import {
    ActualCancelled as ActualCancelledEvent,
    ActualCreated as ActualCreatedEvent,
    Initialized as InitializedEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    PresetCreated as PresetCreatedEvent,
    TokensClaimed as TokensClaimedEvent,
    TokensWithdrawn as TokensWithdrawnEvent,
    ClaimingDelegateSet as ClaimingDelegateSetEvent,
    CancelDisabled as CancelDisabledEvent,
    HookDisabled as HookDisabledEvent,
    WithdrawDisabled as WithdrawDisabledEvent,
    TokenTableUnlockerV2
} from '../generated/templates/TokenTableUnlockerV2/TokenTableUnlockerV2'
import {
    Actual,
    Initialized,
    OwnershipTransferred,
    TTEvent,
    TTUV2InstanceMetadata
} from '../generated/schema'

export function handleActualCancelled(event: ActualCancelledEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ActualCancelled'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.pendingAmountClaimable = event.params.pendingAmountClaimable
    entity.didWipeClaimableBalance = event.params.didWipeClaimableBalance
    entity.batchId = event.params.batchId
    entity.projectId = context.getString('projectId')
    entity.save()

    store.remove('Actual', event.params.actualId.toHexString())
}

export function handleActualCreated(event: ActualCreatedEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ActualCreated'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.presetId = event.params.presetId
    entity.actualId = event.params.actualId
    entity.batchId = event.params.batchId
    entity.recipient = event.params.recipient
    entity.recipientId = event.params.recipientId
    entity.projectId = context.getString('projectId')
    entity.save()

    let actualFromContract = TokenTableUnlockerV2.bind(event.address).actuals(
        event.params.actualId
    )
    let actual = new Actual(event.params.actualId.toHexString())
    actual.presetId = event.params.presetId
    actual.startTimestampAbsolute =
        actualFromContract.getStartTimestampAbsolute()
    actual.amountClaimed = actualFromContract.getAmountClaimed()
    actual.totalAmount = actualFromContract.getTotalAmount()
    actual.projectId = context.getString('projectId')
    actual.save()
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
    const context = dataSource.context()
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'PresetCreated'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.presetId = event.params.presetId
    entity.projectId = context.getString('projectId')
    entity.save()
}

export function handleTokensClaimed(event: TokensClaimedEvent): void {
    const context = dataSource.context()
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensClaimed'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.to = event.params.to
    entity.caller = event.params.caller
    entity.amount = event.params.amount
    entity.feesCharged = event.params.feesCharged
    entity.projectId = context.getString('projectId')
    entity.save()

    let actual = Actual.load(event.params.actualId.toHexString())!
    actual.amountClaimed = actual.amountClaimed.plus(event.params.amount)
    actual.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalAmountClaimed = metadata.totalAmountClaimed.plus(
        event.params.amount
    )
    metadata.save()
}

export function handleTokensWithdrawn(event: TokensWithdrawnEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensWithdrawn'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.by = event.params.by
    entity.amount = event.params.amount

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleClaimingDelegateSet(
    event: ClaimingDelegateSetEvent
): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ClaimingDelegateSet'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp
    entity.delegate = event.params.delegate

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleCancelDisabled(event: CancelDisabledEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'CancelDisabled'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleHookDisabled(event: HookDisabledEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'HookDisabled'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}

export function handleWithdrawDisabled(event: WithdrawDisabledEvent): void {
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'WithdrawDisabled'
    entity.from = event.transaction.from
    entity.timestamp = event.block.timestamp

    const context = dataSource.context()
    entity.projectId = context.getString('projectId')

    entity.save()
}
