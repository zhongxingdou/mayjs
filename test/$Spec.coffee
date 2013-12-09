# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe '$.js', ->
    M = require("../may.js")

    describe "$()", ->
        $ = M.$()

        it "包装值类型", ->
            m = 
                wrap: ->
                __this__: Number

            $.use m

            $8 = $(8)

            $8.should.have.property "wrap", m.wrap


        it "包装引用类型", ->
            m = 
                wrap: ->
                __this__: Array

            $.use m

            a = []
            $a = $(a)

            $a.should.have.property "wrap", m.wrap

        it "每个M.$()都将产生新的实例", ->
            $1 = M.$()
            $2 = M.$()

            m1 = 
                wrap: ->
                __this__: Object
            m2 = 
                wrap: ->
                __this__: Object

            $1.use m1
            $2.use m2

            obj = {}
            $o1 = $1(obj)
            $o2 = $2(obj)

            $o1.should.have.property "wrap", m1.wrap
            $o2.should.have.property "wrap", m2.wrap


    describe "$$()", ->
        $ = M.$()
        $$ = $.$$

        it "should wrap value type object", ->
            m = 
                wrap: ->
                __this__: Number

            $.use m

            $8 = $$(8)

            assert $8.hasOwnProperty "wrap"
            assert $8.wrap == m.wrap

        it "should wrap reference type object", ->
            m = 
                wrap: ->
                __this__: Array

            $.use m

            a = []
            $$(a)

            a.should.have.property "wrap", m.wrap

    describe "$(m, {methodize: true})", ->
        $ = M.$()

        it "should wrap method by methodize", ->
            spy = sinon.spy()
            m = 
                wrap: (self) ->
                    self
                spy: spy
                wrapA: ->
                    this.spy()

                __this__: Object

            $.use m, {methodize: true}

            a = 
                name: "name"

            $a = $(a)

            $a.wrap().should.eql a
            $a.wrapA()
            assert spy.called


