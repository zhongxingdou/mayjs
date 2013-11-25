# encoding: utf-8
sinon = require 'sinon'
assert = require 'assert'

describe 'base.js', ->
    M = require("../may.js")

    describe "BaseProto.extend(subProtoDefine)", ->
        it "should merge subProtoDefine", ->
            subProtoDefine = 
                a: {}
                b: {}

            sub = M.BaseProto.extend(subProtoDefine)

            sub.should.have.property(member) for member of  subProtoDefine

        it "should call initialize when defined", ->
            initialize = sinon.spy()

            subProtoDefine = 
                initialize: initialize

            sub = M.BaseProto.extend(subProtoDefine)

            assert initialize.calledOn(sub)




