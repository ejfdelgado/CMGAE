
"""Defines the url patterns for the application."""

from django.conf.urls import defaults

from views.admin import AdminGeneral
from views.crud import CrudAdmin
from views.crud import Paginar
from views.storage import StorageHandler


urlpatterns = defaults.patterns(
    'views',
    (r'^rest/?(.*)', CrudAdmin),
    (r'^paginar/?(.*)', Paginar),
    (r'^act/?(.*)', AdminGeneral),
    (r'^storage/?(.*)', StorageHandler),
    (r'^(.*)$', 'main.principal'),
    
)

#handler404 = 'utility.page_not_found'
#handler500 = defaults.handler500
