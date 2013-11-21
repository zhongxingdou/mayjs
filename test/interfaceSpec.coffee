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
            assert $is('string', 'abc')

            assert $is('number', 0)
            assert $is('number', 8)
            assert $is('number', - 1)
            assert $is('number', - 1.3)

            assert $is('boolean', true)
            assert $is('boolean', false)

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

            $is(null, undefined).should.be.false
            $is(null, 8).should.be.false
            $is(null, {}).should.be.false

        it "$is()检验undefined", ->
            assert $is('undefined', undefined)
            assert $is(undefined, undefined)

            $is('undefined', null).should.be.false

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


