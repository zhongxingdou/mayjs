# encoding: utf-8
sinon = require 'sinon'

describe 'base.js', ->
    M = require("../may.js")

    shouldCalled = (spy) ->
        spy.called.should.be.true

    describe "BaseObj.extend(subProto)", ->
        it "should merge subProto", ->
            subProto= 
                a: {}
                b: {}

            sub = M.BaseObj.extend(subProto)

            sub.should.have.property(member) for member of  subProto

        it "should invoke onExtend() callback", ->
            base = M.BaseObj.extend
                onExtend: sinon.spy()

            base.extend({})

            shouldCalled base.onExtend


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
            shouldCalled baseFunc

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

            shouldCalled bspy
            shouldCalled aspy
            shouldCalled baseFunc

    describe "BaseClass.extend(classDefine)", ->
        aspy = sinon.spy()
        aFuncSpy  = sinon.spy()
        ABase = M.BaseClass.extend
            initialize: ->
                this.base()
                aspy()
            Func: aFuncSpy

        ABase.onExtend = sinon.spy()

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
                ABase.should.be.type "function"

            it  "should invoke onExtend callback", ->
                shouldCalled ABase.onExtend

        describe "ABase", ->
            it "should have member extend()", ->
                ABase.should.have.property("extend")

            it "should have __initObservers__", ->
                ABase.should.have.property("__initObservers__")
                ABase.__initObservers__.should.be.empty
                ABase.__initObservers__.should.not.equal(M.BaseClass.__initObservers__)

        describe "new ABase()", ->
            it "should call initialize", ->
                shouldCalled aspy

            it "should return a instance", ->
                instance.should.not.equal null

        describe "ABase's instance", ->
            it "should link prototype M.BaseObj and M.BaseClass.prototype", ->
                M.BaseObj.isPrototypeOf(instance).should.be.true
                M.BaseClass.prototype.isPrototypeOf(instance).should.be.true

        describe "new SubClass()", ->
            it "should call ABase.initialize", ->
                aspy.reset()
                subInstance = new SubClass()
                subInstance.should.not.equal null

                shouldCalled aspy
                shouldCalled bspy


                subInstance.Func = ->
                    this.base()

                subInstance.Func()
                shouldCalled aFuncSpy
                shouldCalled bFuncSpy


    describe "class include module", ->
        m1 = 
            p1: ->
            onIncluded: sinon.spy()

        m2 = 
            p2: ->
        
        A = M.BaseClass.extend
            modules: [m1, m2]

        it "should include module", ->

            A.prototype.should.have.property("p1", m1.p1)
            A.prototype.should.have.property("p2", m2.p2)

            a = new A()
            shouldCalled m1.onIncluded

        it "should do not copy modules to prototype of new class", ->

            A.prototype.should.not.have.property("modules")

    describe "onInitialize", ->
        spy = sinon.spy()
        A = M.BaseClass.extend({})
        A.onInitialize ->
            spy(this)
            
        a = new A()
        spy.calledWith(a).should.be.true









