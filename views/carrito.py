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


def CarritoHandler(request, ident):
    response = HttpResponse("", content_type='application/json')
    
    try:
        usuario = users.GetCurrentUser()
        
        if not usuario:
            return HttpResponse(status=401)
        
        tmp = {}
        if (request.raw_post_data):
            tmp = simplejson.loads(request.raw_post_data)
        
        #se busca el carrito actual
        actual = ndb.gql('SELECT * FROM Carrito WHERE estado = 0 AND correo=\'' +usuario.email()+'\'')
        lista = actual.fetch(1)
        if (len(lista) == 1):
            carrito = lista[0]
        else:
            carrito = Carrito(estado=0, correo=usuario.email())
        
        def post():
            logging.info('post')
            
            carrito.json = simplejson.dumps(tmp)
            
            carrito.put()
            response.write(simplejson.dumps({'error':0}))
        
        if request.method == 'GET':
            logging.info('get carrito')
            todos = simplejson.dumps(to_dict(carrito))
            response.write(todos)
            
        if request.method == 'PUT':
            logging.info('put')
            post()
        
    except Exception, e:
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+str(e)}))
    return response

def ProductsHandler(request, ident):
    response = HttpResponse("", content_type='application/json')
    
    try:
        #usuario = users.GetCurrentUser()
        
        #if not usuario:
        #    return HttpResponse(status=401)
        
        tmp = None
        if (request.raw_post_data):
            tmp = simplejson.loads(request.raw_post_data)
        
        if tmp == None or not isinstance(tmp, list):
            response.write(simplejson.dumps({'error':1, 'msg': 'Servicio equivocado'}))
        else:
            if request.method == 'PUT':
                module = __import__('models')
                identificadores = []
                ans = {}
                for llave in tmp:
                    partes = llave.split("/", 1)
                    class_ = getattr(module, partes[0])
                    identificadores.append(ndb.Key(class_, partes[1]))
                list_of_entities = ndb.get_multi(identificadores)
                for entidad in list_of_entities:
                    ans[entidad.__class__.__name__+'/'+entidad.key.id()] = entidad.to_dict()
                response.write(simplejson.dumps({'error':0, 'data': ans}))
            else:
                response.write(simplejson.dumps({'error':1, 'msg': 'Servicio equivocado'}))
    except Exception, e:
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+str(e)}))
    return response