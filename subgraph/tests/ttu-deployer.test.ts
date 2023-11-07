import {
    assert,
    describe,
    test,
    clearStore,
    beforeAll,
    afterAll
} from 'matchstick-as/assembly/index'
import {Address} from '@graphprotocol/graph-ts'
import {TokenTableSuiteDeployed} from '../generated/schema'
import {TokenTableSuiteDeployed as TokenTableSuiteDeployedEvent} from '../generated/TTUDeployer/TTUDeployer'
import {handleTokenTableSuiteDeployed} from '../src/ttu-deployer'
import {createTokenTableSuiteDeployedEvent} from './ttu-deployer-utils'

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
    beforeAll(() => {
        let by = Address.fromString(
            '0x0000000000000000000000000000000000000001'
        )
        let unlocker = Address.fromString(
            '0x0000000000000000000000000000000000000001'
        )
        let futureToken = Address.fromString(
            '0x0000000000000000000000000000000000000001'
        )
        let trackerToken = Address.fromString(
            '0x0000000000000000000000000000000000000001'
        )
        let newTokenTableSuiteDeployedEvent =
            createTokenTableSuiteDeployedEvent(
                by,
                unlocker,
                futureToken,
                trackerToken
            )
        handleTokenTableSuiteDeployed(newTokenTableSuiteDeployedEvent)
    })

    afterAll(() => {
        clearStore()
    })

    // For more test scenarios, see:
    // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

    test('TokenTableSuiteDeployed created and stored', () => {
        assert.entityCount('TokenTableSuiteDeployed', 1)

        // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
        assert.fieldEquals(
            'TokenTableSuiteDeployed',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'by',
            '0x0000000000000000000000000000000000000001'
        )
        assert.fieldEquals(
            'TokenTableSuiteDeployed',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'unlocker',
            '0x0000000000000000000000000000000000000001'
        )
        assert.fieldEquals(
            'TokenTableSuiteDeployed',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'futureToken',
            '0x0000000000000000000000000000000000000001'
        )
        assert.fieldEquals(
            'TokenTableSuiteDeployed',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'trackerToken',
            '0x0000000000000000000000000000000000000001'
        )

        // More assert options:
        // https://thegraph.com/docs/en/developer/matchstick/#asserts
    })
})
