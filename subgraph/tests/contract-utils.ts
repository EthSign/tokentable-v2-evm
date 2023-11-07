import {newMockEvent} from 'matchstick-as'
import {ethereum, BigInt, Address, Bytes} from '@graphprotocol/graph-ts'
import {
    ActualCancelled,
    ActualCreated,
    Initialized,
    OwnershipTransferred,
    PermissionSet,
    PresetCreated,
    TokensClaimed,
    TokensDeposited,
    TokensWithdrawn
} from '../generated/Contract/Contract'

export function createActualCancelledEvent(
    actualId: BigInt,
    amountClaimed: BigInt,
    amountRefunded: BigInt,
    refundFounderAddress: Address
): ActualCancelled {
    let actualCancelledEvent = changetype<ActualCancelled>(newMockEvent())

    actualCancelledEvent.parameters = new Array()

    actualCancelledEvent.parameters.push(
        new ethereum.EventParam(
            'actualId',
            ethereum.Value.fromUnsignedBigInt(actualId)
        )
    )
    actualCancelledEvent.parameters.push(
        new ethereum.EventParam(
            'amountClaimed',
            ethereum.Value.fromUnsignedBigInt(amountClaimed)
        )
    )
    actualCancelledEvent.parameters.push(
        new ethereum.EventParam(
            'amountRefunded',
            ethereum.Value.fromUnsignedBigInt(amountRefunded)
        )
    )
    actualCancelledEvent.parameters.push(
        new ethereum.EventParam(
            'refundFounderAddress',
            ethereum.Value.fromAddress(refundFounderAddress)
        )
    )

    return actualCancelledEvent
}

export function createActualCreatedEvent(
    presetId: Bytes,
    actualId: BigInt
): ActualCreated {
    let actualCreatedEvent = changetype<ActualCreated>(newMockEvent())

    actualCreatedEvent.parameters = new Array()

    actualCreatedEvent.parameters.push(
        new ethereum.EventParam(
            'presetId',
            ethereum.Value.fromFixedBytes(presetId)
        )
    )
    actualCreatedEvent.parameters.push(
        new ethereum.EventParam(
            'actualId',
            ethereum.Value.fromUnsignedBigInt(actualId)
        )
    )

    return actualCreatedEvent
}

export function createInitializedEvent(version: i32): Initialized {
    let initializedEvent = changetype<Initialized>(newMockEvent())

    initializedEvent.parameters = new Array()

    initializedEvent.parameters.push(
        new ethereum.EventParam(
            'version',
            ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
        )
    )

    return initializedEvent
}

export function createOwnershipTransferredEvent(
    previousOwner: Address,
    newOwner: Address
): OwnershipTransferred {
    let ownershipTransferredEvent = changetype<OwnershipTransferred>(
        newMockEvent()
    )

    ownershipTransferredEvent.parameters = new Array()

    ownershipTransferredEvent.parameters.push(
        new ethereum.EventParam(
            'previousOwner',
            ethereum.Value.fromAddress(previousOwner)
        )
    )
    ownershipTransferredEvent.parameters.push(
        new ethereum.EventParam(
            'newOwner',
            ethereum.Value.fromAddress(newOwner)
        )
    )

    return ownershipTransferredEvent
}

export function createPermissionSetEvent(
    permissionId: Bytes,
    addr: Address,
    isPermitted: boolean
): PermissionSet {
    let permissionSetEvent = changetype<PermissionSet>(newMockEvent())

    permissionSetEvent.parameters = new Array()

    permissionSetEvent.parameters.push(
        new ethereum.EventParam(
            'permissionId',
            ethereum.Value.fromFixedBytes(permissionId)
        )
    )
    permissionSetEvent.parameters.push(
        new ethereum.EventParam('addr', ethereum.Value.fromAddress(addr))
    )
    permissionSetEvent.parameters.push(
        new ethereum.EventParam(
            'isPermitted',
            ethereum.Value.fromBoolean(isPermitted)
        )
    )

    return permissionSetEvent
}

export function createPresetCreatedEvent(presetId: Bytes): PresetCreated {
    let presetCreatedEvent = changetype<PresetCreated>(newMockEvent())

    presetCreatedEvent.parameters = new Array()

    presetCreatedEvent.parameters.push(
        new ethereum.EventParam(
            'presetId',
            ethereum.Value.fromFixedBytes(presetId)
        )
    )

    return presetCreatedEvent
}

export function createTokensClaimedEvent(
    by: Address,
    amount: BigInt
): TokensClaimed {
    let tokensClaimedEvent = changetype<TokensClaimed>(newMockEvent())

    tokensClaimedEvent.parameters = new Array()

    tokensClaimedEvent.parameters.push(
        new ethereum.EventParam('by', ethereum.Value.fromAddress(by))
    )
    tokensClaimedEvent.parameters.push(
        new ethereum.EventParam(
            'amount',
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    return tokensClaimedEvent
}

export function createTokensDepositedEvent(
    actualId: BigInt,
    amount: BigInt
): TokensDeposited {
    let tokensDepositedEvent = changetype<TokensDeposited>(newMockEvent())

    tokensDepositedEvent.parameters = new Array()

    tokensDepositedEvent.parameters.push(
        new ethereum.EventParam(
            'actualId',
            ethereum.Value.fromUnsignedBigInt(actualId)
        )
    )
    tokensDepositedEvent.parameters.push(
        new ethereum.EventParam(
            'amount',
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    return tokensDepositedEvent
}

export function createTokensWithdrawnEvent(
    fromActualId: BigInt,
    by: Address,
    amount: BigInt
): TokensWithdrawn {
    let tokensWithdrawnEvent = changetype<TokensWithdrawn>(newMockEvent())

    tokensWithdrawnEvent.parameters = new Array()

    tokensWithdrawnEvent.parameters.push(
        new ethereum.EventParam(
            'fromActualId',
            ethereum.Value.fromUnsignedBigInt(fromActualId)
        )
    )
    tokensWithdrawnEvent.parameters.push(
        new ethereum.EventParam('by', ethereum.Value.fromAddress(by))
    )
    tokensWithdrawnEvent.parameters.push(
        new ethereum.EventParam(
            'amount',
            ethereum.Value.fromUnsignedBigInt(amount)
        )
    )

    return tokensWithdrawnEvent
}
