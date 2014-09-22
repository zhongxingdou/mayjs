describe 'MObjectUtil', ->
    util = require('../may.js').MObjectUtil
    describe '#isPrivate()', ->
        it 'should assert a name whether it can be a private method name', ->
            isPrivate = util.isPrivate.bind util
            isPrivate('__fn').should.be.true
            isPrivate('__').should.be.true

            isPrivate('_fn').should.be.false
            isPrivate('_fn__').should.be.false

            isPrivate('fn').should.be.false
            isPrivate('fn__').should.be.false

    describe '#isProtected()', ->
        it 'should assert a name whether it can be a protected method name', ->
            isProtected = util.isProtected.bind util
            isProtected('_fn').should.be.true
            isProtected('_').should.be.true

            isProtected('__fn').should.be.false

            isProtected('fn').should.be.false
            isProtected('fn_').should.be.false

    describe '#isPublic()', ->
        it 'should assert a name whether it can be a public method name', ->
            isPublic = util.isPublic.bind util
            isPublic('fn').should.be.true
            isPublic('fn__').should.be.true
            isPublic('fn_').should.be.true

            isPublic('__fn').should.be.false
            isPublic('_fn').should.be.false

    describe '#has()', ->
        it 'should assert an object whether it has a property with given name', ->
            has = util.has
            o = 'p' : {}
            has(o, 'p').should.be.true

            has(o, 'toString').should.be.false

    describe "#can()", ->
        it 'should assert an object whether it have a method with given name', ->
            can = util.can
            o = 'doAction' : ->
            can(o, 'doAction').should.be.true

            can(o, 'doAny').should.be.false

    describe "#eachAll()", ->
        it 'should each every member of an object unless it is not enumerably', ->
            eachAll = util.eachAll
            o = 
                'p1': {}
                'p2': {}

            keys = []
            members = []
            eachAll o, (k, v) ->
                keys.push k
                members.push v

            keys.should.containEql 'p1'
            members[0].should.equal o.p1

            keys.should.containEql 'p2'
            members[1].should.equal o.p2

            keys.should.not.containEql 'pOther'
            keys.should.not.containEql 'toString'

            clazz = ->
            clazz.prototype = 
                'baseFn': ->

            obj = new clazz
            obj.ownFn = ->

            keys = []
            eachAll obj, (k, v) ->
                keys.push k

            keys.should.containEql 'baseFn'
            keys.should.containEql 'ownFn'

    describe "#eachOwn()", ->
        it 'should each every own member of an object unless it is not enumerably', ->
            clazz = ->
            clazz.prototype = 
                'baseFn': ->

            obj = new clazz
            obj.ownFn = ->

            eachOwn = util.eachOwn.bind util
            keys = []
            eachOwn obj, (k, v) ->
                keys.push k

            keys.should.containEql('ownFn')
            keys.should.not.containEql('baseFn')

    describe '#eachProp()', ->
        it 'should each every property of an object unless it is not enumerably', ->
            clazz = ->
            clazz.prototype = 
                'baseFn': ->
                'baseP': {}

            obj = new clazz
            obj.ownFn = ->
            obj.ownP = {}

            eachProp = util.eachProp.bind util
            keys = []
            eachProp obj, (k, v) ->
                keys.push k

            keys.should.containEql 'ownP'
            keys.should.not.containEql 'baseP'
            keys.should.not.containEql 'ownFn'
            keys.should.not.containEql 'baseFn'

    describe '#traverseChain()', ->
        it 'should traversing value chain using specify property', ->
            a = name: 'a'
            b = 
                name: 'b'
                parent : a
            c = 
                parent : b
                name: 'c'
            d = 
                parent : c
                name: 'd'

            traverseChain = util.traverseChain

            keys = []
            traverseChain d, 'parent', (parent) ->
                keys.push parent

            keys[0].should.equal c
            keys[1].should.equal b
            keys[2].should.equal a

    describe '#clone()', ->
        a =
            'name': 'Jim'
            'age': 18
            'score': 
                'math': 98
                'english': 77
        clone = util.clone

        it 'should shadow clone object', ->
            b = clone(a)

            b.should.have.property('name', 'Jim')
            b.should.have.property('age', 18)
            b.should.have.property('score', a.score)

        it 'should deep clone object', ->
            b = clone(a, 'deep')

            b.should.have.property('name', 'Jim')
            b.should.have.property('age', 18)
            b.score.should.not.equal('score', a.score)
            b.score.math.should.equal(a.score.math)

        it 'should shadow clone an array', ->
            now = new Date()
            o = {}
            array = [1, o, now]

            b = clone(array)

            b.should.not.equal(array)
            b.length.should.equal(3)
            b[0].should.equal(1)
            b[1].should.equal(o)
            b[2].should.equal(now)

        it 'should deep clone an array', ->
            now = new Date()
            o = {name: 'o'}
            array = [1, o, now]

            op = {name: 'op'}
            array.ownProp = op

            b = clone(array, 'deep')

            b.should.not.equal(array)
            b.length.should.equal(3)

            b[0].should.equal(1)

            b[1].should.not.equal(o)
            b[1].should.have.property('name', 'o')

            b[2].should.not.equal(now)
            b[2].getTime().should.equal(now.getTime())

            b.should.have.property('ownProp')
            b.ownProp.should.not.equal(op)
            b.ownProp.should.have.property('name', op.name)

    describe '#mix()', ->
        mix = util.mix
        src = 
            dollars: 8
            pounds: 9

        dest = {}

        beforeEach ->
            dest = {}

        it 'should mix source to destination', ->
            mix(dest, src)

            dest.should.have.property('dollars', 8)
            dest.should.have.property('pounds', 9)

        it 'should mix source to destination unless member be in whitelist', ->
            mix(dest, src, ['pounds'])

            dest.should.have.property('dollars')
            dest.should.not.have.property('pounds')

    describe '#merge(a, b, c, d)', ->
        it 'should merge a to b, and merge to c, and merge to d', ->
            merge = util.merge
            a = a : {}
            b = b : {}
            c = c : {}
            d = d : {}

            o = merge(a, b, c, d)
            o.should.have.property('a')
            o.should.have.property('b')
            o.should.have.property('c')
            o.should.have.property('d')

            o.should.not.eql(a)

