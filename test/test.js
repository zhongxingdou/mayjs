(function() {
  var Mayjs, assert;

  assert = require("assert");

  Mayjs = require('../may');

  eval(Mayjs.DSL());

  describe('Array', function() {
    return describe('#indexOf()', function() {
      return it('should return -1 when the value is not present', function() {
        return assert.equal(-1, [1, 2, 3].indexOf(5));
      });
    });
  });

  describe('Mayjs', function() {
    return describe('#$interface()', function() {
      return it('return a interface object', function() {
        return $interface().should.not.equal(null);
      });
    });
  });

}).call(this);
