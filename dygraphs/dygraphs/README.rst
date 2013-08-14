To update those files:

.. code:: bash

   cd dygraphs
   git pull origin master
   ./generate-combined.sh
   cat excanvas.js dygraph-combined.js > ../dygraph-excanvas.combined.js
   git checkout dygraph-combined.js
   cd -
   git add dygraph-excanvas.combined.js dygraphs
   git commit -m "Update Dygraph"
