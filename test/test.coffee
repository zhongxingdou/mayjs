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
            IAnimal = $interface move: [distance: Number ]
            IAnimal.should.not.equal(null)

            Animal = $class
                initialize: ->
                    _name = name || "";
                    this.getName = ->
                        return  "Animal: " + _name;
                move: (distance) ->
                    return this.getName() + " moved " + distance + " step."

            $implement IAnimal, Animal.prototype

            $support(IAnimal, Animal.prototype).should.be.true
