# encoding: utf-8
describe 'interface.js', ->
    M = require("../may.js")
    $is = M.$is
    $hasProto = M.$hasProto

    describe '#parseArguNames()', ->
        it 'should parse function parameter names', ->
            fn = (p1, p2, p3) ->
            names = M.util.parseArguNames(fn)
            names.should.have.property('length', 3)
            names.should.containEql('p1')
            names.should.containEql('p2')
            names.should.containEql('p3')

            fn2 = ->
            names2 = M.util.parseArguNames(fn2)
            names2.should.be.empty

    describe "#$is(type, object)", ->
        it "$is()检验值类型", ->
            $is('string', '').should.be.true
            $is(String, '').should.be.true
            $is('string', 'abc').should.be.true

            $is('number', 0).should.be.true
            $is('number', 8).should.be.true
            $is(Number, 8).should.be.true
            $is('number', - 1).should.be.true
            $is('number', - 1.3).should.be.true

            $is('boolean', true).should.be.true
            $is('boolean', false).should.be.true
            $is(Boolean, false).should.be.true

            $is(undefined, null).should.be.true
            $is(null, undefined).should.be.true

            $is('boolean', undefined).should.be.false

        it "$isA()检验引用类型", ->
            $is(Function, ->).should.be.true
            $is(Object, ->).should.be.true

            $is(Object, {}).should.be.true

            $is(Date, new Date()).should.be.true

            $is(RegExp, /abc/).should.be.true

            $is(Array, []).should.be.true
            $is(Object, []).should.be.true

        it "$is()检验null", ->
            $is(null, null).should.be.true

            $is(null, undefined).should.be.true
            $is(null, 8).should.be.false
            $is(null, {}).should.be.false

        it "$is()检验undefined", ->
            $is('undefined', undefined).should.be.true
            $is(undefined, undefined).should.be.true

            $is('undefined', null).should.be.true

            a = {};
            $is('undefined', a.b).should.be.true

            t = (a, b) -> 
                $is(undefined, b).should.be.true

            t(8);

        it "$hasProto()检验原型链", ->
            A = ->
                
            B = ->
            B.prototype = new A();
            $hasProto(B.prototype, new B()).should.be.true

            C = ->
            C.prototype = new B();
            $hasProto(B.prototype, new C()).should.be.true

            $hasProto(Array.prototype, []).should.be.true

        it "$is(type, o1, o2, o3)", ->
            $is('string', "", "a", "b").should.be.true
            $is('string', "", "a", 8).should.be.false

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

    describe "#$interface(define, base)", ->
        it "should return a new object that prototype is Interface", ->
            a = M.$interface({})
            M.Interface.isPrototypeOf(a).should.be.true

        it "should return a new object that prototype is given base", ->
            base = M.$interface()
            define = 
                t1 : String
                t2 : Number

            a = M.$interface(define, base)

            base.isPrototypeOf(a).should.be.true
            a.should.have.property "t1", define.t1
            a.should.have.property "t2", define.t2

    describe "#$support(protocol, object)", ->
        o = 
            name: "jim"
            age: 18
            sayHello: ->

        IMan = M.$interface(
                name: "string"
                age: "number"
                sayHello: "function"
            )

        it "should return true when object supported protocol", ->
            M.$support(IMan, o).should.be.true

        it "should return true when the count of object members more than the interface's", ->
            o.score = 90
            M.$support(IMan, o).should.be.true

        it "should return false when the count of object members less than the interface's", ->
            IMan.height = "number"
            M.$support(IMan, o).should.be.false

        it "should return true when the protocol included in object.__interfaces__", ->
            a = 
                __interfaces__: [IMan]

            M.$support(IMan, a).should.be.true

        it "should be same to function define when the protocol method member defined be Array format", ->
            IA = M.$interface(
                    sayHello: ["string"]
                )

            a = { sayHello: -> }

            M.$support(IA, a).should.be.true

        it "should be same to Interface when the protocol be a pure object", ->
            IA = { sayHello: "function"}

            a = { sayHello: -> }

            M.$support(IA, a).should.be.true

    describe "$implement(protocol, object)", ->
        it "should add protocol to object.__interfaces__ if the object supported that", ->
            o = {}
            IA = {}

            M.$implement(IA, o)

            o.__interfaces__.should.containEql IA

        it "should throw error when the object not supported protocol", ->
            o = {}

            IA = {m: String}

            (-> 
                M.$implement(IA, o)
            ).should.throw
            
    describe "$check(express)", ->
        it "should throw error if express equals false", ->
            (-> 
                M.$check(false)).should.throw

        it "should not throw error if express not equals false", ->
            (-> 
                M.$check(null)
                M.$check("")
                M.$check(true)
                M.$check(undefined)
                M.$check(0)).should.not.throw












