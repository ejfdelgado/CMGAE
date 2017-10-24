'''
Created on 20/01/2016

@author: Edgar
'''
import datetime
import time
from google.appengine.ext import ndb

def to_dict_(entidad):
    ans = {}
    for key in entidad._properties.keys():
        val = getattr(entidad, key)
        if val != None and val.__class__ == datetime.datetime:
            ans[key] = time.mktime(val.timetuple())
        else:
            ans[key] = val
        
    ans['id'] = entidad.key.id()
    return ans

class Documento(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)

class lista1(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)
    
class lista2(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)
    
class lista3(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)

class lista6(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)

class Caracteristica(ndb.Expando):
    _default_indexed = False
    date = ndb.DateTimeProperty(auto_now_add=True)
    modif = ndb.DateTimeProperty(auto_now=True)
    
    def to_dict(self):
        return to_dict_(self)
    
class Gallery(ndb.Expando):
    _default_indexed = False
    date = ndb.DateTimeProperty(auto_now_add=True)
    modif = ndb.DateTimeProperty(auto_now=True)
    
    def to_dict(self):
        return to_dict_(self)

class Schedule(ndb.Expando):
    _default_indexed = False
    date = ndb.DateTimeProperty(auto_now_add=True)
    modif = ndb.DateTimeProperty(auto_now=True)
    fecha = ndb.DateTimeProperty()
    
    def to_dict(self):
        return to_dict_(self)

class Testimonio(ndb.Expando):
    _default_indexed = False
    date = ndb.DateTimeProperty(auto_now_add=True)
    modif = ndb.DateTimeProperty(auto_now=True)
    def to_dict(self):
        return to_dict_(self)

class Configuracion(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)
    
class Usuario(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)
    
class Producto(ndb.Expando):
    _default_indexed = False
    def to_dict(self):
        return to_dict_(self)
    
class Carrito(ndb.Model):
    _default_indexed = False
    creacion = ndb.DateTimeProperty()
    estado = ndb.IntegerProperty()
    correo = ndb.StringProperty()
    
    #elems = ndb.KeyProperty(kind="Producto", repeated=True)
    #{llave1:cantidad, llave2:cantidad}
    json = ndb.StringProperty()
    def to_dict(self):
        return to_dict_(self)
    
class Foto(ndb.Model):
    _default_indexed = False
    epoch = ndb.DateTimeProperty()
    fecha = ndb.StringProperty()
    camara = ndb.StringProperty()
    url = ndb.StringProperty()
    def to_dict(self):
        return to_dict_(self)

class Cliente(ndb.Expando):
    _default_indexed = False
    title = ndb.StringProperty()
    maxper = ndb.IntegerProperty()
    srv = ndb.IntegerProperty()
    cumple = ndb.DateTimeProperty()
    def to_dict(self):
        return to_dict_(self)

class Cita(ndb.Expando):
    _default_indexed = False
    title = ndb.StringProperty()
    start = ndb.DateTimeProperty()
    end = ndb.DateTimeProperty()
    resourceId = ndb.IntegerProperty()
    maxper = ndb.IntegerProperty()
    srv = ndb.IntegerProperty()
    color = ndb.StringProperty()
    obs = ndb.StringProperty()
    persona = ndb.IntegerProperty()
    srvpagado = ndb.IntegerProperty()
    srvmeses = ndb.IntegerProperty()
    sesionesmes = ndb.IntegerProperty()
    
    def to_dict(self):
        return to_dict_(self)
    def to_dict2(self):
        temp = self.to_dict()
        temp['end'] = self.end.strftime("%Y-%m-%dT%H:%M:%S")
        temp['start'] = self.start.strftime("%Y-%m-%dT%H:%M:%S")
        temp['id'] = self.key.id()
        return temp
        #return {"id": self.key.id(), "persona": self.persona, "title": self.title, "srv": self.srv, "end": self.end.strftime("%Y-%m-%dT%H:%M:%S"), "start": self.start.strftime("%Y-%m-%dT%H:%M:%S"), "color": self.color, "resourceId": self.resourceId, "maxper": self.maxper, "obs": self.obs}

class Evento(ndb.Model):
    _default_indexed = False
    modificado = ndb.DateTimeProperty(name=None, auto_now=True, auto_now_add=True)
    borrado = ndb.BooleanProperty()
    fecha = ndb.DateTimeProperty()
    titulo = ndb.StringProperty()
    descripcion = ndb.StringProperty()
    def to_dict(self):
        return to_dict_(self)