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
    StreamSplitter = require("stream-splitter"),
    fileRegex = /^\x2D{5}\s+FILE\s+:\s+([^\s]+)\s+\x2D{5}$/,
    errorRegex = /^Line\s(\d+),\sE:([\d]+):\s(.*)$/,
    abstractRegex = /^Found ([\d]+) errors, including ([\d]+) new errors, in ([\d]+) files \(([\d]+) files OK\).?$/,
    successRegex = /^([\d]+) file.*no errors found.?$/;


var checkPython = function checkPython(callback) {
  exec(checkPythonCommand,
    function (err, stdout, stderr) {
      if (err !== null) {
        if (err.code === 127){
          callback('Python not installed');
        } else {
          callback(err);
        }
      } else {
        callback(null, stderr);
      }
    }
  );
};

function createErrorObj(match) {
  return {file: match[1], errors: []};
}

function createSingleErrorObj(match){
  return {
    line: parseInt(match[1], 10),
    code: parseInt(match[2], 10),
    description: match[3]
  };
}

function createErrorAbstractObj(match, errors) {
  return {
    fails: errors,
    total: parseInt(match[1], 10),
    newErrors: parseInt(match[2], 10),
    filesCount: parseInt(match[3], 10),
    filesOK: parseInt(match[4], 10)
  };
}


function createSuccessAbstractObj(match) {
  return {
    filesCount: parseInt(match[1],10)
  };
}

function createResultObj(success, data) {
  return {
    success: success,
    data: data
  };
}

//FIXME: Think better this piece of shit
var parseResult = function parseResult(lines) {
  var  errors = [], i, l, errBlock, match, match2;

  match = successRegex.exec(lines[0]);
  if(match){
    return createResultObj(true, createSuccessAbstractObj(match));
  }

  for(i = 0, l = lines.length; i < l; i++){
    match = fileRegex.exec(lines[i]);
    if (match){
      match2 = errorRegex.exec(lines[++i]);
      errBlock = createErrorObj(match);
      for (var j = i; match2 && j < lines.length;){
        errBlock.errors.push(createSingleErrorObj(match2));
        match2 = errorRegex.exec(lines[++j]);
      }
      i = --j;
      errors.push(errBlock);
    } else {
      match = abstractRegex.exec(lines[i]);
      if(match) {
        return createResultObj(false, createErrorAbstractObj(match, errors));
      }
    }
  }
  return null;
};


function execute(program, options, callback) {
  checkPython(function (err, version) {
    if (err){
      callback(err);
      return;
    }
    var params = options.slice(0),
        cmd = path.normalize('python ' +  __dirname +
            '/../tools/' + program + '.py');
    params.unshift(cmd);

    var result = [];

    var task = exec(params.join(' '), function (error) {
      if (err){
        callback(err);
      }
    });

    var splitter = task.stdout.pipe(StreamSplitter('\n'));

    // Set encoding on the splitter Stream, so tokens come back as a String.
    splitter.encoding = 'utf8';

    splitter.on('token', function(token) {
      result.push(token);
    });

    splitter.on('done', function() {
      var res = parseResult(result);
      if (res){
        callback(null, res);
      } else {
        callback('Parse error');
      }
    });

    splitter.on('error', function(err) {
      // Any errors that occur on a source stream will be emitted on the
      // splitter Stream, if the source stream is piped into the splitter
      // Stream, and if the source stream doesn't have any other error
      // handlers registered.
      callback(err);
    });
  });
}

exports.gjslint = function(options, callback) {
 execute('gjslint', options, callback);
};

exports.fixjsstyle = function(options, callback) {
  execute('fixjsstyle', options, callback);
};

//These funcs are private. exposed only for testing.
exports.parseResult = parseResult;
exports.checkPython = checkPython;


