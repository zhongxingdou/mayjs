Mayjs = require("./may.js")

Mayjs (M) ->
	eval(M())

	Duck = $class
		quack: ->
			return "Quack quack!"

	console.info(new Duck().quack())
