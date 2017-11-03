
import os
import logging
from django.views.generic.simple import direct_to_template
from views import storage
from django.conf import settings
from django.template.loaders.app_directories import app_template_dirs

def PruebaHandler(request, ruta):
    respuesta = direct_to_template(request, '/'+ruta, {})
    return respuesta