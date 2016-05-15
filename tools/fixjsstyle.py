#!/usr/bin/env python

# snipped thanks to
# http://stackoverflow.com/questions/279237/python-import-a-module-from-a-folder

import os, sys, inspect

def get_relative_path(*parts):
  return os.path.realpath(os.path.abspath(os.path.join(
    os.path.split(inspect.getfile(inspect.currentframe()))[0],
    *parts)))

sys.path.insert(0, get_relative_path("closure-linter"))
sys.path.insert(0, get_relative_path("gflags"))

from closure_linter import fixjsstyle
fixjsstyle.main()
