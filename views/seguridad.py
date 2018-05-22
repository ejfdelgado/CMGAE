'''
Created on 22/04/2018

@author: Edgar
'''

from django.http import HttpResponse
from django.utils import simplejson
import google

HTTP_REQUEST = google.auth.transport.requests.Request()


#https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/appengine/standard/firebase/firenotes/backend/main.py
def buscarIdentidad(request):
    id_token = request.headers['Authorization'].split(' ').pop()
    claims = google.oauth2.id_token.verify_firebase_token(id_token, HTTP_REQUEST)
    response = HttpResponse("", content_type='application/json', status=200)
    response.write(simplejson.dumps({'sub': 'Hey'}))
    return response