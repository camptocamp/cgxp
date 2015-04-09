import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from mapfishapp.lib.base import BaseController, render

log = logging.getLogger(__name__)

class FilemanagerController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/filemanager.mako')
        # or, return a response
        return 'Hello World'

    def upload(self):
        return 'not implemented'

    def download(self):
        # Sample python controller used to download a file. Necessary to avoir client side flash.
        self.format = request.params.get('format', 'KML')
        if self.format == 'KML':
           response.content_type = 'application/vnd.google-earth.kml+xml'
           response.headers['Content-disposition'] = 'attachment; filename=export.kml'
        return request.params.get('content', 'no data sent')