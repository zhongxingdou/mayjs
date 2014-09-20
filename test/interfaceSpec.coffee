# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe 'interface.js', ->
    M = require("../may.js")
    $is = M.$is;

    describe '#parseArguNames()', ->
        it 'should parse function parameter names', ->
            fn = (p1, p2, p3) ->
            names = M.parseArguNames(fn)
            names.should.have.property('length', 3)
            names.should.include('p1')
            names.should.include('p2')
            names.should.include('p3')

            fn2 = ->
            names2 = M.parseArguNames(fn2)
            names2.should.be.empty

    describe "#$is(type, object)", ->
        it "$is()检验值类型", ->
            assert $is('string', '')
            assert $is(String, '')
            assert $is('string', 'abc')

            assert $is('number', 0)
            assert $is('number', 8)
            assert $is(Number, 8)
            assert $is('number', - 1)
            assert $is('number', - 1.3)

            assert $is('boolean', true)
            assert $is('boolean', false)
            assert $is(Boolean, false)

            assert $is(undefined, null)
            assert $is(null, undefined)

            $is('boolean', undefined).should.be.false

        it "$is()检验引用类型", ->
            assert $is('function', ->)
            assert $is(Function, ->)
            assert $is(Object, ->)

            assert $is('object', {})
            assert $is(Object, {})

            assert $is(Date, new Date())

            assert $is(RegExp, /abc/)

            assert $is(Array, [])
            assert $is(Object, [])

        it "$is()检验null", ->
            assert $is('object', null)

            assert $is(null, null)

            $is(null, undefined).should.be.true
            $is(null, 8).should.be.false
            $is(null, {}).should.be.false

        it "$is()检验undefined", ->
            assert $is('undefined', undefined)
            assert $is(undefined, undefined)

            $is('undefined', null).should.be.true

            a = {};
            assert $is('undefined', a.b)

            t = (a, b) -> 
                assert $is(undefined, b)

            t(8);

        it "$is()检验原型链", ->
            A = ->
                
            B = ->
            B.prototype = new A();
            B.prototype.constructor = B();

            assert $is(A, new B())
            assert $is(B.prototype, new B())

        it "$is(type, o1, o2, o3)", ->
            assert $is('string', "", "a", "b")
            $is('string', "", "a", 8).should.be.false

    describe "#$func(arguTypes, fn)", ->
        it "should add property __argu__types__ to fn", ->
            arguType = [String, Number]
            fn  = (name, age) ->

            M.$func(arguType, fn)

            fn.should.have.property("__argu_types__")

            types = fn.__argu_types__
            types[0].name.should.eql "name"
            types[1].name.should.eql "age"

            types[0].type.should.eql arguType[0]
            types[1].type.should.eql arguType[1]

    describe "#$interface(define, base)", ->
        it "should return a new object that prototype is Interface", ->
            a = M.$interface({})
            assert M.Interface.isPrototypeOf a

        it "should return a new object that prototype is given base", ->
            base = M.$interface()
            define = 
                t1 : String
                t2 : Number

            a = M.$interface(define, base)

            assert base.isPrototypeOf a
            a.should.have.property "t1", define.t1
            a.should.have.property "t2", define.t2

    describe "#$support(protocol, object)", ->
        o = 
            name: "jim"
            age: 18
            sayHello: ->

        IMan = M.$interface(
                name: "string"
                age: "number"
                sayHello: "function"
            )

        it "should return true when object supported protocol", ->
            assert M.$support(IMan, o)

        it "should return true when the count of object members more than the interface's", ->
            o.score = 90
            assert M.$support(IMan, o)

        it "should return false when the count of object members less than the interface's", ->
            IMan.height = "number"
            M.$support(IMan, o).should.be.false

        it "should return true when the protocol included in object.__interfaces__", ->
            a = 
                __interfaces__: [IMan]

            assert M.$support(IMan, a)

        it "should be same to function define when the protocol method member defined be Array format", ->
            IA = M.$interface(
                    sayHello: ["string"]
                )

            a = { sayHello: -> }

            assert M.$support(IA, a)

        it "should be same to Interface when the protocol be a pure object", ->
            IA = { sayHello: "function"}

            a = { sayHello: -> }

            assert M.$support(IA, a)

    describe "$implement(protocol, object)", ->
        it "should add protocol to object.__interfaces__ if the object supported that", ->
            o = {}
            IA = {}

            M.$implement(IA, o)

            o.__interfaces__.should.include IA

        it "should throw error when the object not supported protocol", ->
            o = {}

            IA = {m: String}

            assert.throws(-> 
                M.$implement(IA, o)
            )
            
    describe "$checkArgu(Type1, Type2)", ->
        fn = (name, age) ->
            return M.$checkArgu("string", "number")

        it "should return true when the arguments valid", ->
            fn("jim", 18).should.be.true

        it "should return false when the arguments invalid", ->
            fn("jim", "18").should.be.false

        it "should pass by any value when the check type is defined be undefined", ->
            fn2 = (name, age) ->
                return M.$checkArgu("string", undefined, "number")

            fn2("jim", "xx", 18).should.be.true
            fn2("jim", null, 19).should.be.true

    describe "$check(express)", ->
        it "should throw error if express equals false", ->
            assert.throws -> 
                M.$check(false)

        it "should not throw error if express not equals false", ->
            assert.doesNotThrow -> 
                M.$check(null)
                M.$check("")
                M.$check(true)
                M.$check(undefined)
                M.$check(0)












