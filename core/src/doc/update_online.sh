#!/bin/bash

#
# This script updates the CGXP HTML docs available at 
# http://docs.camptocamp.net/cgxp
#
# This script is to be run on the doc.camptocamp.net server,
# from the cgxp/core/src/doc directory.
#
# To run the script change dir to cgxp/core/src/doc and do:
#   ./update_online.sh
#
# Possible Apache config:
#
# Alias /cgxp "/var/www/docs.camptocamp.net/htdocs/c2cgeoportal/html"
# <Directory "/var/www/docs.camptocamp.net/htdocs/cgxp/html">
#     Options Indexes FollowSymLinks MultiViews
#     AllowOverride None
#     Order allow,deny
#     allow from all
# </Directory>
#

# BUILDDIR is where the HTML files are generated
BUILDDIR=/var/www/docs.camptocamp.net/htdocs/cgxp

# create the build dir if it doesn't exist
if [[ ! -d ${BUILDDIR} ]]; then
    mkdir -p ${BUILDDIR}
fi

# get the latest files
git pull origin master

# create a virtual env if none exists already
if [[ ! -d env ]]; then
    curl http://mapfish.org/downloads/virtualenv-1.4.5.py | python - --no-site-packages --distribute env
fi

# install JSTools, Jinga2 and Sphinx
./env/bin/pip install -r requirements

./env/bin/jst jst.cfg
make SPHINXBUILD=./env/bin/sphinx-build BUILDDIR=${BUILDDIR} clean html

exit 0
