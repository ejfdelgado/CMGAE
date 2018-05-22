'''
Created on 20/01/2016

@author: Edgar
'''
import urllib

from django import template

from settings import LENGUAJE_PRED, TRADUCTOR


register = template.Library()

@register.simple_tag
def buscar2(leng, objeto, parametro, predeterminado):
    parametro2 = parametro+'_'+leng
    parametro3 = parametro+'_'+LENGUAJE_PRED
    if objeto == None:
        return predeterminado
    if parametro2 in objeto:
        return objeto[parametro2]
    if parametro in objeto:
        return objeto[parametro]
    if parametro3 in objeto:
        return objeto[parametro3]
    return predeterminado

@register.simple_tag
def traducir(leng, llave):
    if llave in TRADUCTOR:
        temp = TRADUCTOR[llave]
        if leng in temp:
            return temp[leng]
    return 'DEFINIR!'

@register.simple_tag
def ixpagina(pg, cursor, busqueda, isadmin, tpl, about, rel, leng, llave, clases=''):
    if not isadmin and (cursor == None or cursor == ''):
        #Evita que aparezca el paginador en el lado cliente cuando no toca
        return ''
    ans = '<a class="'+clases+'" '
    if (pg == 0):
        ans+='data-page="0" data-next="" data-q=\''+busqueda+'\' href="./" '
    else:
        url = urllib.urlencode({'data-q': busqueda, 'data-next':cursor})
        ans+='data-page="1" data-next="'+cursor+'" data-q=\''+busqueda+'\' href=\'./?'+url+'\' '
        
    if not isadmin:
        ans+='data-noa="1" '
    ans+='data-tpl="'+tpl+'" data-target="[about=\''+about+'\'] [rel=\''+rel+'\']">'
    ans+=traducir(leng, llave)
    ans+='</a>'
        
    return ans

@register.simple_tag
def buscar(leng, value, tipo, llave, parametro, predeterminado):
    parametro2 = parametro+'_'+leng
    parametro3 = parametro+'_'+LENGUAJE_PRED
    if tipo == None or len(tipo.strip()) == 0:
        tipo = 'Documento'
    if tipo in value:
        diccion = value[tipo]
        if llave in diccion:
            ans = diccion[llave]
            if parametro2 in ans:
                return ans[parametro2]
            if parametro in ans:
                return ans[parametro]
            if parametro3 in ans:
                return ans[parametro3]
                
    return predeterminado

@register.filter
def darElemento(value, llave):
    if value:
        if llave in value:
            return value[llave]
    return None