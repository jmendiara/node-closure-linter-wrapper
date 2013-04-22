
var colors = require('colors');

function printErr(err) {
  console.log('Cannot execute gjslint!'.red.bold);
  console.log(err);
}

function printFail(fail) {
  console.log((fail.file).bold);
  fail.errors.forEach(function (error) {
    printError(error);
  });
}

function printError(error) {
  console.log('  [#' + error.line + '] ' + error.description + ' (Error ' + error.code + ')');
}

exports.reportGJSLint = function(err, result, options) {
  if(err){
    printErr(err);
  } else {
    if(result.success){
      console.log('gjslint free'.green.bold);
      console.log(result.data.filesCount + ' files passed');
    } else {
      console.log('gjslint linting failed!'.red.bold);
      result.data.fails.forEach(function(fail) {
         printFail(fail);
      });

      console.log('\nFound ' + result.data.total + ' errors, ' +
          'including '+ result.data.newErrors +' new errors, ' +
          'in ' + result.data.filesCount +'  files ' +
          '('+ result.data.filesOK +' files OK).'
      );
    }


  }
};