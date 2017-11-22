
"""Django settings for app-engine-site-creator project."""

import os

APPEND_SLASH = False
LENGUAJE_PRED = 'esp'
DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')
ROOT_PATH = os.path.dirname(__file__)
ROOT_URLCONF = 'urls'
TEMPLATE_DEBUG = DEBUG
TEMPLATE_CONTEXT_PROCESSORS = ()
TEMPLATE_DIRS = (
    os.path.join(ROOT_PATH, 'templates'),
)
TEMPLATE_LOADERS = (
    'mydjangoloaders.CloudStorageLoader',
    'django.template.loaders.filesystem.load_template_source'
)

TRADUCTOR = {
             'enviar':{'esp':'Enviar', 'eng': 'Send'},
             'agreg_msj':{'esp':'Agregar Mensaje', 'eng': 'Add Message'},
             'nombres':{'esp':'Nombres', 'eng': 'Name'},
             'nombresyape':{'esp':'Nombres y apellidos', 'eng': 'Name & last name'},
             'celular':{'esp':'Celular', 'eng': 'Cellphone'},
             'correo':{'esp':'Correo', 'eng': 'E-mail'},
             'msg':{'esp':'Mensaje', 'eng': 'Message'},
             'inicio':{'esp':'Inicio', 'eng': 'Start'},
             'siguiente':{'esp':'Siguiente', 'eng': 'Next'},
             'mas':{'esp':'M&aacute;s', 'eng': 'More'},
             }