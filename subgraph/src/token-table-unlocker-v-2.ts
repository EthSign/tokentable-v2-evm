import {BigInt, Bytes, dataSource} from '@graphprotocol/graph-ts'
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
import {Transfer as TransferEvent} from '../generated/templates/ProjectERC20/IERC20'
import {
    Actual,
    Initialized,
    OwnershipTransferred,
    TTEvent,
    TTUV2InstanceMetadata
} from '../generated/schema'

function getInitializedEventID(): Bytes {
    return Bytes.fromUTF8(
        `Initialized-${dataSource.context().getString('projectId')}`
    )
}

function getGlobalActualID(actualId: BigInt): string {
    return `${actualId.toHexString()}-${dataSource
        .context()
        .getString('projectId')}`
}

export function handleActualCancelled(event: ActualCancelledEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ActualCancelled'
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.pendingAmountClaimable = event.params.pendingAmountClaimable
    entity.didWipeClaimableBalance = event.params.didWipeClaimableBalance
    entity.batchId = event.params.batchId
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()

    let actual = Actual.load(getGlobalActualID(event.params.actualId))!
    actual.canceled = true

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalActualCancelledEventCount++
    metadata.save()
}

export function handleActualCreated(event: ActualCreatedEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ActualCreated'
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.presetId = event.params.presetId
    entity.actualId = event.params.actualId
    entity.batchId = event.params.batchId
    entity.recipient = event.params.recipient
    entity.recipientId = event.params.recipientId
    entity.amountSkipped = TokenTableUnlockerV2.bind(event.address).actuals(
        event.params.actualId
    ).amountClaimed
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()

    let actualFromContract = TokenTableUnlockerV2.bind(event.address).actuals(
        event.params.actualId
    )

    let actual = new Actual(getGlobalActualID(event.params.actualId))
    actual.presetId = event.params.presetId
    actual.canceled = false
    actual.startTimestampAbsolute = actualFromContract.startTimestampAbsolute
    actual.amountClaimed = actualFromContract.amountClaimed
    actual.totalAmount = actualFromContract.totalAmount
    actual.projectId = context.getString('projectId')
    actual.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalActualCreatedEventCount++
    metadata.save()
}

export function handleInitialized(event: InitializedEvent): void {
    let entity = new Initialized(getInitializedEventID())
    entity.version = event.params.version
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.contractAddress = event.address
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
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.presetId = event.params.presetId
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalPresetCreatedEventCount++
    metadata.save()
}

export function handleTokensClaimed(event: TokensClaimedEvent): void {
    const context = dataSource.context()
    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensClaimed'
    entity.from = event.params.caller
    entity.timestamp = event.block.timestamp
    entity.actualId = event.params.actualId
    entity.to = event.params.to
    entity.caller = event.params.caller
    entity.amount = event.params.amount
    entity.feesCharged = event.params.feesCharged
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()

    let actual = Actual.load(getGlobalActualID(event.params.actualId))!
    actual.amountClaimed = actual.amountClaimed.plus(event.params.amount)
    actual.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalAmountClaimed = metadata.totalAmountClaimed.plus(
        event.params.amount
    )
    metadata.totalTokensClaimedEventCount++
    metadata.save()
}

export function handleTokensWithdrawn(event: TokensWithdrawnEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'TokensWithdrawn'
    entity.from = event.params.by
    entity.timestamp = event.block.timestamp
    entity.by = event.params.by
    entity.amount = event.params.amount
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalTokensWithdrawnEventCount++
    metadata.save()
}

export function handleClaimingDelegateSet(
    event: ClaimingDelegateSetEvent
): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'ClaimingDelegateSet'
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.delegate = event.params.delegate
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.status = event.params.status
    entity.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalClaimingDelegateSetEventCount++
    metadata.save()
}

export function handleCancelDisabled(event: CancelDisabledEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'CancelDisabled'
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()

    let metadata = TTUV2InstanceMetadata.load(context.getString('projectId'))!
    metadata.totalCancelDisabledEventCount++
    metadata.save()
}

export function handleHookDisabled(event: HookDisabledEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'HookDisabled'
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.projectId = context.getString('projectId')
    entity.transactionHash = event.transaction.hash
    entity.save()
}

export function handleWithdrawDisabled(event: WithdrawDisabledEvent): void {
    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'WithdrawDisabled'
    entity.from = TokenTableUnlockerV2.bind(event.address).owner()
    entity.timestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
    entity.projectId = context.getString('projectId')
    entity.save()
}

export function handleDeposit(event: TransferEvent): void {
    if (
        event.params.to !=
        Initialized.load(getInitializedEventID())!.contractAddress
    ) {
        return
    }

    const context = dataSource.context()

    let entity = new TTEvent(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.event = 'Deposit'
    entity.from = event.params.from
    entity.to = event.params.to
    entity.amount = event.params.value
    entity.transactionHash = event.transaction.hash
    entity.projectId = context.getString('projectId')
    entity.timestamp = event.block.timestamp
    entity.save()
}
