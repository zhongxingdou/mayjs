# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe '$.js', ->
    M = require("../may.js")
    M ($, $$) ->
        describe "$()", ->

            it "包装值类型", ->
                m = 
                    wrap: ->
                    __supports__: [Number]

                $.reg m

                $8 = $(8)

                $8.should.have.property "wrap", m.wrap


            it "包装引用类型", ->
                m = 
                    wrap: ->
                    __supports__: [Array]

                $.reg m

                a = []
                $a = $(a)

                $a.should.have.property "wrap", m.wrap

            it "should wrap a object if its prototype wrapper registed", ->
                m = 
                    wrap: ->
                    __supports__: [Array.prototype]

                $.reg m

                $a = $([])
                $a.should.have.property "wrap", m.wrap

            it "should wrap a object if its __interfaces__ wrapper registed", ->
                IA = {}
                IB = {}

                a = 
                    __interfaces__: [IA]
                b = 
                    __interfaces__: [IB]

                m = 
                    wrap: ->
                    __supports__: [IA,IB]

                $.reg m

                $a = $(a)
                $b = $(b)
                $a.should.have.property "wrap", m.wrap
                $b.should.have.property "wrap", m.wrap

            it "should not wrap the object which wrapper module not registed", ->
                m = 
                    wrap: ->
                    __supports__: [Array]

                $.reg m

                $a = $({})

                $a.should.not.have.property "wrap"

            it "should wrap all of objects if that wrapper module registed", ->
                m = 
                    wrap: ->
                    __supports__: [Array, Number]

                $.reg m

                $a = $([])
                $n = $(8)

                $a.should.have.property "wrap", m.wrap
                $n.should.have.property "wrap", m.wrap


            it "每个M.$wrapper()都将产生新的实例", ->
                $1 = M.$wrapper()
                $2 = M.$wrapper()

                m1 = 
                    wrap: ->
                    __supports__: [Object]
                m2 = 
                    wrap: ->
                    __supports__: [Object]

                $1.$.reg m1
                $2.$.reg m2

                obj = {}
                $o1 = $1.$(obj)
                $o2 = $2.$(obj)

                $o1.should.have.property "wrap", m1.wrap
                $o2.should.have.property "wrap", m2.wrap


        describe "$$()", ->
            it "should wrap value type object", ->
                m = 
                    wrap: ->
                    __supports__: [Number]

                $.reg m

                $8 = $$(8)

                assert $8.hasOwnProperty "wrap"
                assert $8.wrap == m.wrap

            it "should wrap reference type object", ->
                m = 
                    wrap: ->
                    __supports__: [Array]

                $.reg m

                a = []
                $$(a)

                a.should.have.property "wrap", m.wrap

        describe "$() with methodize", ->
            it "should wrap method by methodize", ->
                spy = sinon.spy()
                m = 
                    wrap: (self) ->
                        self
                    spy: spy
                    wrapA: ->
                        this.spy()

                    __supports__: [Object]
                    __option__:
                        methodize: true

                $.reg m

                a = 
                    name: "name"

                $a = $(a)

                $a.wrap().should.eql a
                $a.wrapA()
                assert spy.called

        describe "global wrap M.$() M.$$() M.$.reg()", ->
            afterEach ->
                M.$.clear()

            it "$() will using global Wrapper with registed by M.$.reg()", ->
                spy = sinon.spy()

                StringEx = 
                    twice: spy
                M.$.reg StringEx, String, {methodize: true}

                $('string').twice()

                assert spy.called

                spy.reset()

                M.$('string').twice()
                assert spy.called


            it "M.$() can't using local Wrapper which registed by $.reg()", ->
                StringEx = 
                    twice: ->

                $.reg StringEx, String, {methodize: true}

                M.$("string").should.not.have.property("twice")

