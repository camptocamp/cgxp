#!/bin/python

import os
from subprocess import Popen

os.chdir('core/src/doc')
Popen(['./env/bin/pip', 'install', '-r', 'requirements.txt']).wait()
Popen(['./env/bin/jst', 'jst.cfg']).wait()
