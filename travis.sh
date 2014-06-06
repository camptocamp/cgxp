#!/bin/bash

cd core/src/doc
source env/bin/activate
mkdir _build/html
jst jst.cfg
exec 3>&1
error=$( { sphinx-build -b html -d _build/doctrees . _build/html 1>&3; } 2>&1 )
exec 3>&-
cd -
if [ "$error" != "" ];
then
  echo Documentation Error:
  echo ${error}
  exit 1
fi
echo Documentation Success
