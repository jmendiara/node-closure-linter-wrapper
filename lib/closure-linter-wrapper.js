/*
 * closure-linter-wrapper
 * https://github.com/jmendiara/node-closure-linter-wrapper
 *
 * Copyright (c) 2013 Javier Mendiara Cañardo
 * Licensed under the MIT license.
 */

'use strict';

var exec = require('child_process').exec,
    path = require('path'),
    checkPythonCommand = 'python --version',
    fileRegex = /^\x2D{5}\s+FILE\s+:\s+([^\s]+)\s+\x2D{5}$/,
    errorRegex = /^Line\s(\d+),\sE:([\d]+):\s(.*)$/,
    abstractRegex = /^Found ([\d]+) errors, including ([\d]+) new errors, in ([\d]+) files \(([\d]+) files OK\).?$/,
    successRegex = /^([\d]+) file.*no errors found.?$/,
    skippingRegex = /^Skipping \d file\(s\)\.?$/;


function createError (code, description, info){
  return {
    code: code,
    description: description,
    info: info
  };
}

function createErrorPythonNotFound(reason, err) {
  return createError(1, reason, err);
}
function createErrorGJSLintFailed(match, fails) {
  return createError(2, 'gjslint failed', {
    fails: fails,
    total: parseInt(match[1], 10),
    newErrors: parseInt(match[2], 10),
    filesCount: parseInt(match[3], 10),
    filesOK: parseInt(match[4], 10)
  });
}

function createParseErrorUnknown(lines) {
  return createError(3, 'Parse failed', {
      lines: lines
  });
}

function createErrorExecutingGJSLint(err) {
  return createError(4, 'gjslint execution failed', err);
}

function createFailObj(match) {
  return {
    file: match[1],
    errors: []
  };
}

function createErrorObj(match){
  return {
    line: parseInt(match[1], 10),
    code: parseInt(match[2], 10),
    description: match[3]
  };
}


function createParseSuccessObj(match) {
  return {
    filesCount: parseInt(match[1],10)
  };
}

var checkPython = function checkPython(callback) {
  exec(checkPythonCommand,
      function (err, stdout, stderr) {
        if (err !== null) {
          if (err.code === 127){
            callback(createErrorPythonNotFound('Python not installed', err));
          } else {
            callback(createErrorPythonNotFound('', err));
          }
        } else {
          callback(null, stderr);
        }
      }
  );
};


//FIXME: Think better this piece of shit
var parseResult = function parseResult(lines, callback) {
  var  errors = [], i = 0, l, errBlock, match, match2;

  match = skippingRegex.exec(lines[i]);
  if(match){
    i++;
  }

  match = successRegex.exec(lines[i]);
  if(match){
    callback(null, createParseSuccessObj(match));
    return;
  }

  for(l = lines.length; i < l; i++){
    match = fileRegex.exec(lines[i]);
    if (match){
      match2 = errorRegex.exec(lines[++i]);
      errBlock = createFailObj(match);
      for (var j = i; match2 && j < lines.length;){
        errBlock.errors.push(createErrorObj(match2));
        match2 = errorRegex.exec(lines[++j]);
      }
      i = --j;
      errors.push(errBlock);
    } else {
      match = abstractRegex.exec(lines[i]);
      if(match) {
        callback(createErrorGJSLintFailed(match, errors));
        return;
      }
    }
  }
  callback(createParseErrorUnknown(lines));
  
};


function execute(program, options, callback) {
  checkPython(function (err) {
    if (err){
      callback(err);
      return;
    }
    var flags = options.flags || [],
        src = options.src || [],
        params = [],
        cmd = path.normalize('python ' +  __dirname +
            '/../tools/' + program + '.py');

    params.push(cmd);
    params.push(flags.join(' '));
    params.push(src.join(' '));

    //console.log(params.join(' '))
    exec(params.join(' '), function (err, stdout, stderr) {
      if (err && stderr !== ''){
        callback(createErrorExecutingGJSLint(stderr));
        return;
      }
      var result = stdout.split('\n');
      parseResult(result, callback);
    });
  });
}

exports.gjslint = function(options, callback) {

  execute('gjslint', options, function(err, result) {
    if (options.reporter && options.reporter.name){
      var reporter = require('./reporter/' + options.reporter.name);
      reporter.reportGJSLint(err, result, options.reporter);
    }
    callback(err, result);
  });

};

exports.fixjsstyle = function(options, callback) {
//  report('fixjsstyle', options, callback);
};

//These funcs are private. exposed only for testing.
exports.parseResult = parseResult;
exports.checkPython = checkPython;


