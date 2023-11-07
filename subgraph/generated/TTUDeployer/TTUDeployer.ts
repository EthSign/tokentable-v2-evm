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

export class FeeCollectorChanged extends ethereum.Event {
    get params(): FeeCollectorChanged__Params {
        return new FeeCollectorChanged__Params(this)
    }
}

export class FeeCollectorChanged__Params {
    _event: FeeCollectorChanged

    constructor(event: FeeCollectorChanged) {
        this._event = event
    }

    get feeCollector(): Address {
        return this._event.parameters[0].value.toAddress()
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

export class TTUDeployerInitialized extends ethereum.Event {
    get params(): TTUDeployerInitialized__Params {
        return new TTUDeployerInitialized__Params(this)
    }
}

export class TTUDeployerInitialized__Params {
    _event: TTUDeployerInitialized

    constructor(event: TTUDeployerInitialized) {
        this._event = event
    }

    get unlockerImpl(): Address {
        return this._event.parameters[0].value.toAddress()
    }

    get futureTokenImpl(): Address {
        return this._event.parameters[1].value.toAddress()
    }

    get trackerTokenImpl(): Address {
        return this._event.parameters[2].value.toAddress()
    }

    get beaconManagerImpl(): Address {
        return this._event.parameters[3].value.toAddress()
    }

    get feeCollector(): Address {
        return this._event.parameters[4].value.toAddress()
    }
}

export class TokenTableSuiteDeployed extends ethereum.Event {
    get params(): TokenTableSuiteDeployed__Params {
        return new TokenTableSuiteDeployed__Params(this)
    }
}

export class TokenTableSuiteDeployed__Params {
    _event: TokenTableSuiteDeployed

    constructor(event: TokenTableSuiteDeployed) {
        this._event = event
    }

    get by(): Address {
        return this._event.parameters[0].value.toAddress()
    }

    get projectId(): string {
        return this._event.parameters[1].value.toString()
    }

    get unlocker(): Address {
        return this._event.parameters[2].value.toAddress()
    }

    get futureToken(): Address {
        return this._event.parameters[3].value.toAddress()
    }

    get trackerToken(): Address {
        return this._event.parameters[4].value.toAddress()
    }
}

export class TTUDeployer__deployTTSuiteResult {
    value0: Address
    value1: Address
    value2: Address

    constructor(value0: Address, value1: Address, value2: Address) {
        this.value0 = value0
        this.value1 = value1
        this.value2 = value2
    }

    toMap(): TypedMap<string, ethereum.Value> {
        let map = new TypedMap<string, ethereum.Value>()
        map.set('value0', ethereum.Value.fromAddress(this.value0))
        map.set('value1', ethereum.Value.fromAddress(this.value1))
        map.set('value2', ethereum.Value.fromAddress(this.value2))
        return map
    }

    getValue0(): Address {
        return this.value0
    }

    getValue1(): Address {
        return this.value1
    }

    getValue2(): Address {
        return this.value2
    }
}

export class TTUDeployer extends ethereum.SmartContract {
    static bind(address: Address): TTUDeployer {
        return new TTUDeployer('TTUDeployer', address)
    }

    beaconManager(): Address {
        let result = super.call(
            'beaconManager',
            'beaconManager():(address)',
            []
        )

        return result[0].toAddress()
    }

    try_beaconManager(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            'beaconManager',
            'beaconManager():(address)',
            []
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
    }

    deployTTSuite(
        projectToken: Address,
        projectId: string,
        disableAutoUpgrade: boolean,
        allowTransferableFT: boolean
    ): TTUDeployer__deployTTSuiteResult {
        let result = super.call(
            'deployTTSuite',
            'deployTTSuite(address,string,bool,bool):(address,address,address)',
            [
                ethereum.Value.fromAddress(projectToken),
                ethereum.Value.fromString(projectId),
                ethereum.Value.fromBoolean(disableAutoUpgrade),
                ethereum.Value.fromBoolean(allowTransferableFT)
            ]
        )

        return new TTUDeployer__deployTTSuiteResult(
            result[0].toAddress(),
            result[1].toAddress(),
            result[2].toAddress()
        )
    }

    try_deployTTSuite(
        projectToken: Address,
        projectId: string,
        disableAutoUpgrade: boolean,
        allowTransferableFT: boolean
    ): ethereum.CallResult<TTUDeployer__deployTTSuiteResult> {
        let result = super.tryCall(
            'deployTTSuite',
            'deployTTSuite(address,string,bool,bool):(address,address,address)',
            [
                ethereum.Value.fromAddress(projectToken),
                ethereum.Value.fromString(projectId),
                ethereum.Value.fromBoolean(disableAutoUpgrade),
                ethereum.Value.fromBoolean(allowTransferableFT)
            ]
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(
            new TTUDeployer__deployTTSuiteResult(
                value[0].toAddress(),
                value[1].toAddress(),
                value[2].toAddress()
            )
        )
    }

    feeCollector(): Address {
        let result = super.call('feeCollector', 'feeCollector():(address)', [])

        return result[0].toAddress()
    }

    try_feeCollector(): ethereum.CallResult<Address> {
        let result = super.tryCall(
            'feeCollector',
            'feeCollector():(address)',
            []
        )
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toAddress())
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

    registry(param0: string): boolean {
        let result = super.call('registry', 'registry(string):(bool)', [
            ethereum.Value.fromString(param0)
        ])

        return result[0].toBoolean()
    }

    try_registry(param0: string): ethereum.CallResult<boolean> {
        let result = super.tryCall('registry', 'registry(string):(bool)', [
            ethereum.Value.fromString(param0)
        ])
        if (result.reverted) {
            return new ethereum.CallResult()
        }
        let value = result.value
        return ethereum.CallResult.fromValue(value[0].toBoolean())
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

export class DeployTTSuiteCall extends ethereum.Call {
    get inputs(): DeployTTSuiteCall__Inputs {
        return new DeployTTSuiteCall__Inputs(this)
    }

    get outputs(): DeployTTSuiteCall__Outputs {
        return new DeployTTSuiteCall__Outputs(this)
    }
}

export class DeployTTSuiteCall__Inputs {
    _call: DeployTTSuiteCall

    constructor(call: DeployTTSuiteCall) {
        this._call = call
    }

    get projectToken(): Address {
        return this._call.inputValues[0].value.toAddress()
    }

    get projectId(): string {
        return this._call.inputValues[1].value.toString()
    }

    get disableAutoUpgrade(): boolean {
        return this._call.inputValues[2].value.toBoolean()
    }

    get allowTransferableFT(): boolean {
        return this._call.inputValues[3].value.toBoolean()
    }
}

export class DeployTTSuiteCall__Outputs {
    _call: DeployTTSuiteCall

    constructor(call: DeployTTSuiteCall) {
        this._call = call
    }

    get value0(): Address {
        return this._call.outputValues[0].value.toAddress()
    }

    get value1(): Address {
        return this._call.outputValues[1].value.toAddress()
    }

    get value2(): Address {
        return this._call.outputValues[2].value.toAddress()
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

export class SetBeaconManagerCall extends ethereum.Call {
    get inputs(): SetBeaconManagerCall__Inputs {
        return new SetBeaconManagerCall__Inputs(this)
    }

    get outputs(): SetBeaconManagerCall__Outputs {
        return new SetBeaconManagerCall__Outputs(this)
    }
}

export class SetBeaconManagerCall__Inputs {
    _call: SetBeaconManagerCall

    constructor(call: SetBeaconManagerCall) {
        this._call = call
    }

    get _beaconManager(): Address {
        return this._call.inputValues[0].value.toAddress()
    }
}

export class SetBeaconManagerCall__Outputs {
    _call: SetBeaconManagerCall

    constructor(call: SetBeaconManagerCall) {
        this._call = call
    }
}

export class SetFeeCollectorCall extends ethereum.Call {
    get inputs(): SetFeeCollectorCall__Inputs {
        return new SetFeeCollectorCall__Inputs(this)
    }

    get outputs(): SetFeeCollectorCall__Outputs {
        return new SetFeeCollectorCall__Outputs(this)
    }
}

export class SetFeeCollectorCall__Inputs {
    _call: SetFeeCollectorCall

    constructor(call: SetFeeCollectorCall) {
        this._call = call
    }

    get feeCollector_(): Address {
        return this._call.inputValues[0].value.toAddress()
    }
}

export class SetFeeCollectorCall__Outputs {
    _call: SetFeeCollectorCall

    constructor(call: SetFeeCollectorCall) {
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
