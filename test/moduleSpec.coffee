# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe 'module.js', ->
    M = require("../may.js")

    describe '$module(obj)', ->
        it "should return given object itself", ->
            obj = {}
            M.$module(obj).should.eql obj

    describe '$include(obj, module, option)', ->
        it "should merge module to obj", ->
            m =  
                name: "jim"
                age: 8

            o = {}

            M.$include(o, m)

            o.should.have.property(member, m[member]) for member of m

        it "should merge methodized method to obj if option.methodize set be true", ->
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

        it "should call the onIncluded() after included", ->
            spy = sinon.spy()

            m = 
                onIncluded: spy
            o = {}

            M.$include(o, m)

            assert spy.calledOn o
            assert spy.calledWith o

        it "should call the onIncluded() on passing binding context after included", ->
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

        it "should not merge specific member, such as init method, meta member which name starts with __, onIncluded callback", ->
            m = 
                onIncluded: ->
                __interface__: []
                init: ->
                member1: {}

            o = {}
            M.$include(o, m)

            o.should.not.have.property(member) for member in ["onIncluded", "__interface__", "init"]
            o.should.have.property("member1")

        it "should implementation all of interfaces from module", ->
            interfaces = [{}, {}]

            m = 
                __interfaces__: interfaces 

            o = {}

            M.$include(o, m)

            o.should.have.property("__interfaces__")
            o.__interfaces__.should.contain inter for inter in interfaces





