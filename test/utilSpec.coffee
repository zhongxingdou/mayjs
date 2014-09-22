# encoding: utf-8
sinon = require 'sinon'
describe 'M.util', ->
    util = require("../may.js").util

    describe '#toObject()', ->
        it 'should convert value type variable to reference variable', ->
            (typeof(util.toObject("string")) == 'object').should.be.true
            String.prototype.isPrototypeOf(util.toObject("string")).should.be.true

            (typeof(util.toObject(8)) == 'object').should.be.true
            Number.prototype.isPrototypeOf(util.toObject(8)).should.be.true

            (typeof(util.toObject(true)) == 'object').should.be.true
            Boolean.prototype.isPrototypeOf(util.toObject(true)).should.be.true

    describe '#fn()', ->
        it 'should call function which present fn()', ->
            i = 0
            max = 100
            fn = ->
                return if i == max 
                i++
                util.fn()

            fn()

            i.should.eql max

    describe '#parseArray()', ->
        it 'should convert an array like list object to real Array', ->
            hello = 'hello'
            array = util.parseArray(hello)

            array.should.be.an.instanceof(Array)

            array.should.have.length hello.length

            array.forEach (char, i) ->
               hello[i].should.eql char 

    describe '#enumeration()', ->
        it 'should create an enumeration', ->
            gender = util.enumeration("male", "female")

            gender.should.have.property("male")
            gender.should.have.property("female")

            (gender.male != gender.famele).should.be.true

            gender.male.should.be.type('object')
            gender.female.should.be.type('object')

    describe "#methodize(fn, firstParam)", ->
        it 'should return a function that call given fn always with given parameter as first parameter', ->
            obj = {}

            fn = (param1) ->
                param1

            method = util.methodize(fn, obj)

            method().should.eql obj

    describe "#methodize(fn, obj, getFirstParam)", ->
        it 'should return a function that call given fn always with result of obj.getFirstParam() as first parameter ', ->
            obj = {member: {}}

            fn = (param1) ->
                param1

            getFirstParam = (obj) ->
                obj.member

            method = util.methodize(fn, obj, getFirstParam)

            method().should.eql obj.member

    describe '#overwrite(obj, funcName, overwriter)', ->
        fn = ->
            fn.called = true
            fn.calledThis = this

        obj = { fn: fn }

        overwriter = (fn) ->
            fn()

        util.overwrite(obj, "fn", overwriter)
        newFn = obj.fn

        it "should generat an function to overwrite method of object", ->
            newFn.should.not.eql fn
            newFn.should.be.an.instanceOf Function
            newFn.should.not.eql overwriter 

        it "should call given overwriter when new method of object call", ->
            args = [1,2]
            obj.fn()

            fn.called.should.be.true
            fn.calledThis.should.equal obj

    describe '#dsl(obj, memberFnNames)', ->
        obj = 
            fn1: ->
            fn2: ->

        eval(util.dsl(obj))

        it "should localiz members of given object", ->
            obj.fn1.should.eql(fn1)
            obj.fn2.should.eql(fn2)

    describe '#run(fn)', ->
        spy = sinon.spy()

        it "should call given function", ->
            util.run(spy)

            spy.called.should.be.true

        it "should call given function with given arguments", ->
            argu = {}
            argu2 = {}

            util.run(spy, argu, argu2)

            spy.calledWith(argu, argu2).should.be.true


