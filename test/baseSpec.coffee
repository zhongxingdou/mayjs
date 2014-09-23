# encoding: utf-8
sinon = require 'sinon'

describe 'base.js', ->
    M = require("../may.js")

    describe "BaseObj.extend(subProto)", ->
        it "should merge subProto", ->
            subProto= 
                a: {}
                b: {}

            sub = M.BaseObj.extend(subProto)

            sub.should.have.property(member) for member of  subProto

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
            baseFunc.called.should.be.true

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

            bspy.called.should.be.true
            aspy.called.should.be.true
            baseFunc.called.should.be.true

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
                ABase.should.be.type "function"

        describe "ABase", ->
            it "should have member extend()", ->
                ABase.should.have.property("extend")

        describe "new ABase()", ->
            it "should call initialize", ->
                aspy.called.should.be.true

            it "should return a instance", ->
                instance.should.not.equal null

        describe "ABase's instance", ->
            it "should link prototype M.BaseObj and M.BaseClass.prototype", ->
                M.BaseObj.isPrototypeOf(instance).should.be.true
                M.BaseClass.prototype.isPrototypeOf(instance).should.be.true

        describe "new SubClass()", ->
            it "shold call ABase.initialize", ->
                aspy.reset()
                subInstance = new SubClass()
                subInstance.should.not.equal null

                aspy.called.should.be.true
                bspy.called.should.be.true


                subInstance.Func = ->
                    this.base()

                subInstance.Func()
                aFuncSpy.called.should.be.true
                bFuncSpy.called.should.be.true
    
    describe "class include module", ->
        it "should include module", ->

            m1 = 
                p1: ->
                onIncluded: sinon.spy()

            m2 = 
                p2: ->
            
            A = M.BaseClass.extend
                modules: [m1, m2]

            A.prototype.should.have.property("p1", m1.p1)
            A.prototype.should.have.property("p2", m2.p2)

            new A()
            m1.onIncluded.called.should.be.true

            







