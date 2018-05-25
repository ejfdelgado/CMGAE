# coding: utf-8
'''
Created on 25/05/2018

@author: Edgar
'''

from google.appengine.ext import ndb
from django.http import HttpResponse
from django.utils import simplejson
from models import *
from views import comun
import re
from google.appengine.api import users
import sys, traceback

def buscarTodos(nombre):
    module = __import__('models')
    class_ = getattr(module, nombre)
    nuevo = class_()
    busqueda = nuevo.query()
    greetings = busqueda.fetch(100)
        
    return greetings

#Encargado de paginar con índice
def Paginar(request, ident):
    response = HttpResponse("", content_type='application/json')
    if request.method == 'PUT':
        objeto = simplejson.loads(request.raw_post_data)
        
        if (objeto['cursor'] and len(objeto['cursor']) > 0):
            objeto['busqueda']['next'] = objeto['cursor']
        
        rta = comun.buscarGQL(objeto['busqueda'])
        
        ans = {'datos':comun.to_dict(rta['datos'])}
        
        if (rta.has_key('next')):
            ans['next'] = rta['next']
        todo = simplejson.dumps(ans)
        response.write(todo)
        return response
    else:
        return HttpResponse(status=403)

#Administra el modelo de datos objeto
def CrudAdmin(request, ident):
    response = HttpResponse("", content_type='application/json')
    try:
        tokens = re.findall('(/?)(\w+)/(.*)$', ident)
        if len(tokens) > 0:
            nombre = tokens[0][1]
            ident = tokens[0][2]
        else:
            nombre = 'Documento'
            
        if ident.isnumeric():
            ident = long(ident)
        
        if not users.is_current_user_admin() and request.method in ['POST', 'PUT', 'DELETE']:
            return HttpResponse(status=401)
        
        module = __import__('models')
        class_ = getattr(module, nombre)
        
        def post():
            completo = simplejson.loads(request.raw_post_data)
            todo = completo['payload']
            leng = completo['leng']
            nuevo = class_(id=ident)
            otro = comun.llenarYpersistir(class_, nuevo, todo, leng)
            ans = {}
            ans['error'] = 0
            ans['payload'] = otro
            response.write(simplejson.dumps(ans))
        
        if request.method == 'GET':
            if ident:
                llave = ndb.Key(nombre, ident)
                greetings = llave.get()
            else:
                greetings = buscarTodos(nombre)
            todos = simplejson.dumps(comun.to_dict(greetings))
            response.write(todos)
        
        if request.method == 'POST':
            completo = simplejson.loads(request.raw_post_data)
            tmp = completo['payload']
            leng = completo['leng']
            viejo = None
            if ident:
                llave = ndb.Key(nombre, ident)
            else:
                if (tmp.has_key('id')):
                    llave = ndb.Key(nombre, tmp['id'])
                else:
                    llave = None
            if (llave):
                viejo = llave.get()
            if viejo:
                otro = comun.llenarYpersistir(class_, viejo, tmp, leng)
                ans = {}
                ans['error'] = 0
                ans['payload'] = otro
                response.write(simplejson.dumps(ans))
            else:
                post()
    
        if request.method == 'DELETE':
            if ident:
                llave = ndb.Key(nombre, ident)
                llave.delete()
                response.write('{"error":0, "msg": "'+nombre+' ('+str(ident)+') borrado"}')
            else:
                return HttpResponse(status=403)
        return response
    except Exception, e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = HttpResponse("", content_type='application/json', status=500)
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+repr(traceback.format_tb(exc_traceback))+'->'+str(e)}))
        return response