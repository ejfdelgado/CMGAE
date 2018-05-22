
"""Defines the url patterns for the application."""

from django.conf.urls import defaults

from views.main import RESTfulActions
from views.main import RESTfulHandler
from views.main import RESTpaginar
from views.storage import StorageHandler


urlpatterns = defaults.patterns(
    'views',
    (r'^rest/?(.*)', RESTfulHandler),
    (r'^paginar/?(.*)', RESTpaginar),
    (r'^act/?(.*)', RESTfulActions),
    (r'^storage/?(.*)', StorageHandler),
    (r'^(.*)$', 'main.principal'),
    
)

#handler404 = 'utility.page_not_found'
#handler500 = defaults.handler500
