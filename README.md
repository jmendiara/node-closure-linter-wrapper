# closure-linter-wrapper

UNDER DEVELOPMENT!!!

Node Wrapper to allow access to (Google Closure Linter)[https://developers.google.com/closure/utilities/] from NodeJS

This wrapper is executing patched version from
(Elad Karako)[http://icompile.eladkarako.com/python-patch-ignore-some-of-google-closure-jslinter-gjslint-errors/]
that allows you to skip by configuration some detected errors. This version will
allow your codebase to be transformed step by step, while maintaining fully
Google coding guidelines compliance.


## Getting Started
Install the module with: `npm install closure-linter-wrapper`

Execute the linter
```javascript
var gjslint = require('closure-linter-wrapper').gjslint;
gjslint(params, function (err){
  if (!err){
    console.log('Everything went fine!');
  }
});
```

Execute the automatic style fixer
```javascript
var fixjsstyle = require('closure-linter-wrapper').fixjsstyle;
fixjsstyle(params, function (err){
  if (!err){
    console.log('Everything went fine!');
  }
});
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Javier Mendiara Cañardo  
Licensed under the MIT license.
