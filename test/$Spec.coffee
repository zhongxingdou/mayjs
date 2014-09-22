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
                    wrap: ->
                    __option__: 
                        supports: [Array]

                $.reg m

                a = []
                $a = $(a)

                $a.should.have.property "wrap", m.wrap

            it "should wrap a object if its prototype wrapper registed", ->
                m = 
                    wrap: ->
                    __option__: 
                        supports: [Array.prototype]

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
                    __option__:
                        supports: [IA,IB]

                $.reg m

                $a = $(a)
                $b = $(b)
                $a.should.have.property "wrap", m.wrap
                $b.should.have.property "wrap", m.wrap

            it "should not wrap the object which wrapper module not registed", ->
                m = 
                    wrap: ->
                    __option__:
                        supports: [Array]

                $.reg m

                $a = $({})

                $a.should.not.have.property "wrap"

            it "should wrap all of objects if that wrapper module registed", ->
                m = 
                    wrap: ->
                    __option__:
                        supports: [Array, Number]

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
                    __option__:
                        supports: [Object]
                m2 = 
                    wrap: ->
                    __option__:
                        supports: [Object]

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
                    __option__:
                        supports: [Number]

                $.reg m

                $8 = $$(8)

                # $8.should.have.ownProperty("wrap").equal(m.wrap)

            it "should wrap reference type object", ->
                m = 
                    wrap: ->
                    __option__:
                        supports: [Array]

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

                    __option__:
                        supports: [Object]
                        methodize: true

                $.reg m

                a = 
                    name: "name"

                $a = $(a)

                $a.wrap().should.eql a
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

