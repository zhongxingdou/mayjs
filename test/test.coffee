assert = require "assert"
Mayjs = require '../may'
eval Mayjs.DSL()

describe 'Array', ->
	describe '#indexOf()', ->
		it 'should return -1 when the value is not present', ->
			assert.equal -1, [1..3].indexOf 5

describe 'Mayjs', ->
    describe '#$interface()', ->
        it 'return a interface object', ->
            $interface().should.not.equal null

