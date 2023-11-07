// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
    ethereum,
    JSONValue,
    TypedMap,
    Entity,
    Bytes,
    Address,
    BigInt
} from '@graphprotocol/graph-ts'

export class ActualCancelled extends ethereum.Event {
    get params(): ActualCancelled__Params {
        return new ActualCancelled__Params(this)
    }
}

export class ActualCancelled__Params {
    _event: ActualCancelled

    constructor(event: ActualCancelled) {
        this._event = event
    }

    get actualId(): BigInt {
        return this._event.parameters[0].value.toBigInt()
    }

    get amountUnlockedLeftover(): BigInt {
        return this._event.parameters[1].value.toBigInt()
    }

    get amountRefunded(): BigInt {
        return this._event.parameters[2].value.toBigInt()
    }

    get refundFounderAddress(): Address {
        return this._event.parameters[3].value.toAddress()
    }
}

export class ActualCreated extends ethereum.Event {
    get params(): ActualCreated__Params {
        return new ActualCreated__Params(this)
    }
}

export class ActualCreated__Params {
    _event: ActualCreated

    constructor(event: ActualCreated) {
        this._event = event
    }

    get presetId(): Bytes {
        return this._event.parameters[0].value.toBytes()
    }

    get actualId(): BigInt {
        return this._event.parameters[1].value.toBigInt()
    }
}

export class Initialized extends ethereum.Event {
    get params(): Initialized__Params {
        return new Initialized__Params(this)
    }
}

export class Initialized__Params {
    _event: Initialized

    constructor(event: Initialized) {
        this._event = event
    }

    get version(): i32 {
        return this._event.parameters[0].value.toI32()
    }
}

export class OwnershipTransferred extends ethereum.Event {
    get params(): OwnershipTransferred__Params {
        return new OwnershipTransferred__Params(this)
    }
}

export class OwnershipTransferred__Params {
    _event: OwnershipTransferred

    constructor(event: OwnershipTransferred) {
        this._event = event
    }

    get previousOwner(): Address {
        return this._event.parameters[0].value.toAddress()
    }

    get newOwner(): Address {
        return this._event.parameters[1].value.toAddress()
    }
}

export class PresetCreated extends ethereum.Event {
    get params(): PresetCreated__Params {
        return new PresetCreated__Params(this)
    }
}

export class PresetCreated__Params {
    _event: PresetCreated

    constructor(event: PresetCreated) {
        this._event = event
    }

    get presetId(): Bytes {
        return this._event.parameters[0].value.toBytes()
    }
}

export class TokensClaimed extends ethereum.Event {
    get params(): TokensClaimed__Params {
        return new TokensClaimed__Params(this)
    }
}

export class TokensClaimed__Params {
    _event: TokensClaimed

    constructor(event: TokensClaimed) {
        this._event = event
    }

    get actualId(): BigInt {
        return this._event.parameters[0].value.toBigInt()
    }

    get caller(): Address {
        return this._event.parameters[1].value.toAddress()
    }

    get to(): Address {
        return this._event.parameters[2].value.toAddress()
    }

    get amount(): BigInt {
        return this._event.parameters[3].value.toBigInt()
    }
}

export class TokensDeposited extends ethereum.Event {
    get params(): TokensDeposited__Params {
        return new TokensDeposited__Params(this)
    }
}

export class TokensDeposited__Params {
    _event: TokensDeposited

    constructor(event: TokensDeposited) {
        this._event = event
    }

    get actualId(): BigInt {
        return this._event.parameters[0].value.toBigInt()
    }

    get amount(): BigInt {
        return this._event.parameters[1].value.toBigInt()
    }
}

export class TokensWithdrawn extends ethereum.Event {
    get params(): TokensWithdrawn__Params {
        return new TokensWithdrawn__Params(this)
    }
}

export class TokensWithdrawn__Params {
    _event: TokensWithdrawn

    constructor(event: TokensWithdrawn) {
        this._event = event
    }

    get actualId(): BigInt {
        return this._event.parameters[0].value.toBigInt()
    }

    get by(): Address {
        return this._event.parameters[1].value.toAddress()
    }

    get amount(): BigInt {
        return this._event.parameters[2].value.toBigInt()
    }
}

export class TokenTableUnlockerV2__calculateAmountClaimableResult {
    value0: BigInt
    value1: BigInt

    constructor(value0: BigInt, value1: BigInt) {
        this.value0 = value0
        this.value1 = value1
    }

    toMap(): TypedMap<string, ethereum.Value> {
        let map = new TypedMap<string, ethereum.Value>()
        map.set('value0', ethereum.Value.fromUnsignedBigInt(this.value0))
        map.set('value1', ethereum.Value.fromUnsignedBigInt(this.value1))
        return map
    }

    getDeltaAmountClaimable(): BigInt {
        return this.value0
    }

    getUpdatedAmountClaimed(): BigInt {
        return this.value1
    }
}

export class TokenTableUnlockerV2__cancelResult {
    value0: BigInt
    value1: BigInt

    constructor(value0: BigInt, value1: BigInt) {
        this.value0 = value0
        this.value1 = value1
    }

    toMap(): TypedMap<string, ethereum.Value> {
        let map = new TypedMap<string, ethereum.Value>()
        map.set('value0', ethereum.Value.fromUnsignedBigInt(this.value0))
        map.set('value1', ethereum.Value.fromUnsignedBigInt(this.value1))
        return map
    }

    getAmountUnlockedLeftover(): BigInt {
        return this.value0
    }

    getAmountRefunded(): BigInt {
        return this.value1
    }
}

export class TokenTableUnlockerV2__unlockingScheduleActualsResult {
    value0: Bytes
    value1: BigInt
    value2: BigInt
    value3: BigInt
    value4: BigInt

    constructor(
        value0: Bytes,
        value1: BigInt,
        value2: BigInt,
        value3: BigInt,
        value4: BigInt
    ) {
        this.value0 = value0
        this.value1 = value1
        this.value2 = value2
        this.value3 = value3
        this.value4 = value4
    }

    toMap(): TypedMap<string, ethereum.Value> {
        let map = new TypedMap<string, ethereum.Value>()
        map.set('value0', ethereum.Value.fromFixedBytes(this.value0))
        map.set('value1', ethereum.Value.fromUnsignedBigInt(this.value1))
        map.set('value2', ethereum.Value.fromUnsignedBigInt(this.value2))
        map.set('value3', ethereum.Value.fromUnsignedBigInt(this.value3))
        map.set('value4', ethereum.Value.fromUnsignedBigInt(this.value4))
        return map
    }

    getPresetId(): Bytes {
        return this.value0
    }

    getStartTimestampAbsolute(): BigInt {
        return this.value1
    }

    getAmountClaimed(): BigInt {
        return this.value2
    }

    getAmountDeposited(): BigInt {
        return this.value3
    }

    getTotalAmount(): BigInt {
        return this.value4
    }
}

export class TokenTableUnlockerV2 extends ethereum.SmartContract {
    static bind(address: Address): TokenTableUnlockerV2 {
        return new TokenTableUnlockerV2('TokenTableUnlockerV2', address)
    }

    BIPS_PRECISION(): BigInt {
        let result = super.call(
            'BIPS_PRECISION',
            'BIPS_PRECISION():(uint256)',
            []
        )

        return result[0].toBigInt()
    }

    try_BIPS_PRECISION(): ethereum.CallResult<BigInt> {
        let result = super.tryCall(
            'BIPS_PRECISION',
            'BIPS_PRECISION():(uint256)',
            []
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBigInt())
    }

    accessControlDelegate(): Address {
        let result = super.call(
            'accessControlDelegate',
            'accessControlDelegate():(address)',
            []
        )

        return result[0].toAddress()
    }

    try_accessControlDelegate(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            'accessControlDelegate',
            'accessControlDelegate():(address)',
            []
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    amountUnlockedLeftoverForActuals(param0: BigInt): BigInt {
        let result = super.call(
            'amountUnlockedLeftoverForActuals',
            'amountUnlockedLeftoverForActuals(uint256):(uint256)',
            [ethereum.Value.fromUnsignedBigInt(param0)]
        )

        return result[0].toBigInt()
    }

    try_amountUnlockedLeftoverForActuals(
        param0: BigInt
    ): ethereum.CallResult<BigInt> {
        let result = super.tryCall(
            'amountUnlockedLeftoverForActuals',
            'amountUnlockedLeftoverForActuals(uint256):(uint256)',
            [ethereum.Value.fromUnsignedBigInt(param0)]
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBigInt())
    }

    calculateAmountClaimable(
        actualId: BigInt
    ): TokenTableUnlockerV2__calculateAmountClaimableResult {
        let result = super.call(
            'calculateAmountClaimable',
            'calculateAmountClaimable(uint256):(uint256,uint256)',
            [ethereum.Value.fromUnsignedBigInt(actualId)]
        )

        return new TokenTableUnlockerV2__calculateAmountClaimableResult(
            result[0].toBigInt(),
            result[1].toBigInt()
        )
    }

    try_calculateAmountClaimable(
        actualId: BigInt
    ): ethereum.CallResult<TokenTableUnlockerV2__calculateAmountClaimableResult> {
        let result = super.tryCall(
            'calculateAmountClaimable',
            'calculateAmountClaimable(uint256):(uint256,uint256)',
            [ethereum.Value.fromUnsignedBigInt(actualId)]
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(
            new TokenTableUnlockerV2__calculateAmountClaimableResult(
                value[0].toBigInt(),
                value[1].toBigInt()
            )
        )
    }

    cancel(
        actualId: BigInt,
        refundFounderAddress: Address
    ): TokenTableUnlockerV2__cancelResult {
        let result = super.call(
            'cancel',
            'cancel(uint256,address):(uint256,uint256)',
            [
                ethereum.Value.fromUnsignedBigInt(actualId),
                ethereum.Value.fromAddress(refundFounderAddress)
            ]
        )

        return new TokenTableUnlockerV2__cancelResult(
            result[0].toBigInt(),
            result[1].toBigInt()
        )
    }

    try_cancel(
        actualId: BigInt,
        refundFounderAddress: Address
    ): ethereum.CallResult<TokenTableUnlockerV2__cancelResult> {
        let result = super.tryCall(
            'cancel',
            'cancel(uint256,address):(uint256,uint256)',
            [
                ethereum.Value.fromUnsignedBigInt(actualId),
                ethereum.Value.fromAddress(refundFounderAddress)
            ]
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(
            new TokenTableUnlockerV2__cancelResult(
                value[0].toBigInt(),
                value[1].toBigInt()
            )
        )
    }

    deployer(): Address {
        let result = super.call('deployer', 'deployer():(address)', [])

        return result[0].toAddress()
    }

    try_deployer(): ethereum.CallResult<Address> {
        let result = super.tryCall('deployer', 'deployer():(address)', [])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    futureToken(): Address {
        let result = super.call('futureToken', 'futureToken():(address)', [])

        return result[0].toAddress()
    }

    try_futureToken(): ethereum.CallResult<Address> {
        let result = super.tryCall('futureToken', 'futureToken():(address)', [])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    getEncodedPreset(presetId: Bytes): Bytes {
        let result = super.call(
            'getEncodedPreset',
            'getEncodedPreset(bytes32):(bytes)',
            [ethereum.Value.fromFixedBytes(presetId)]
        )

        return result[0].toBytes()
    }

    try_getEncodedPreset(presetId: Bytes): ethereum.CallResult<Bytes> {
        let result = super.tryCall(
            'getEncodedPreset',
            'getEncodedPreset(bytes32):(bytes)',
            [ethereum.Value.fromFixedBytes(presetId)]
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBytes())
    }

    getProjectToken(): Address {
        let result = super.call(
            'getProjectToken',
            'getProjectToken():(address)',
            []
        )

        return result[0].toAddress()
    }

    try_getProjectToken(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            'getProjectToken',
            'getProjectToken():(address)',
            []
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    hook(): Address {
        let result = super.call('hook', 'hook():(address)', [])

        return result[0].toAddress()
    }

    try_hook(): ethereum.CallResult<Address> {
        let result = super.tryCall('hook', 'hook():(address)', [])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    isAccessControllable(): boolean {
        let result = super.call(
            'isAccessControllable',
            'isAccessControllable():(bool)',
            []
        )

        return result[0].toBoolean()
    }

    try_isAccessControllable(): ethereum.CallResult<boolean> {
        let result = super.tryCall(
            'isAccessControllable',
            'isAccessControllable():(bool)',
            []
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBoolean())
    }

    isCancelable(): boolean {
        let result = super.call('isCancelable', 'isCancelable():(bool)', [])

        return result[0].toBoolean()
    }

    try_isCancelable(): ethereum.CallResult<boolean> {
        let result = super.tryCall('isCancelable', 'isCancelable():(bool)', [])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBoolean())
    }

    isHookable(): boolean {
        let result = super.call('isHookable', 'isHookable():(bool)', [])

        return result[0].toBoolean()
    }

    try_isHookable(): ethereum.CallResult<boolean> {
        let result = super.tryCall('isHookable', 'isHookable():(bool)', [])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBoolean())
    }

    owner(): Address {
        let result = super.call('owner', 'owner():(address)', [])

        return result[0].toAddress()
    }

    try_owner(): ethereum.CallResult<Address> {
        let result = super.tryCall('owner', 'owner():(address)', [])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    unlockingScheduleActuals(
        param0: BigInt
    ): TokenTableUnlockerV2__unlockingScheduleActualsResult {
        let result = super.call(
            'unlockingScheduleActuals',
            'unlockingScheduleActuals(uint256):(bytes32,uint256,uint256,uint256,uint256)',
            [ethereum.Value.fromUnsignedBigInt(param0)]
        )

        return new TokenTableUnlockerV2__unlockingScheduleActualsResult(
            result[0].toBytes(),
            result[1].toBigInt(),
            result[2].toBigInt(),
            result[3].toBigInt(),
            result[4].toBigInt()
        )
    }

    try_unlockingScheduleActuals(
        param0: BigInt
    ): ethereum.CallResult<TokenTableUnlockerV2__unlockingScheduleActualsResult> {
        let result = super.tryCall(
            'unlockingScheduleActuals',
            'unlockingScheduleActuals(uint256):(bytes32,uint256,uint256,uint256,uint256)',
            [ethereum.Value.fromUnsignedBigInt(param0)]
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(
            new TokenTableUnlockerV2__unlockingScheduleActualsResult(
                value[0].toBytes(),
                value[1].toBigInt(),
                value[2].toBigInt(),
                value[3].toBigInt(),
                value[4].toBigInt()
            )
        )
    }
}

export class ConstructorCall extends ethereum.Call {
    get inputs(): ConstructorCall__Inputs {
        return new ConstructorCall__Inputs(this)
    }

    get outputs(): ConstructorCall__Outputs {
        return new ConstructorCall__Outputs(this)
    }
}

export class ConstructorCall__Inputs {
    _call: ConstructorCall

    constructor(call: ConstructorCall) {
        this._call = call
    }
}

export class ConstructorCall__Outputs {
    _call: ConstructorCall

    constructor(call: ConstructorCall) {
        this._call = call
    }
}

export class BatchClaimCall extends ethereum.Call {
    get inputs(): BatchClaimCall__Inputs {
        return new BatchClaimCall__Inputs(this)
    }

    get outputs(): BatchClaimCall__Outputs {
        return new BatchClaimCall__Outputs(this)
    }
}

export class BatchClaimCall__Inputs {
    _call: BatchClaimCall

    constructor(call: BatchClaimCall) {
        this._call = call
    }

    get actualId(): Array<BigInt> {
        return this._call.inputValues[0].value.toBigIntArray()
    }

    get overrideRecipient(): Array<Address> {
        return this._call.inputValues[1].value.toAddressArray()
    }
}

export class BatchClaimCall__Outputs {
    _call: BatchClaimCall

    constructor(call: BatchClaimCall) {
        this._call = call
    }
}

export class BatchCreateActualCall extends ethereum.Call {
    get inputs(): BatchCreateActualCall__Inputs {
        return new BatchCreateActualCall__Inputs(this)
    }

    get outputs(): BatchCreateActualCall__Outputs {
        return new BatchCreateActualCall__Outputs(this)
    }
}

export class BatchCreateActualCall__Inputs {
    _call: BatchCreateActualCall

    constructor(call: BatchCreateActualCall) {
        this._call = call
    }

    get recipient(): Array<Address> {
        return this._call.inputValues[0].value.toAddressArray()
    }

    get presetId(): Array<Bytes> {
        return this._call.inputValues[1].value.toBytesArray()
    }

    get startTimestampAbsolute(): Array<BigInt> {
        return this._call.inputValues[2].value.toBigIntArray()
    }

    get amountSkipped(): Array<BigInt> {
        return this._call.inputValues[3].value.toBigIntArray()
    }

    get totalAmount(): Array<BigInt> {
        return this._call.inputValues[4].value.toBigIntArray()
    }

    get amountDepositingNow(): Array<BigInt> {
        return this._call.inputValues[5].value.toBigIntArray()
    }
}

export class BatchCreateActualCall__Outputs {
    _call: BatchCreateActualCall

    constructor(call: BatchCreateActualCall) {
        this._call = call
    }
}

export class BatchCreatePresetCall extends ethereum.Call {
    get inputs(): BatchCreatePresetCall__Inputs {
        return new BatchCreatePresetCall__Inputs(this)
    }

    get outputs(): BatchCreatePresetCall__Outputs {
        return new BatchCreatePresetCall__Outputs(this)
    }
}

export class BatchCreatePresetCall__Inputs {
    _call: BatchCreatePresetCall

    constructor(call: BatchCreatePresetCall) {
        this._call = call
    }

    get presetId(): Array<Bytes> {
        return this._call.inputValues[0].value.toBytesArray()
    }

    get linearStartTimestampsRelative(): Array<Array<BigInt>> {
        return this._call.inputValues[1].value.toBigIntMatrix()
    }

    get linearEndTimestampRelative(): Array<BigInt> {
        return this._call.inputValues[2].value.toBigIntArray()
    }

    get linearBips(): Array<Array<BigInt>> {
        return this._call.inputValues[3].value.toBigIntMatrix()
    }

    get numOfUnlocksForEachLinear(): Array<Array<BigInt>> {
        return this._call.inputValues[4].value.toBigIntMatrix()
    }
}

export class BatchCreatePresetCall__Outputs {
    _call: BatchCreatePresetCall

    constructor(call: BatchCreatePresetCall) {
        this._call = call
    }
}

export class BatchDepositCall extends ethereum.Call {
    get inputs(): BatchDepositCall__Inputs {
        return new BatchDepositCall__Inputs(this)
    }

    get outputs(): BatchDepositCall__Outputs {
        return new BatchDepositCall__Outputs(this)
    }
}

export class BatchDepositCall__Inputs {
    _call: BatchDepositCall

    constructor(call: BatchDepositCall) {
        this._call = call
    }

    get actualId(): Array<BigInt> {
        return this._call.inputValues[0].value.toBigIntArray()
    }

    get amount(): Array<BigInt> {
        return this._call.inputValues[1].value.toBigIntArray()
    }
}

export class BatchDepositCall__Outputs {
    _call: BatchDepositCall

    constructor(call: BatchDepositCall) {
        this._call = call
    }
}

export class CancelCall extends ethereum.Call {
    get inputs(): CancelCall__Inputs {
        return new CancelCall__Inputs(this)
    }

    get outputs(): CancelCall__Outputs {
        return new CancelCall__Outputs(this)
    }
}

export class CancelCall__Inputs {
    _call: CancelCall

    constructor(call: CancelCall) {
        this._call = call
    }

    get actualId(): BigInt {
        return this._call.inputValues[0].value.toBigInt()
    }

    get refundFounderAddress(): Address {
        return this._call.inputValues[1].value.toAddress()
    }
}

export class CancelCall__Outputs {
    _call: CancelCall

    constructor(call: CancelCall) {
        this._call = call
    }

    get amountUnlockedLeftover(): BigInt {
        return this._call.outputValues[0].value.toBigInt()
    }

    get amountRefunded(): BigInt {
        return this._call.outputValues[1].value.toBigInt()
    }
}

export class ClaimCall extends ethereum.Call {
    get inputs(): ClaimCall__Inputs {
        return new ClaimCall__Inputs(this)
    }

    get outputs(): ClaimCall__Outputs {
        return new ClaimCall__Outputs(this)
    }
}

export class ClaimCall__Inputs {
    _call: ClaimCall

    constructor(call: ClaimCall) {
        this._call = call
    }

    get actualId(): BigInt {
        return this._call.inputValues[0].value.toBigInt()
    }

    get overrideRecipient(): Address {
        return this._call.inputValues[1].value.toAddress()
    }
}

export class ClaimCall__Outputs {
    _call: ClaimCall

    constructor(call: ClaimCall) {
        this._call = call
    }
}

export class ClaimCancelledActualCall extends ethereum.Call {
    get inputs(): ClaimCancelledActualCall__Inputs {
        return new ClaimCancelledActualCall__Inputs(this)
    }

    get outputs(): ClaimCancelledActualCall__Outputs {
        return new ClaimCancelledActualCall__Outputs(this)
    }
}

export class ClaimCancelledActualCall__Inputs {
    _call: ClaimCancelledActualCall

    constructor(call: ClaimCancelledActualCall) {
        this._call = call
    }

    get actualId(): BigInt {
        return this._call.inputValues[0].value.toBigInt()
    }

    get overrideRecipient(): Address {
        return this._call.inputValues[1].value.toAddress()
    }
}

export class ClaimCancelledActualCall__Outputs {
    _call: ClaimCancelledActualCall

    constructor(call: ClaimCancelledActualCall) {
        this._call = call
    }
}

export class CreateActualCall extends ethereum.Call {
    get inputs(): CreateActualCall__Inputs {
        return new CreateActualCall__Inputs(this)
    }

    get outputs(): CreateActualCall__Outputs {
        return new CreateActualCall__Outputs(this)
    }
}

export class CreateActualCall__Inputs {
    _call: CreateActualCall

    constructor(call: CreateActualCall) {
        this._call = call
    }

    get recipient(): Address {
        return this._call.inputValues[0].value.toAddress()
    }

    get presetId(): Bytes {
        return this._call.inputValues[1].value.toBytes()
    }

    get startTimestampAbsolute(): BigInt {
        return this._call.inputValues[2].value.toBigInt()
    }

    get amountSkipped(): BigInt {
        return this._call.inputValues[3].value.toBigInt()
    }

    get totalAmount(): BigInt {
        return this._call.inputValues[4].value.toBigInt()
    }

    get amountDepositingNow(): BigInt {
        return this._call.inputValues[5].value.toBigInt()
    }
}

export class CreateActualCall__Outputs {
    _call: CreateActualCall

    constructor(call: CreateActualCall) {
        this._call = call
    }
}

export class CreatePresetCall extends ethereum.Call {
    get inputs(): CreatePresetCall__Inputs {
        return new CreatePresetCall__Inputs(this)
    }

    get outputs(): CreatePresetCall__Outputs {
        return new CreatePresetCall__Outputs(this)
    }
}

export class CreatePresetCall__Inputs {
    _call: CreatePresetCall

    constructor(call: CreatePresetCall) {
        this._call = call
    }

    get presetId(): Bytes {
        return this._call.inputValues[0].value.toBytes()
    }

    get linearStartTimestampsRelative(): Array<BigInt> {
        return this._call.inputValues[1].value.toBigIntArray()
    }

    get linearEndTimestampRelative(): BigInt {
        return this._call.inputValues[2].value.toBigInt()
    }

    get linearBips(): Array<BigInt> {
        return this._call.inputValues[3].value.toBigIntArray()
    }

    get numOfUnlocksForEachLinear(): Array<BigInt> {
        return this._call.inputValues[4].value.toBigIntArray()
    }
}

export class CreatePresetCall__Outputs {
    _call: CreatePresetCall

    constructor(call: CreatePresetCall) {
        this._call = call
    }
}

export class DepositCall extends ethereum.Call {
    get inputs(): DepositCall__Inputs {
        return new DepositCall__Inputs(this)
    }

    get outputs(): DepositCall__Outputs {
        return new DepositCall__Outputs(this)
    }
}

export class DepositCall__Inputs {
    _call: DepositCall

    constructor(call: DepositCall) {
        this._call = call
    }

    get actualId(): BigInt {
        return this._call.inputValues[0].value.toBigInt()
    }

    get amount(): BigInt {
        return this._call.inputValues[1].value.toBigInt()
    }
}

export class DepositCall__Outputs {
    _call: DepositCall

    constructor(call: DepositCall) {
        this._call = call
    }
}

export class DisableAccessControlDelegateCall extends ethereum.Call {
    get inputs(): DisableAccessControlDelegateCall__Inputs {
        return new DisableAccessControlDelegateCall__Inputs(this)
    }

    get outputs(): DisableAccessControlDelegateCall__Outputs {
        return new DisableAccessControlDelegateCall__Outputs(this)
    }
}

export class DisableAccessControlDelegateCall__Inputs {
    _call: DisableAccessControlDelegateCall

    constructor(call: DisableAccessControlDelegateCall) {
        this._call = call
    }
}

export class DisableAccessControlDelegateCall__Outputs {
    _call: DisableAccessControlDelegateCall

    constructor(call: DisableAccessControlDelegateCall) {
        this._call = call
    }
}

export class DisableCancelCall extends ethereum.Call {
    get inputs(): DisableCancelCall__Inputs {
        return new DisableCancelCall__Inputs(this)
    }

    get outputs(): DisableCancelCall__Outputs {
        return new DisableCancelCall__Outputs(this)
    }
}

export class DisableCancelCall__Inputs {
    _call: DisableCancelCall

    constructor(call: DisableCancelCall) {
        this._call = call
    }
}

export class DisableCancelCall__Outputs {
    _call: DisableCancelCall

    constructor(call: DisableCancelCall) {
        this._call = call
    }
}

export class DisableHookCall extends ethereum.Call {
    get inputs(): DisableHookCall__Inputs {
        return new DisableHookCall__Inputs(this)
    }

    get outputs(): DisableHookCall__Outputs {
        return new DisableHookCall__Outputs(this)
    }
}

export class DisableHookCall__Inputs {
    _call: DisableHookCall

    constructor(call: DisableHookCall) {
        this._call = call
    }
}

export class DisableHookCall__Outputs {
    _call: DisableHookCall

    constructor(call: DisableHookCall) {
        this._call = call
    }
}

export class InitializeCall extends ethereum.Call {
    get inputs(): InitializeCall__Inputs {
        return new InitializeCall__Inputs(this)
    }

    get outputs(): InitializeCall__Outputs {
        return new InitializeCall__Outputs(this)
    }
}

export class InitializeCall__Inputs {
    _call: InitializeCall

    constructor(call: InitializeCall) {
        this._call = call
    }

    get projectToken(): Address {
        return this._call.inputValues[0].value.toAddress()
    }

    get futureToken_(): Address {
        return this._call.inputValues[1].value.toAddress()
    }

    get deployer_(): Address {
        return this._call.inputValues[2].value.toAddress()
    }
}

export class InitializeCall__Outputs {
    _call: InitializeCall

    constructor(call: InitializeCall) {
        this._call = call
    }
}

export class InitializeProjectTokenCall extends ethereum.Call {
    get inputs(): InitializeProjectTokenCall__Inputs {
        return new InitializeProjectTokenCall__Inputs(this)
    }

    get outputs(): InitializeProjectTokenCall__Outputs {
        return new InitializeProjectTokenCall__Outputs(this)
    }
}

export class InitializeProjectTokenCall__Inputs {
    _call: InitializeProjectTokenCall

    constructor(call: InitializeProjectTokenCall) {
        this._call = call
    }

    get projectToken(): Address {
        return this._call.inputValues[0].value.toAddress()
    }
}

export class InitializeProjectTokenCall__Outputs {
    _call: InitializeProjectTokenCall

    constructor(call: InitializeProjectTokenCall) {
        this._call = call
    }
}

export class RenounceOwnershipCall extends ethereum.Call {
    get inputs(): RenounceOwnershipCall__Inputs {
        return new RenounceOwnershipCall__Inputs(this)
    }

    get outputs(): RenounceOwnershipCall__Outputs {
        return new RenounceOwnershipCall__Outputs(this)
    }
}

export class RenounceOwnershipCall__Inputs {
    _call: RenounceOwnershipCall

    constructor(call: RenounceOwnershipCall) {
        this._call = call
    }
}

export class RenounceOwnershipCall__Outputs {
    _call: RenounceOwnershipCall

    constructor(call: RenounceOwnershipCall) {
        this._call = call
    }
}

export class SetAccessControlDelegateCall extends ethereum.Call {
    get inputs(): SetAccessControlDelegateCall__Inputs {
        return new SetAccessControlDelegateCall__Inputs(this)
    }

    get outputs(): SetAccessControlDelegateCall__Outputs {
        return new SetAccessControlDelegateCall__Outputs(this)
    }
}

export class SetAccessControlDelegateCall__Inputs {
    _call: SetAccessControlDelegateCall

    constructor(call: SetAccessControlDelegateCall) {
        this._call = call
    }

    get accessControlDelegate_(): Address {
        return this._call.inputValues[0].value.toAddress()
    }
}

export class SetAccessControlDelegateCall__Outputs {
    _call: SetAccessControlDelegateCall

    constructor(call: SetAccessControlDelegateCall) {
        this._call = call
    }
}

export class SetHookCall extends ethereum.Call {
    get inputs(): SetHookCall__Inputs {
        return new SetHookCall__Inputs(this)
    }

    get outputs(): SetHookCall__Outputs {
        return new SetHookCall__Outputs(this)
    }
}

export class SetHookCall__Inputs {
    _call: SetHookCall

    constructor(call: SetHookCall) {
        this._call = call
    }

    get hook_(): Address {
        return this._call.inputValues[0].value.toAddress()
    }
}

export class SetHookCall__Outputs {
    _call: SetHookCall

    constructor(call: SetHookCall) {
        this._call = call
    }
}

export class TransferOwnershipCall extends ethereum.Call {
    get inputs(): TransferOwnershipCall__Inputs {
        return new TransferOwnershipCall__Inputs(this)
    }

    get outputs(): TransferOwnershipCall__Outputs {
        return new TransferOwnershipCall__Outputs(this)
    }
}

export class TransferOwnershipCall__Inputs {
    _call: TransferOwnershipCall

    constructor(call: TransferOwnershipCall) {
        this._call = call
    }

    get newOwner(): Address {
        return this._call.inputValues[0].value.toAddress()
    }
}

export class TransferOwnershipCall__Outputs {
    _call: TransferOwnershipCall

    constructor(call: TransferOwnershipCall) {
        this._call = call
    }
}

export class WithdrawDepositCall extends ethereum.Call {
    get inputs(): WithdrawDepositCall__Inputs {
        return new WithdrawDepositCall__Inputs(this)
    }

    get outputs(): WithdrawDepositCall__Outputs {
        return new WithdrawDepositCall__Outputs(this)
    }
}

export class WithdrawDepositCall__Inputs {
    _call: WithdrawDepositCall

    constructor(call: WithdrawDepositCall) {
        this._call = call
    }

    get actualId(): BigInt {
        return this._call.inputValues[0].value.toBigInt()
    }

    get amount(): BigInt {
        return this._call.inputValues[1].value.toBigInt()
    }
}

export class WithdrawDepositCall__Outputs {
    _call: WithdrawDepositCall

    constructor(call: WithdrawDepositCall) {
        this._call = call
    }
}