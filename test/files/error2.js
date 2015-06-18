
var sinon = require('sinon'),
    chai = require('chai');

global.expect = chai.expect;

beforeEach(function(){
    global.sinon = sinon.sandbox.create();
});

afterEach(function(){
  global.sinon.restore();
});
