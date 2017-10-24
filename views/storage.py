
from __future__ import with_statement

import sys, traceback

import logging
import os
import uuid

import cloudstorage as gcs

from google.appengine.api import app_identity

from django.http import HttpResponse
from django.utils import simplejson

from google.appengine.api.app_identity import get_application_id

def general(response):
    bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
    response.write(simplejson.dumps({
                                     'error':0, 
                                     'content': 'Using bucket name: ' + bucket_name + '\n\n',
                                     'other':'Demo GCS Application running from Version: {}\n'.format(os.environ['CURRENT_VERSION_ID'])
                                     }))

def create_file(response, filename):
    """Create a file."""
    response.write(simplejson.dumps({'error':0, 'msg':'Creating file %s\n' % filename}))

    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    gcs_file = gcs.open(filename,
                      'w',
                      content_type='text/plain',
                      options={'x-goog-meta-foo': 'foo',
                               'x-goog-meta-bar': 'bar'},
                      retry_params=write_retry_params)
    gcs_file.write('abcde\n')
    gcs_file.write('f'*1024*4 + '\n')
    gcs_file.close()
    
def list_bucket(bucket):
    """Create several files and paginate through them.
    Production apps should set page_size to a practical value.
    Args:
      bucket: bucket.
    """
    ans = []
    page_size = 1
    stats = gcs.listbucket(bucket + '/', max_keys=page_size)
    while True:
        count = 0
        for stat in stats:
            count += 1
            ans.append(repr(stat))
        
        if count != page_size or count == 0:
            break
        stats = gcs.listbucket(bucket + '/', max_keys=page_size,
                               marker=stat.filename)
    return ans;

def delete_files(response, filename):
    try:
        gcs.delete(filename)
        response.write(simplejson.dumps({'error':0}))
    except gcs.NotFoundError:
        response.write(simplejson.dumps({'error':1}))

def read_file(filename):
    metadata = gcs.stat(filename)
    with gcs.open(filename) as cloudstorage_file:
        temp = cloudstorage_file.read()
        response = HttpResponse(temp, content_type=metadata.content_type)
        return response

def generarUID():
    return str(uuid.uuid4())

def StorageHandler(request, ident):
    if not ident == 'read':
        response = HttpResponse("", content_type='application/json')
    try:
        if request.method == 'GET':
            if (ident == 'list'):
                ans = list_bucket('/'+get_application_id()+'.appspot.com') 
                response.write(simplejson.dumps({'error':0, 'all_objects': ans}))
            elif (ident == 'basic'):
                general(response)
            elif (ident == 'read'):
                nombre = request.GET.get('name', None)
                response = read_file(nombre)
            elif (ident == 'guid'):
                response.write(simplejson.dumps({'error':0, 'uid':generarUID()}))
            else:
                response.write(simplejson.dumps({'error':0}))
        elif request.method == 'POST':
            archivo = request.FILES['file-0']
            uploaded_file_content = archivo.read()
            uploaded_file_filename = archivo.name
            uploaded_file_type = archivo.content_type
            nombreAnterior = request.POST.get('name', None)
            carpeta = request.POST.get('folder', '')
            if (not nombreAnterior is None):
                try:
                    gcs.delete(nombreAnterior)
                except:
                    pass
            nombre = '/'+app_identity.get_default_gcs_bucket_name()+carpeta+'/'+generarUID()+'-'+uploaded_file_filename
            write_retry_params = gcs.RetryParams(backoff_factor=1.1)
            gcs_file = gcs.open(nombre,
                              'w',
                              content_type=uploaded_file_type,
                              options={
                                       'x-goog-acl':'public-read'
                                       },
                              retry_params=write_retry_params)
            gcs_file.write(uploaded_file_content)
            gcs_file.close()
            response.write(simplejson.dumps({'error':0, 'id':nombre}))
            
    except Exception, e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = HttpResponse("", content_type='application/json')
        response.write(simplejson.dumps({'error':1, 'msg': 'Error de servidor: '+repr(traceback.format_tb(exc_traceback))+'->'+str(e)}))

    return response
