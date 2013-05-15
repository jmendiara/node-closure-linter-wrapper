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
    it('should be able to parse a successful run', function(done) {
      var successText = fs.readFileSync('test/files/success.txt', 'utf8');

      closure_linter.parseResult(successText, function(err, result) {
        expect(err).to.be.null;
        expect(result).to.have.property('filesCount').to.be.equal(2);
        done();
      });
    });

    it('should be able to parse successful run with excludes', function(done) {
      var successText = fs.readFileSync('test/files/exclude.txt', 'utf8');

      closure_linter.parseResult(successText, function(err, result) {
        expect(err).to.be.null;
        expect(result).to.have.property('filesCount').to.be.equal(1);
        done();
      });
    });

    it('should be able to parse abstract of wrong run', function(done) {
      var successText = fs.readFileSync('test/files/error.txt', 'utf8');

      closure_linter.parseResult(successText, function (err, result){
        expect(result).to.be.undefined;
        expect(err).to.have.property('code').to.be.equal(2);

        var data = err.info;
        expect(data).to.have.property('filesCount').to.be.equal(2);
        expect(data).to.have.property('total').to.be.equal(3);
        expect(data).to.have.property('newErrors').to.be.equal(0);
        expect(data).to.have.property('filesOK').to.be.equal(0);
        done();
      });
    });

    it('should be able to parse details of wrong run', function(done) {
      var successText = fs.readFileSync('test/files/error.txt', 'utf8');

      closure_linter.parseResult(successText, function(err, result){
        expect(result).to.be.undefined;
        expect(err).to.have.property('code').to.be.equal(2);
        expect(err).to.have.property('info').to.have.property('fails');

        var fails = err.info.fails;
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
        done();
      });
    });
  });

  describe('gjslint', function () {
    var gjslint = closure_linter.gjslint;

    it('should lint good code', function(done) {
      gjslint({
        src: ['test/files/success.js'],
        reporter: {
          name: 'console'
        }
      }, function(err) {
        expect(err).to.be.null;
        done();
      });
    });

    it('should lint bad code', function(done) {
      gjslint({
        src: ['test/files/error.js'],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err.code).to.be.equal(2);
        expect(err.info.total).to.be.equal(3);
        done();
      });
    });

    it('should lint bad code ignoring errors', function(done) {
      gjslint({
        flags: ['--ignore_errors 2,220'],
        src: ['test/files/error.js'],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err).to.be.null;
        done();
      });
    });

    it('should lint bad code ignoring errors with the new supported flag', function(done) {
      gjslint({
        flags: ['--disable 2,220'],
        src: ['test/files/error.js'],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err).to.be.null;
        done();
      });
    });

    it('should lint bad code ignoring jsdoc', function(done) {
      gjslint({
        flags: ['--nojsdoc'],
        // this flag is not working in 2.3.10. Using patched version for BW
        // compatibility
        // https://code.google.com/p/closure-linter/issues/detail?id=64
        //flags: ['--disable 220'],
        src: ['test/files/error.js'],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err.code).to.be.equal(2);
        expect(err.info.total).to.be.equal(2);
        done();
      });
    });

    it('should lint bad code with dir and excludes', function(done) {
      gjslint({
        flags: [
          '-r test/files/',
          '-x test/files/error.js'
        ],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err).to.be.null;
        done();
      });
    });

    it('should lint good code with dir and excludes', function(done) {
      gjslint({
        flags: [
          '-r test/files/',
          '-x test/files/success.js'
        ],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err.code).to.be.equal(2);
        expect(err.info.total).to.be.equal(3);
        expect(err.info.filesCount).to.be.equal(1);
        done();
      });
    });

    it('should fail gracefully with no valid flags', function(done) {
      gjslint({
        flags: [
          '-k'
        ],
        src: ['test/files/error.js'],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err.code).to.be.equal(4);
        done();
      });
    });

    it('should fail gracefully with no valid option', function(done) {
      gjslint({
        flags: [
          '-sd'
        ],
        src: ['test/files/error.js'],
        reporter: {
          name: 'console'
        }
      }, function(err, result) {
        expect(err.code).to.be.equal(4);
        done();
      });
    });
  });
});
