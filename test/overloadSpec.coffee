# encoding: utf-8
sinon = require 'sinon'

describe "overload.js", ->
  M = require("../may.js")
  $overload = M.$overload
  $func = M.$func

  it "should find out the overwrite method that parameters count equals given", ->
    spy1 = sinon.spy()
    fn1 = $func ["string"], (name) ->
      spy1(name)

    spy2 = sinon.spy()
    fn2 = $func ["string", "string"], (name, interest) ->
      spy2(name, interest)

    fn = $overload(fn1).overload(fn2)

    p1 = "jim"
    fn(p1)

    spy1.called.should.be.true

    p2 = "jim"
    p3 = "pingpang"
    fn(p2, p3)
    
    spy2.called.should.be.true

  it "should find out the overwrite method that parameters supported given", ->
    spy1 = sinon.spy()
    fn1 = $func ["string"], (name) ->
      spy1(name)

    spy2 = sinon.spy()
    fn2 = $func ["number"], (age) ->
      spy2(age)

    fn = $overload(fn1).overload(fn2)

    p1 = "jim"
    fn(p1)
    spy1.called.should.be.true

    p2 = 21
    fn(p2)
    
    spy2.called.should.be.true

  it "shoule use interface declare parameters type", ->
    spy1 = sinon.spy()
    fn1 = $func [
          name: "string",
          age: "number"
      ], (option) ->
        spy1(option)

    fn = $overload(fn1)

    p1 = 
      name: "xingdou"
      age: 30

    fn(p1)
    spy1.called.should.be.true

    p2 = 
      name: "xingdou"
      age: "30"

    spy1.reset()
    fn(p2)
    spy1.called.should.be.false
