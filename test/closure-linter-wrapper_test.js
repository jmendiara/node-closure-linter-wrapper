'use strict';

var proxyquire = require('proxyquire'),
    closure_linter = require('../lib/closure-linter-wrapper'),
    fs = require('fs');


describe('Closure Linter Wrapper', function() {
  it('should have gjslint exposed', function() {
    expect(closure_linter.gjslint).to.be.a('function');
  });

  it('should have fixjstyle exposed', function() {
    expect(closure_linter.fixjsstyle).to.be.a('function');
  });

  it('should be able to detect python', function(done) {
     closure_linter.checkPython(function(err) {
       expect(err).to.be.null;
       done();
     });
  });

  describe('gjslint parser', function() {
    it('should be able to parse a successful run', function() {
      var successText = fs.readFileSync('test/files/success.txt', 'utf8')
          .split('\n');

      var result = closure_linter.parseResult(successText);
      expect(result).to.have.property('success').to.be.true;
      expect(result).to.have.property('data').
          to.have.property('filesCount').to.be.equal(2);

    });

    it('should be able to parse abstract of wrong run', function() {
      var successText = fs.readFileSync('test/files/error.txt', 'utf8')
          .split('\n');

      var result = closure_linter.parseResult(successText);
      expect(result).to.have.property('success').to.be.false;
      expect(result).to.have.property('data');

      var data = result.data;
      expect(data).to.have.property('filesCount').to.be.equal(2);
      expect(data).to.have.property('total').to.be.equal(3);
      expect(data).to.have.property('newErrors').to.be.equal(0);
      expect(data).to.have.property('filesOK').to.be.equal(0);

    });

    it('should be able to parse details of wrong run', function() {
      var successText = fs.readFileSync('test/files/error.txt', 'utf8')
          .split('\n');

      var result = closure_linter.parseResult(successText);
      expect(result).to.have.property('success').to.be.false;
      expect(result).to.have.property('data').to.have.property('fails');

      var fails = result.data.fails;
      expect(fails).to.have.length(2);

      expect(fails[0]).to.have.property('file').to.be.equal('/Users/foo.js');
      expect(fails[0]).to.have.property('errors').to.have.length(2);

      var errors = fails[0].errors;
      expect(errors[0]).to.have.property('line').to.be.equal(3);
      expect(errors[0]).to.have.property('code').to.be.equal(220);
      expect(errors[0]).to.have.property('description').to.be.equal(
          'No docs found for member \'module.exports\''
      );

      expect(errors[1]).to.have.property('line').to.be.equal(5);
      expect(errors[1]).to.have.property('code').to.be.equal(20);
      expect(errors[1]).to.have.property('description').to.be.equal(
          'Something'
      );

      expect(fails[1]).to.have.property('file').to.be.equal('/Users/bar.js');
      expect(fails[1]).to.have.property('errors').to.have.length(1);

      errors = fails[1].errors;
      expect(errors[0]).to.have.property('line').to.be.equal(4);
      expect(errors[0]).to.have.property('code').to.be.equal(220);
      expect(errors[0]).to.have.property('description').to.be.equal(
          'No docs found for member \'global.expect\''
      );
    });
  });

  describe('gjslint', function () {
    var gjslint = closure_linter.gjslint;

    it('should lint code', function(done) {
       gjslint({params: ['', 'mocha-globals.js']}, function(err, result) {
         expect(err).to.be.null;
         expect(result).to.have.property('success').to.be.true;
         done();
       });
    });


  });
});
