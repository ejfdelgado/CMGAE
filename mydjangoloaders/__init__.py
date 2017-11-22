
import os
import logging
from views import storage
from django.template.loaders import app_directories
from django.template.base import TemplateDoesNotExist

class CloudStorageLoader(app_directories.Loader):
    is_usable = True

    def load_template(self, template_name, template_dirs=None):
        nuevoId = storage.generarRuta('/public', template_name)
        contenido = storage.read_file_interno(nuevoId)
        if (contenido is None):
            raise TemplateDoesNotExist(template_name)
        return (contenido, template_name)