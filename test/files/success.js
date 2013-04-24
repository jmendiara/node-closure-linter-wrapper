
var sinon = require('sinon'),
    chai = require('chai');
/**
 *
 * @type {Function}
 */
global.expect = chai.expect;

beforeEach(function() {
  global.sinon = sinon.sandbox.create();
});

afterEach(function() {
  global.sinon.restore();
});
