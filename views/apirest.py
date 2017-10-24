'''
Created on 29/10/2016

@author: Edgar
'''
import logging
from django.http import HttpResponse
from django.utils import simplejson
from models import Evento
import datetime
from google.appengine.ext import ndb
from views import comun
import time
import base64

def ApiRestHandler(request, ident, val2):
    response = HttpResponse("", content_type='application/json')
    ahora = datetime.datetime.now()
    cursor = None
    TOKEN_VERSION = 1;
    TOKEN_SEPARADOR = ":"
    
    def generarToken():
        return base64.b64encode(str(TOKEN_VERSION)+TOKEN_SEPARADOR+str(time.mktime(ahora.timetuple())))
    
    def decodificarToken(token):
        try:
            texto = base64.b64decode(token)
            partes = texto.split(TOKEN_SEPARADOR)
            versionToken = int(partes[0])
            ultimaModificacion = float(partes[1])
            if versionToken < TOKEN_VERSION:
                return None
            return datetime.datetime.fromtimestamp(ultimaModificacion)
        except:
            raise Exception('Token no se puede decodificar')
    
    try:
        
        def buscar(request, fechaToken):
            #Para paginacion
            varn = request.GET.get('n', 100)
            varnext = request.GET.get('next', '')
            
            argumentos = {}
            if fechaToken == None:
                argumentos = {"borrado":None}
                busqueda = "SELECT * FROM Evento WHERE borrado = :borrado"
            else:
                argumentos = {"modificado":fechaToken}
                busqueda = "SELECT * FROM Evento WHERE modificado >= :modificado"
            objeto = comun.buscarGQL2({"q":busqueda, "n":long(varn), "next": varnext, "argumentos": argumentos})
            return objeto
        
        def limpiarModelo(dato, tipo):
            #metadata interna
            if (tipo == 'PUT'):
                if dato.has_key('borrado'):
                    del dato['borrado']
                if dato.has_key('id'):
                    del dato['id']
            if (tipo == 'GET'):
                if not dato.has_key('borrado') or dato['borrado'] == None:
                    dato['borrado'] = False
            if dato.has_key('modificado'):
                del dato['modificado']
            return dato
        
        def predeterminados(dato, tipo):
            if not dato.has_key('fecha'):
                dato['fecha'] = time.mktime(ahora.timetuple())
            if not dato.has_key('titulo'):
                dato['titulo'] = 'Evento en '+ahora.strftime("%Y, %m, %d, %H, %M, %S")
            if not dato.has_key('descripcion'):
                dato['descripcion'] = 'Descripcion de evento en '+ahora.strftime("%Y, %m, %d, %H, %M, %S")
            return limpiarModelo(dato, tipo)
        
        if request.method == 'GET':
            #Para sincronizacion
            token = request.GET.get('token', None)
            fechaToken = None
            if token != None:
                fechaToken = decodificarToken(token)
                token = generarToken()
            else:
                token = generarToken()
            
            objeto = buscar(request, fechaToken)
            entidades = comun.to_dict(objeto['datos'])
            if (objeto.has_key('next')):
                cursor = objeto['next']
            entidades2 = []
            for val in entidades:
                entidades2.append(limpiarModelo(val, 'GET'))
            response.write(simplejson.dumps({'error':0, 'entidades': entidades2, 'next': cursor, 'token': token}))
        
        if request.method == 'PUT':
            #Crea o actualiza
            tmp = {}
            if (request.raw_post_data):
                tmp = simplejson.loads(request.raw_post_data)
            dato = predeterminados(tmp, 'PUT')
            rta = {}
            if (ident != None and len(ident) > 0):
                llave = ndb.Key(Evento, long(ident))
                viejo = llave.get()
                if viejo:
                    rta = comun.llenarYpersistir(Evento, viejo, dato, None)
                else:
                    raise Exception('Modelo no encontrado')
            else:
                nuevo = Evento()
                rta = comun.llenarYpersistir(Evento, nuevo, dato, None)
            response.write(simplejson.dumps({'error':0, 'rta':rta}))
            
        if request.method == 'DELETE':
            if (ident != None):
                llave = ndb.Key(Evento, long(ident))
                viejo = llave.get()
                if viejo:
                    viejo.borrado = True
                    viejo.put()
                    response.write(simplejson.dumps({'error':0}))
                else:
                    raise Exception('Modelo no encontrado')
            else:
                raise Exception('Debe proveer id')
            
        
    except Exception, e:
        response.write(simplejson.dumps({'error':1, 'mensaje': 'Error de servidor: '+str(e)}))

    return response