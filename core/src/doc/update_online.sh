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
# Alias /cgxp "/var/www/vhosts/docs.camptocamp.net/htdocs/c2cgeoportal/html"
# <Directory "/var/www/vhosts/docs.camptocamp.net/htdocs/cgxp/html">
#     Options Indexes FollowSymLinks MultiViews
#     AllowOverride None
#     Order allow,deny
#     allow from all
# </Directory>
#

# create a virtual env if none exists already
if [[ ! -d env ]]; then
    virtualenv --no-site-packages --distribute env
fi

# install JSTools, Jinga2 and Sphinx
./env/bin/pip install -r requirements

BUILDBASEDIR=/var/www/vhosts/docs.camptocamp.net/htdocs/cgxp

if [[ ! -d ${BUILDBASEDIR}/html ]]; then
    mkdir -p ${BUILDBASEDIR}/html
fi

git fetch

for VERSION in master 1.3 1.4 1.5
do

    # BUILDDIR is where the HTML files are generated
    BUILDDIR=${BUILDBASEDIR}/${VERSION}

    # create the build dir if it doesn't exist
    if [[ ! -d ${BUILDDIR} ]]; then
        mkdir -p ${BUILDDIR}
    fi

    # reset local changes and get the latest files
    git reset --hard
    git clean -f -d
    git checkout --force ${VERSION}
    git pull origin ${VERSION}

    rm -rf lib/api
    rm -rf lib/plugins
    rm -rf lib/widgets
    ./env/bin/jst jst.cfg
    make SPHINXBUILD=./env/bin/sphinx-build BUILDDIR=${BUILDDIR} clean html

    if [[ ! -e ${BUILDBASEDIR}/html/${VERSION} ]]; then
        ln -s ${BUILDDIR}/html ${BUILDBASEDIR}/html/${VERSION}
    fi

done

# have the right script to run it on the next time
git checkout --force master
git pull origin master
git reset --hard

exit 0
