'''
Created on 5/03/2016

@author: Edgar
'''
import os
import logging
import HTMLParser

from django.http import HttpResponse
from django.utils import simplejson

from google.appengine.api import users
from google.appengine.ext import ndb

from views.comun import to_dict
from models import *


def UserHandler(request, ident):
    response = HttpResponse("", content_type='application/json')
    
    try:
        usuario = users.GetCurrentUser()
        
        if not usuario:
            response.write('{}')
            return response
        
        llavetexto = usuario.email()+'/'+ident
        llave = ndb.Key(Usuario, llavetexto)
        tmp = {}
        if (request.raw_post_data):
            tmp = simplejson.loads(request.raw_post_data)
        
        def post():
            logging.info('post '+llavetexto)
            viejo = llave.get()
            if not viejo:
                logging.info('No hay viejo')
                viejo = Usuario(id=llavetexto)
            else:
                logging.info('Si hay viejo')
            
            for key, value in tmp.iteritems():
                attributo = getattr(Usuario, key, None)
                if attributo != None and attributo.__class__ == ndb.model.DateTimeProperty:
                    value = datetime.datetime.fromtimestamp(value)
                setattr(viejo, key, value)
            viejo.put()
            response.write(simplejson.dumps({'error':0}))
        
        if request.method == 'GET':
            logging.info('get '+llavetexto)
            viejo = llave.get()
            todos = simplejson.dumps(to_dict(viejo))
            response.write(todos)
            
        if request.method == 'PUT':
            logging.info('put '+llavetexto)
            post()
        
        if request.method == 'DELETE':
            logging.info('delete '+llavetexto)
            llave.delete()
            response.write('{"error":0, "msg": "'+llavetexto+' borrado"}')
        
    except Exception, e:
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+str(e)}))
    return response