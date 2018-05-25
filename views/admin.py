# coding: utf-8
'''
Created on 25/05/2018

@author: Edgar
'''

from django.http import HttpResponse
from views import comun, storage, seguridad
from google.appengine.api import users
from google.appengine.api import memcache
from django.utils import simplejson
from google.appengine.ext import ndb
from models import Configuracion
from google.appengine.api import mail
from settings import TEMPLATE_DIRS, ROOT_PATH, LENGUAJE_PRED
import sys, traceback

CORREO_ENVIOS = 'edgar.jose.fernando.delgado@gmail.com'

#Acciones administrativas
def AdminGeneral(request, ident):
    response = HttpResponse("", content_type='application/json')
    try:
        if request.method == 'GET':
            if ident == 'identidad':
                return seguridad.buscarIdentidad(request)
            if not users.is_current_user_admin():
                return HttpResponse(status=401)
            if ident == 'clearmemcache':
                if not memcache.flush_all():
                    raise 'No se logro vaciar la memoria'
                else:
                    response.write(simplejson.dumps({'error':0}))
                return response
        if request.method == 'PUT':
            if ident == 'correo':
                tmp = simplejson.loads(request.raw_post_data)
                
                texto = "<h1>Correo recibido por la p&aacute;gina</h1><br/><br/>"
                texto2 = "Correo recibido por la pagina\n"
                
                for llave in tmp.keys():
                    texto += "<b>"+llave + ":</b>" + tmp[llave] + "<br/>"
                    texto2 += llave + ": "+ tmp[llave]+"\n"
                
                destinatario = CORREO_ENVIOS
                entidad = ndb.Key(Configuracion, '/propiedades').get()
                if (entidad != None):
                    tmp = simplejson.loads(getattr(entidad, 'contenido_'+LENGUAJE_PRED))
                    if (tmp['destinatario']):
                        destinatario = tmp['destinatario']
                
                message = mail.EmailMessage()
                message.sender = CORREO_ENVIOS
                message.to = destinatario
                message.html = texto
                message.body = texto2
                message.subject = "Contacto pagina web"
                
                message.send()
                
                response.write(simplejson.dumps({'error':0}))
                return response
    except Exception, e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = HttpResponse("", content_type='application/json', status=500)
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+repr(traceback.format_tb(exc_traceback))+'->'+str(e)}))
        return response