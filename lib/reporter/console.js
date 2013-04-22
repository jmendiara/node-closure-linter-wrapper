
var colors = require('colors');

function printErr(err) {
  console.log('Cannot execute gjslint!'.red.bold);
  console.log(err);
}

function printFail(fail) {
  console.log(('File ' + fail.file + '').bold);
  fail.errors.forEach(function (error) {
    printError(error);
  });
}


function printError(error) {
  console.log('\tError ' + error.code + ' at #' + error.line + ': ' + error.description);
}

exports.report = function(err, result) {
  if(err){
    printErr(err);
  } else {
    if(result.success){
      console.log('gjslint free'.green.bold);
      console.log(result.data.filesCount + ' files passed');
    } else {
      console.log('gjslint linting failed!'.green.bold);
      result.data.fails.forEach(function(fail) {
         printFail(fail);
      });

      console.log('Found ' + result.data.total + ' errors, ' +
          'including '+ result.data.newErrors +' new errors, ' +
          'in ' + result.data.filesCount +'  files ' +
          '('+ result.data.filesOK +' files OK).'
      );
    }


  }
};