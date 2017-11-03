
"""Defines the url patterns for the application."""

from django.conf.urls import defaults
from views.main import RESTfulHandler
from views.main import RESTpaginar
from views.main import RESTfulActions
from views.main import ConfigHandler
from views.users import UserHandler
from views.storage import StorageHandler
from views.carrito import CarritoHandler, ProductsHandler
from views.citas import CitasHandler
from views.lapseview import LVHandler
from views.apirest import ApiRestHandler
from views.prueba import PruebaHandler

urlpatterns = defaults.patterns(
    'views',
    (r'^rest/?(.*)', RESTfulHandler),
    (r'^paginar/?(.*)', RESTpaginar),
    (r'^act/?(.*)', RESTfulActions),
    (r'^user/?(.*)', UserHandler),
    (r'^prueba/?(.*)', PruebaHandler),
    (r'^lapseview/?(.*)', LVHandler),
    (r'^apirest/(\d*)?(.*)', ApiRestHandler),
    (r'^storage/?(.*)', StorageHandler),
    (r'^carrito/?(.*)', CarritoHandler),
    (r'^citas/?(.*)', CitasHandler),
    (r'^productos/?(.*)', ProductsHandler),
    (r'^sitemap.xml(.*)', ConfigHandler),
    (r'^robots.txt(.*)', ConfigHandler),
    (r'^mapa.kml(.*)', ConfigHandler),
    (r'^miestilo.css(.*)', ConfigHandler),
    (r'^mijavascript.js(.*)', ConfigHandler),
    (r'^(.*)$', 'main.principal'),
    
)

#handler404 = 'utility.page_not_found'
#handler500 = defaults.handler500
