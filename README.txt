The root directory of CGXP includes svn:externals to base libraries, and
the "core" subdir where CGXP itself resides.

One of the svn:externals is for GXP. GXP is hosted by github, so we use
github's SVN gateway. To know the SVN revision for the last commit you
can use this command:

svn log -r HEAD http://svn.github.com/opengeo/gxp
