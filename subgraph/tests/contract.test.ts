import {
    assert,
    describe,
    test,
    clearStore,
    beforeAll,
    afterAll
} from 'matchstick-as/assembly/index'
import {BigInt, Address, Bytes} from '@graphprotocol/graph-ts'
import {ActualCancelled} from '../generated/schema'
import {ActualCancelled as ActualCancelledEvent} from '../generated/Contract/Contract'
import {handleActualCancelled} from '../src/contract'
import {createActualCancelledEvent} from './contract-utils'

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
    beforeAll(() => {
        let actualId = BigInt.fromI32(234)
        let amountClaimed = BigInt.fromI32(234)
        let amountRefunded = BigInt.fromI32(234)
        let refundFounderAddress = Address.fromString(
            '0x0000000000000000000000000000000000000001'
        )
        let newActualCancelledEvent = createActualCancelledEvent(
            actualId,
            amountClaimed,
            amountRefunded,
            refundFounderAddress
        )
        handleActualCancelled(newActualCancelledEvent)
    })

    afterAll(() => {
        clearStore()
    })

    // For more test scenarios, see:
    // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

    test('ActualCancelled created and stored', () => {
        assert.entityCount('ActualCancelled', 1)

        // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
        assert.fieldEquals(
            'ActualCancelled',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'actualId',
            '234'
        )
        assert.fieldEquals(
            'ActualCancelled',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'amountClaimed',
            '234'
        )
        assert.fieldEquals(
            'ActualCancelled',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'amountRefunded',
            '234'
        )
        assert.fieldEquals(
            'ActualCancelled',
            '0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1',
            'refundFounderAddress',
            '0x0000000000000000000000000000000000000001'
        )

        // More assert options:
        // https://thegraph.com/docs/en/developer/matchstick/#asserts
    })
})
