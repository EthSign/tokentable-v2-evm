import {newMockEvent} from 'matchstick-as'
import {ethereum, Address} from '@graphprotocol/graph-ts'
import {TokenTableSuiteDeployed} from '../generated/TTUDeployer/TTUDeployer'

export function createTokenTableSuiteDeployedEvent(
    by: Address,
    unlocker: Address,
    futureToken: Address,
    trackerToken: Address
): TokenTableSuiteDeployed {
    let tokenTableSuiteDeployedEvent = changetype<TokenTableSuiteDeployed>(
        newMockEvent()
    )

    tokenTableSuiteDeployedEvent.parameters = new Array()

    tokenTableSuiteDeployedEvent.parameters.push(
        new ethereum.EventParam('by', ethereum.Value.fromAddress(by))
    )
    tokenTableSuiteDeployedEvent.parameters.push(
        new ethereum.EventParam(
            'unlocker',
            ethereum.Value.fromAddress(unlocker)
        )
    )
    tokenTableSuiteDeployedEvent.parameters.push(
        new ethereum.EventParam(
            'futureToken',
            ethereum.Value.fromAddress(futureToken)
        )
    )
    tokenTableSuiteDeployedEvent.parameters.push(
        new ethereum.EventParam(
            'trackerToken',
            ethereum.Value.fromAddress(trackerToken)
        )
    )

    return tokenTableSuiteDeployedEvent
}
