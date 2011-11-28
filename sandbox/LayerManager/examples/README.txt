KML Tests
******************************************
KML Interactive sampler: http://kml-samples.googlecode.com/svn/trunk/interactive/index.html
KML Reference: http://code.google.com/intl/fr/apis/kml/documentation/kmlreference.html
******************************************

Sample data
******************************************
line_style.kml: ok
placemark_descriptive.kml: CDATA not supported
placemark_floating.kml: need support of graphicXOffset / graphicYOffset / graphicWidth / graphicHeight
simple_placemark.kml: ok
placemark_extruded.kml: ok
line_absolute_extruded.kml: ok
polygon_google_campus.kml: ok
multigeometry_simple.kml: ok

Not supported:
read/write: altitudeMode
read/write: tessellate
read/write: extruded
read/write: CDATA in description
read/write: <LookAt>
write: graphicXOffset,graphicYOffset,graphicWidth,graphicHeight

