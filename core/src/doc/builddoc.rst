.. _build_doc:

Build this doc
==============

* Change to the ``core/src/doc`` directory::

  $ cd core/src/doc

* Create a virtual env::

  $ wget http://www.mapfish.org/downloads/virtualenv-1.4.5.py
  $ python virtualenv-1.4.5.py --distribute --no-site-packages env

* Activate the virtual env::

  $ source env/bin/activate

* Install Jinga, JSTools, and Sphinx::

  $ pip install 'Jinga2==2.6'
  $ pip install 'JSTools==0.6'
  $ pip install 'Sphinx==1.1.2'

* Build the doc::

  $ jst jst.cfg
  $ make html

The HTML should now be available in the ``_build/html`` directory.
