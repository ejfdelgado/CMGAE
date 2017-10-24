'''
Created on 17/04/2016

@author: Edgar
'''

import logging
from django.http import HttpResponse
from django.utils import simplejson
from models import Cita
import datetime
from google.appengine.ext import ndb
from views import comun
import time

def CitasHandler(request, ident):
    
    to = comun.fechaAhora.__format__("%Y-%m-%d")
    cursor = None
    
    response = HttpResponse("", content_type='application/json')
    
    try:
        if request.method == 'PUT':
            #{"title": "edelgado", "start": 1460691726, "end": 1460691726, "maxper": 2}
           
            tmp = {}
            if (request.raw_post_data):
                tmp = simplejson.loads(request.raw_post_data)
            rta = {}
            if (tmp.has_key('id')):
                llave = ndb.Key(Cita, tmp['id'])
                viejo = llave.get()
                if viejo:
                    rta = comun.llenarYpersistir(Cita, viejo, tmp, None)
            else:
                nuevo = Cita()
                rta = comun.llenarYpersistir(Cita, nuevo, tmp, None)
            response.write(simplejson.dumps({'error':0, 'rta': rta}))
        
        def buscar(request):
            ti = request.GET.get('start', to)
            tf = request.GET.get('end', to)
            persona = request.GET.get('persona', None)
            varn = request.GET.get('n', 100)
            varnext = request.GET.get('next', '')
            
            varti = datetime.datetime.strptime(ti, "%Y-%m-%d")
            vartf = datetime.datetime.strptime(tf, "%Y-%m-%d")
            
            varttitext = varti.strftime("%Y, %m, %d, %H, %M, %S")
            varttftext = vartf.strftime("%Y, %m, %d, %H, %M, %S")
            
            #Recordar que GQL no tiene OR! Ademas no puedo usar dos variables para start <= X and end <=
            busqueda = "SELECT * FROM Cita "
            busqueda += "WHERE "
            busqueda += "start >= DATETIME("+varttitext+") AND start <= DATETIME("+varttftext+") "
            if persona != None:
                busqueda += "and persona="+persona+" "
            busqueda += "ORDER BY start ASC"
            
            objeto = comun.buscarGQL({"q":busqueda, "n":long(varn), "next": varnext})
            return objeto
        
        if request.method == 'GET':
            objeto = buscar(request)
            
            entidades = comun.to_dict(objeto['datos'], 'to_dict2')
            #if (objeto.has_key('next')):
            #    cursor = objeto['next']
            #response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
            response.write(simplejson.dumps(entidades))
            
        if request.method == 'DELETE':
            miid = request.GET.get('id', None)
            
            llave = ndb.Key(Cita, long(miid))
            llave.delete()
            
            response.write(simplejson.dumps({'error':0, 'borradas': 1}))
            
    except Exception, e:
        logging.error(str(e))
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+str(e)}))

    return response