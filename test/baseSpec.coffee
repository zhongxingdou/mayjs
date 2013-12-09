# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe 'base.js', ->
    M = require("../may.js")

    describe "BaseObj.extend(subProto)", ->
        it "should merge subProto", ->
            subProto= 
                a: {}
                b: {}

            sub = M.BaseObj.extend(subProto)

            sub.should.have.property(member) for member of  subProto

        it "should call initialize if defined", ->
            initialize = sinon.spy()

            AnimalProto = 
                initialize: initialize

            Animal = M.BaseObj.extend(AnimalProto)

            Monkey = Animal.extend()

            assert initialize.calledOn Monkey

    describe "BaseObj.base()", ->
        baseFunc = base = a = b = aspy = null

        beforeEach ->
            baseFunc = sinon.spy()

            base = M.BaseObj.extend
                func: baseFunc

            aspy = sinon.spy()
            a = base.extend
                func: ->
                    this.base()
                    aspy()


        it "should call the same name function of base", ->
            a.func()
            assert baseFunc.called

        it "should call the same name function of base and base.base", ->
            bspy = sinon.spy()
            b = a.extend
                func: ->
                    this.base()
                    bspy()

            c = b.extend
                func: ->
                    this.base()

            c.func()

            assert bspy.called
            assert aspy.called
            assert baseFunc.called

    describe "BaseClass.extend(classDefine)", ->
        aspy = sinon.spy()
        aFuncSpy  = sinon.spy()
        ABase = M.BaseClass.extend
            initialize: ->
                this.base()
                aspy()
            Func: aFuncSpy

        instance = new ABase()

        bspy = sinon.spy()
        bFuncSpy = sinon.spy()
        SubClass = ABase.extend
            initialize: ->
                this.base()
                bspy()
            Func: ->
                this.base()
                bFuncSpy()


        describe "BaseClass.extend", ->
            it "should return a Class", ->
                assert typeof(ABase) == "function"

        describe "ABase", ->
            it "should have member extend()", ->
                ABase.should.have.property("extend")

        describe "new ABase()", ->
            it "should call initialize", ->
                assert aspy.called

            it "should return a instance", ->
                assert instance != null

        describe "ABase's instance", ->
            it "should link prototype M.BaseObj and M.BaseClass.prototype", ->
                assert M.BaseObj.isPrototypeOf instance 
                assert M.BaseClass.prototype.isPrototypeOf instance

        describe "new SubClass()", ->
            it "shold call ABase.initialize", ->
                aspy.reset()
                subInstance = new SubClass()
                assert subInstance != null

                assert aspy.called
                assert bspy.called


                subInstance.Func = ->
                    this.base()

                subInstance.Func()
                assert aFuncSpy.called
                assert bFuncSpy.called


