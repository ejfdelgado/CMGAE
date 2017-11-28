# coding: utf-8
'''
Created on 17/01/2016

@author: Edgar
'''
import os
import logging
import re
from time import gmtime, strftime
import HTMLParser
import traceback

from scss import Compiler
from django.views.generic.simple import direct_to_template
from django.http import HttpResponse
from django.utils import simplejson

from google.appengine.api import memcache
from google.appengine.api import users
from google.appengine.api import mail
from google.appengine.ext import ndb

from models import *
from views import comun, storage
from settings import TEMPLATE_DIRS, ROOT_PATH, LENGUAJE_PRED

CORREO_ENVIOS = 'edgar.jose.fernando.delgado@gmail.com'

ANALYTICS = '<script>'\
            '    (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){'\
            '    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),'\
            '    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)'\
            '    })(window,document,"script","//www.google-analytics.com/analytics.js","ga");'\
            '    ga("create", "$1", "auto");'\
            '    ga("send", "pageview");'\
            '</script>'

def buscarTodos(nombre):
    module = __import__('models')
    class_ = getattr(module, nombre)
    nuevo = class_()
    busqueda = nuevo.query()
    greetings = busqueda.fetch(100)
        
    return greetings

def rutaExiste(ruta):
    valor = 0;
    if (ruta is not None and len(str(ruta).strip())>0):
        if (storage.existe(storage.generarRuta('/public', ruta)) is not None):
            valor = 1
        elif (os.path.isfile(os.path.join(TEMPLATE_DIRS[0], ruta))):
            valor = 2
    return valor;

def leerRuta(ruta):
    ubicacion = rutaExiste(ruta)
    if (ubicacion == 0):
        return None
    elif (ubicacion == 1):
        return storage.read_file_interno(storage.generarRuta('/public', ruta))
    elif (ubicacion == 2):
        completo = ''
        for words in open(os.path.join(TEMPLATE_DIRS[0], ruta), 'r').readlines():
            completo = completo + words
        return completo

def procesarTemplate(ruta, base):
    respuesta = {'nodos':[], 'busquedas':[]}
    completo = leerRuta(ruta)
    if (completo is None):
        return respuesta
    
    #validar si tiene padre
    padreBusqueda = re.findall('{%( +)extends( +)[\'"](.*?)[\'"]( +)%}', completo, re.MULTILINE | re.IGNORECASE | re.DOTALL)
    if (len(padreBusqueda) > 0):
        padreNombre = padreBusqueda[0][2]
        respuesta = procesarTemplate(padreNombre, base)  
    
    #for match in re.findall('{%( +)with( +)(.*?)( +)as( +)nodo( +)%}(.*?){%( +)endwith( +)%}', completo, re.MULTILINE | re.IGNORECASE | re.DOTALL):
    for match in re.findall('{%( +)with( +)(.*?)( +)%}(.*?){%( +)endwith( +)%}', completo, re.MULTILINE | re.IGNORECASE | re.DOTALL):
        
        txtvariables = match[2]
        
        nodoMatch = re.findall('nodo( *)=(path\|add:)?[\'"](.*?)[\'"]', txtvariables, re.MULTILINE | re.IGNORECASE | re.DOTALL)
        tipoMatch = re.findall('tipo( *)=[\'"](.*?)[\'"]', txtvariables, re.MULTILINE | re.IGNORECASE | re.DOTALL)
        
        if (len(nodoMatch) > 0):
            tipoEncontrado = 'Documento'
            if (len(tipoMatch) > 0):
                tipoEncontrado = tipoMatch[0][1]
            
            ident = nodoMatch[0][2]
            if len(nodoMatch[0][1].strip()) != 0:
                buscarId = base+ident
            else:
                buscarId = ident
            nuevo = {'tipo':tipoEncontrado, 'id':buscarId}
            try:
                respuesta['nodos'].index(nuevo)
            except ValueError:
                respuesta['nodos'].append(nuevo)
    
    for match in re.findall("{%( *)with( +)mibusqueda( *)=['](.*?)[']( *)%}", completo, re.MULTILINE | re.IGNORECASE | re.DOTALL):
        try:
            respuesta['busquedas'].index(match[3])
        except ValueError:
            respuesta['busquedas'].append(match[3])
    return respuesta

def generarVariablesUsuario(var_full_path, leng):
    texto = '<script>\n'
    usuario = users.get_current_user()
    login_url = users.create_login_url(var_full_path)
    logout_url = users.create_logout_url(var_full_path)
    
    texto += 'var LENGUAJE = "'+leng+'";\n'
    texto += 'var LENGUAJE_PRED = "'+LENGUAJE_PRED+'";\n'
    texto += 'var URL_LOGIN = "'+login_url+'";\n'
    texto += 'var URL_LOGOUT = "'+logout_url+'";\n'
    texto += 'var RAIZ_CLOUD_STORAGE = "'+storage.darRaizStorage()+'";\n'
    
    if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
        texto += 'var AMBIENTE = "produccion";\n'
    else:
        texto += 'var AMBIENTE = "pruebas";\n'
    
    if (usuario is None):
        texto += 'var HAS_USER = false;\n'
        texto += 'var EMAIL_USER = "";\n'
        texto += 'var IS_ADMIN = false;\n'

    else:
        texto += 'var HAS_USER = true;\n'
        texto += 'var EMAIL_USER = "'+usuario.email()+'";\n'
        if (users.is_current_user_admin()):
            texto += 'var IS_ADMIN = true;\n'
        else:
            texto += 'var IS_ADMIN = false;\n'
    texto += '</script>\n'
    return texto

#data no recibe los parametros despues de ? y de #
def principal(request, data):
    if request.method == 'GET':
        #incluye los parametros del get no va a ignorar el lenguaje (solo se usa para memcache)
        var_full_path = request.get_full_path()
        #incluye hasta la ? y va a ignorar el lenguaje
        var_path = request.path
        
        leng = re.findall('^(\/leng-)([a-zA-Z]{3})(\/)', var_path)
        
        if (len(leng) > 0):
            leng = leng[0][1].lower()
            var_path = var_path[9:]
            data = data[9:]
        else:
            leng = LENGUAJE_PRED
        
        puntoExtension = data.rfind('.')
        extension = data[puntoExtension:]
        mime = 'text/html'
        if (extension.startswith(".xml")):
            mime = 'text/xml'
        elif (extension.startswith(".txt")):
            mime = 'text/plain'
        elif (extension.startswith(".kml")):
            mime = 'application/octet-stream'
        elif (extension.startswith(".css") or extension.startswith(".scss")):
            mime = 'text/css'
        elif (extension.startswith(".js")):
            mime = 'text/javascript'
        
        user = users.get_current_user()
        
        #El usuario no administrativo pasa por memcache
        if not users.is_current_user_admin():
            anterior = memcache.get(var_full_path)
            if (anterior):
                anterior = anterior.replace('__USER__', generarVariablesUsuario(var_full_path, leng), 1)
                return HttpResponse(anterior, content_type=mime)
        
        #Se lee el template para saber cuales ids se deben buscar de la base de datos
        llavesEntidades = []
        identificadores = []
        module = __import__('models')
        
        #Buscar un template valido para la url
        ruta = data
        varRutaExiste = 0
        #0. Primero se mira si tal vez existe la ruta exacta
        varRutaExiste = rutaExiste(ruta)
        if (varRutaExiste == 0):
            #1. Se le quita la extensión
            if (puntoExtension >= 0):
                ruta = ruta[:puntoExtension]
            #2. Se itera por los diferentes slash y se mira si existe template
            ultimoIndice = len(ruta)
            
            while True:
                rutaParcial = ruta[:ultimoIndice]+'.html'
                ultimoIndice = ruta.rfind('/', 0, ultimoIndice)
                varRutaExiste = rutaExiste(rutaParcial)
                if (not (varRutaExiste == 0) or ultimoIndice <= 0):
                    break
        else:
            rutaParcial = ruta
        
        #Si no encontró se queda con el index
        if (varRutaExiste == 0 and ultimoIndice <= 0):
            data = 'index.html'
        else:
            data = rutaParcial
            
        todo = procesarTemplate(data, var_path)
        
        for parte in todo['nodos']:
            class_ = getattr(module, parte['tipo'])
            identificadores.append(ndb.Key(class_, parte['id']))
            
        llavesEntidades = todo['busquedas']
        
        #Se leen las entidades
        list_of_entities = ndb.get_multi(identificadores)
        dicci = {}
        for entidad in list_of_entities:
            if entidad is not None:
                nombreClase = entidad.__class__.__name__
                if not dicci.has_key(nombreClase):
                    dicci[nombreClase] = {}
                dicci[nombreClase][entidad.key.id()] = entidad.to_dict()
        
        entidades = {}
        cursores = {}
        
        data_q = request.GET.get('data-q', None)
        data_next = request.GET.get('data-next', None)
        
        for llaveEntidad in llavesEntidades:
            objeto_busqueda = simplejson.loads(llaveEntidad)
            if (data_q == llaveEntidad and not data_next == None):
                objeto_busqueda['next'] = data_next
            objeto = comun.buscarGQL(objeto_busqueda)
            entidades[llaveEntidad] = comun.to_dict(objeto['datos'])
            if (objeto.has_key('next')):
                cursores[llaveEntidad] = objeto['next']
        
        valAnalytics = '';
        
        if (dicci.has_key('Configuracion')):
            millave = 'analytics_'+leng
            if (dicci['Configuracion'].has_key('/general') and dicci['Configuracion']['/general'].has_key(millave)):
                valor = dicci['Configuracion']['/general'][millave]
                if (not valor is None and len(valor) > 0):
                    valAnalytics = ANALYTICS.replace('$1', valor)
        
        context = {
            'ANALYTICS':valAnalytics,
            'admin':users.is_current_user_admin(),
            'path':var_path,
            'dicci': dicci,
            'leng': leng,
            'leng_pred': LENGUAJE_PRED,
            'user': user,
            'entidades' : entidades,
            'cursores' : cursores,
            'DATETIME_NOW': comun.DATETIME_NOW,
            'DATETIME_NOW_LAST': comun.DATETIME_NOW_LAST,
            'DATETIME_NOW_FIRST': comun.DATETIME_NOW_FIRST,
            'DATE_NOW': comun.DATE_NOW,
            'LOCATION': request.build_absolute_uri()
        }
        
        respuesta = direct_to_template(request, data, context, mime)
        
        if (extension.startswith(".scss")):
            respuesta.content = Compiler().compile_string(respuesta.content)
        
        if not users.is_current_user_admin():
            memcache.set(var_full_path, respuesta.content)
        
        respuesta.content = respuesta.content.decode('utf-8').replace('__USER__', generarVariablesUsuario(var_full_path, leng), 1)
        
        return respuesta

def RESTfulActions(request, ident):
    response = HttpResponse("", content_type='application/json')
    
    if request.method == 'GET':
        if not users.is_current_user_admin():
            return HttpResponse(status=401)
        if ident == 'clearmemcache':
            if not memcache.flush_all():
                response.write(simplejson.dumps({'error':0, 'msg':'No se logro vaciar la memoria'}))
            else:
                response.write(simplejson.dumps({'error':0}))
            return response
    if request.method == 'PUT':
        if ident == 'correo':
            try:
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
            except:
                response.write(simplejson.dumps({'error':1, 'msg':'Error enviando el correo.'}))
            return response

def RESTpaginar(request, ident):
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

def RESTfulHandler(request, ident):
    response = HttpResponse("", content_type='application/json')
    
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
        logging.info('delete '+str(ident))
        if ident:
            llave = ndb.Key(nombre, ident)
            llave.delete()
            response.write('{"error":0, "msg": "'+nombre+' ('+str(ident)+') borrado"}')
        else:
            return HttpResponse(status=403)
    return response
