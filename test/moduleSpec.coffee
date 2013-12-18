# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe 'module.js', ->
    M = require("../may.js")

    describe '$part(obj)', ->
        it "should return given object self", ->
            obj = {}
            M.$part(obj).should.eql obj

    describe '$include(obj, part, option)', ->
        it "should merge part to obj", ->
            m =  
                name: "jim"
                age: 8

            o = {}

            M.$include(o, m)

            o.should.have.property(member, m[member]) for member of m

        it "should merge methodized method to obj when option.methodize be true", ->
            sayHello =  (man) ->
                    "hello " + man.name
            m = 
                sayHello: sayHello

            o = {name: "jim"}

            M.$include(o, m, 
                methodize: true
            )

            #check methodized
            o.sayHello().should.eql sayHello(o) 

        it "should call the onincluded with obj when included if the part own it", ->
            spy = sinon.spy()

            m = 
                onIncluded: spy
            o = {}

            M.$include(o, m)

            assert spy.calledOn o
            assert spy.calledWith o

        it "should call the delegate onincluded with given option.context when included if the part own it", ->
            spy = sinon.spy()

            m = 
                onIncluded: spy
            o = {}

            a = {}

            M.$include(o, m, 
                context: a 
            )

            assert spy.calledOn o
            assert spy.calledWith a


