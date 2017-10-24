'''
Created on 14/04/2016

@author: Edgar
'''

import logging
from django.http import HttpResponse
from django.utils import simplejson
from models import Foto
import datetime
from google.appengine.ext import ndb
from views import comun
import time

def LVHandler(request, ident):
    
    to = time.mktime(comun.fechaAhora.timetuple())
    cursor = None
    
    response = HttpResponse("", content_type='application/json')
    
    try:
        if request.method == 'PUT':
            #{"camara": "1", "epoch": 1460691726, "url": "algo"}
            tmp = {}
            if (request.raw_post_data):
                tmp = simplejson.loads(request.raw_post_data)
                
            if tmp.has_key('camara'):
                varcamara = tmp['camara']
            else:
                varcamara = '1'
                
            if tmp.has_key('epoch'):
                varepoch = tmp['epoch']
            else:
                varepoch = to
            
            if tmp.has_key('url'):
                varurl = tmp['url']
            else:
                varurl = '/'+varcamara+'_'+str(long(varepoch))+'.jpg'
            
            nuevo = Foto()
            nuevo.camara = varcamara
            nuevo.epoch = datetime.datetime.fromtimestamp(varepoch)
            nuevo.fecha = nuevo.epoch.strftime("%Y-%m-%d %H:%M:%S")
            nuevo.url = varurl
            
            nuevo.put()
            
            response.write(simplejson.dumps({'error':0}))
        
        def buscar(request):
            camara = request.GET.get('camara', "1")
            ti = request.GET.get('ti', to)
            tf = request.GET.get('tf', to)
            varn = request.GET.get('n', 100)
            varnext = request.GET.get('next', '')
            
            varti = datetime.datetime.fromtimestamp(float(ti))
            vartf = datetime.datetime.fromtimestamp(float(tf))
            
            varttitext = varti.strftime("%Y, %m, %d, %H, %M, %S")
            varttftext = vartf.strftime("%Y, %m, %d, %H, %M, %S")
            
            busqueda = "SELECT * FROM Foto WHERE camara='"+camara+"' AND epoch >= DATETIME("+varttitext+") AND epoch <= DATETIME("+varttftext+") ORDER BY epoch ASC"
            logging.info(busqueda)
            objeto = comun.buscarGQL({"q":busqueda, "n":long(varn), "next": varnext})
            return objeto
        
        if request.method == 'GET':
            objeto = buscar(request)
            
            entidades = comun.to_dict(objeto['datos'])
            if (objeto.has_key('next')):
                cursor = objeto['next']
            response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
            
        if request.method == 'DELETE':
            objeto = buscar(request)
            llaves = []
            for entidad in objeto['datos']:
                llaves.append(entidad.key)
            ndb.delete_multi(llaves)
            
            if (objeto.has_key('next')):
                cursor = objeto['next']
            
            response.write(simplejson.dumps({'error':0, 'borradas': len(llaves), 'next': cursor}))
            
    except Exception, e:
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+str(e)}))

    return response
