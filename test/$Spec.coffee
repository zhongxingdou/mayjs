# encoding: utf-8
sinon = require 'sinon'

describe '$.js', ->
    M = require("../may.js")
    M ($, $$) ->
        describe "$()", ->

            it "包装值类型", ->
                m = 
                    wrap: ->
                    __option__: 
                        supports: [Number]

                $.reg m

                $8 = $(8)

                $8.should.have.property "wrap", m.wrap


            it "包装引用类型", ->
                m = 
                    wrap1: ->
                    __option__: 
                        supports: [Array]

                $.reg m

                a = []
                $a = $(a)

                $a.should.have.property "wrap1", m.wrap1

            it "should wrap a object if its prototype wrapper registed", ->
                m = 
                    wrap2: ->
                    __option__: 
                        supports: [Array.prototype]

                $.reg m

                $a = $([])
                $a.should.have.property "wrap2", m.wrap2

            it "should wrap a object if its __interfaces__ wrapper registed", ->
                IA = {}
                IB = {}

                a = 
                    __interfaces__: [IA]
                b = 
                    __interfaces__: [IB]

                m = 
                    wrap3: ->
                    __option__:
                        supports: [IA,IB]

                $.reg m

                $a = $(a)
                $b = $(b)
                $a.should.have.property "wrap3", m.wrap3
                $b.should.have.property "wrap3", m.wrap3

            it "should not wrap the object which wrapper module not registed", ->
                m = 
                    wrap4: ->
                    __option__:
                        supports: [Array]

                $.reg m

                $a = $({})

                $a.should.not.have.property "wrap4"

            it "should wrap all of objects if that wrapper module registed", ->
                m = 
                    wrap5: ->
                    __option__:
                        supports: [Array, Number]

                $.reg m

                $a = $([])
                $n = $(8)

                $a.should.have.property "wrap5", m.wrap5
                $n.should.have.property "wrap5", m.wrap5


            it "每个M.$wrapper()都将产生新的实例", ->
                $1 = M.$wrapper()
                $2 = M.$wrapper()

                m1 = 
                    wrap6: ->
                    __option__:
                        supports: [Object]
                m2 = 
                    wrap6: ->
                    __option__:
                        supports: [Object]

                $1.$.reg m1
                $2.$.reg m2

                obj = {}
                $o1 = $1.$(obj)
                $o2 = $2.$(obj)

                $o1.should.have.property "wrap6", m1.wrap6
                $o2.should.have.property "wrap6", m2.wrap6


        describe "$$()", ->
            it "should wrap value type object", ->
                m = 
                    wrap7: ->
                    __option__:
                        supports: [Number]

                $.reg m

                $8 = $$(8)

                $8.hasOwnProperty("wrap7").should.be.ture
                $8.wrap7.should.equal(m.wrap7)

            it "should wrap reference type object", ->
                m = 
                    wrap8: ->
                    __option__:
                        supports: [Array]

                $.reg m

                a = []
                $$(a)

                a.should.have.property "wrap8", m.wrap8

        describe "$() with methodize", ->
            it "should wrap method by methodize", ->
                spy = sinon.spy()
                m = 
                    wrap9: (self) ->
                        self
                    spy: spy
                    wrapA: ->
                        this.spy()

                    __option__:
                        supports: [Object]
                        methodize: true

                $.reg m

                a = 
                    name: "name"

                $a = $(a)

                $a.wrap9().should.eql a
                $a.wrapA()
                spy.called.should.be.true

        describe "global wrap M.$() M.$$() M.$.reg()", ->
            afterEach ->
                M.$.clear()

            it "$() will using global Wrapper with registed by M.$.reg()", ->
                spy = sinon.spy()

                StringEx = 
                    twice: spy
                M.$.reg StringEx, String, {methodize: true}

                $('string').twice()

                spy.called.should.be.true

                spy.reset()

                M.$('string').twice()
                spy.called.should.be.true


            it "M.$() can't using local Wrapper which registed by $.reg()", ->
                StringEx = 
                    twice: ->

                $.reg StringEx, String, {methodize: true}

                M.$("string").should.not.have.property("twice")

