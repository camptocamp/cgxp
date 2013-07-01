To update those files:

.. code:: bash

   cd dygraphs
   git pull origin master
   ./generate-combined.sh
   cp dygraph-combined.js excanvas.js ..
   cd -
   git add dygraph-combined.js excanvas.js dygraphs
   git commit -m "Update Dygraph"
