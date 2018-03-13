import httplib2
import logging
import os
import webapp2
import re
import json
import datetime

from model import *

from time import mktime

from googleapiclient import discovery

from google.appengine.api import memcache
from google.appengine.api import users
from google.appengine.api import app_identity
from google.appengine.api import taskqueue

from google.appengine.ext import ndb
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler

from oauth2client import client
from oauth2client.contrib.appengine import CredentialsNDBProperty
from oauth2client.contrib import appengine


CLIENT_SECRETS = 'server/client_secret.json'
MISSING_CLIENT_SECRETS_MESSAGE = 'Missing client message'
SCOPE = 'https://www.googleapis.com/auth/drive'

decorator = appengine.oauth2decorator_from_clientsecrets(
    CLIENT_SECRETS,
    scope=SCOPE,
    message=MISSING_CLIENT_SECRETS_MESSAGE)

http = httplib2.Http(memcache)

drive = discovery.build('drive', 'v3', http=http)


def encoded_words_to_text(encoded_words):
    result = re.match(r'=\?{1}(.+)\?{1}([B|Q])\?{1}(.+)\?{1}=', encoded_words)
    if result:
        charset, encoding, encoded_text = result.groups()
        if encoding is 'B':
            output = encoded_text.decode('base64')
        elif encoding is 'Q':
            logging.info('text encoding is quopri')
            output = ''
        return output
    else:
        return(encoded_words)


class func_ndbEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, ndb.Key):
            return obj.urlsafe()
        elif isinstance(obj, users.User):
            return {'nickname': obj.nickname(), 'email': obj.email(), 'auth_domain': obj.auth_domain()}
        elif isinstance(obj, client.OAuth2Credentials):
            return 'token'
        elif isinstance(obj, ndb.Model):
            d = obj.to_dict()
            if 'user_id' in d:
                d.pop('user_id')
            if obj.key is not None:
                d['urlSafe'] = obj.key.urlsafe()
            return d
        else:
            return json.JSONEncoder.default(self, obj)
        return json.JSONEncoder.default(self, obj)


class MainHandler(webapp2.RequestHandler):
    @decorator.oauth_aware
    def get(self):
        if(decorator.has_credentials()):
            creds = UserModel.query(
                UserModel.user == users.get_current_user()).get()
            if(creds):
                self.response.write(
                    'You are signed in and credentials aleady stored')
            else:
                UserModel(
                    credentials=decorator.credentials,
                    user=users.get_current_user()
                ).put()
                self.response.write(
                    'You are signed in and new credentials stored')
        else:
            self.response.write(decorator.callback_path)
            self.response.write(
                'Please sign in to access the application, the url is: ' + decorator.authorize_url())


class StorageApi(webapp2.RequestHandler):
    def get(self):
        filename = 'Hello.jpg'
        bucket_name = os.environ.get(
            'BUCKET_NAME', app_identity.get_default_gcs_bucket_name())

        # write_retry_params = gcs.RetryParams(backoff_factor=1.1)
        gcs_file = gcs.open('/' + bucket_name + '/' + filename,
                            'w', # w = write
                            content_type='text/plain',
                            # retry_params=write_retry_params
                            )
        gcs_file.write('abcde\n')
        gcs_file.write('f'*1024*4 + '\n')
        gcs_file.close()
        # self.tmp_filenames_to_clean_up.append(filename)
    # def get(self):
    #     bucket_name = os.environ.get('BUCKET_NAME',
    #                             app_identity.get_default_gcs_bucket_name())
    #     self.response.headers['Content-Type'] = 'text/plain'
    #     self.response.write('Demo GCS Application running from Version: '
    #                         + os.environ['CURRENT_VERSION_ID'] + '\n')
    #     self.response.write('Using bucket name: ' + bucket_name + '\n\n')


class EmailApi(webapp2.RequestHandler):
    def get(self):
        emails = ReceievedEmail.query().order(-ReceievedEmail.created).fetch()
        self.response.write(json.dumps(emails, cls=func_ndbEncoder))


class MappingsApi(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        data = AttachmentMapping.query(AttachmentMapping.user == user).fetch()
        self.response.write(json.dumps(data, cls=func_ndbEncoder))

    def post(self):
        logging.info(self.request.body)
        rawData = json.loads(self.request.body)
        try:
            folder = driveFolder(
                id=rawData['folder']['id'],
                name=rawData['folder']['name'],
                url=rawData['folder']['url'],
            )
            AttachmentMapping(
                user=users.get_current_user(),
                emailPrefix=rawData['emailPrefix'],
                renameFile=rawData['renameFile'],
                sender=rawData['senderEmail'],
                folder=folder,
            ).put()
            self.response.write(json.dumps('success'))
            self.response.set_status(200)
        except:
            logging.error('Error! Error! EROORRRRRRRROROROROR')
            logging.error(rawData)
            self.response.write(json.dumps(
                'Error! Error! EROORRRRRRRROROROROR'))
            self.response.set_status(500)


class MappingApi(webapp2.RequestHandler):
    def get(self, key):
        try:
            data = ndb.Key(urlsafe=key).get()
            logging.info(data)
        except:
            logging.error('incorrect/incompatible key')
            logging.error(key)
            self.response.set_status(400)
        self.response.write(json.dumps(data, cls=func_ndbEncoder))

    def post(self, key):
        rawData = json.loads(self.request.body)
        logging.info(rawData)
        try:
            data = ndb.Key(urlsafe=key).get()
        except:
            logging.error('incorrect/incompatible key')
            logging.error(key)
            self.response.set_status(400)
        logging.info(data)
        data.active = rawData['active']
        data.put()
        logging.info(data)

    def delete(self, key):
        try:
            data = ndb.Key(urlsafe=key)
        except:
            logging.error('incorrect/incompatible key')
            logging.error(key)
            self.response.set_status(400)
        data.delete()
        self.response.set_status(200)


# class UsersApi(webapp2.RequestHandler):
#     def get(self):
#         users = UserModel.query().fetch()
#         self.response.write(json.dumps(users, cls=func_ndbEncoder))


class CredentialsApi(webapp2.RequestHandler):
    @decorator.oauth_required
    def get(self):
        if(decorator.has_credentials()):
            creds = UserModel.query(
                UserModel.user == users.get_current_user()).get()
            if(creds):
                logging.info('Credentials already stored')
                self.redirect('/home')
            else:
                UserModel(
                    credentials=decorator.credentials,
                    user=users.get_current_user()
                ).put()
                logging.info('Credentials needed to be stored')
                self.redirect('/home')
        else:
            self.redirect(decorator.authorize_url())


class UserApi(webapp2.RequestHandler):
    def get(self):
        currentUser = users.get_current_user()
        if currentUser:
            userModel = UserModel.query(UserModel.user == currentUser).get()
            response = {
                'logInUrl': users.create_login_url('/home'),
                'logOutUrl': users.create_logout_url('/home'),
                'user': currentUser,
                'userModel': userModel,
                'credentialsURL': '/api/creds'
            }
            self.response.write(json.dumps(response, cls=func_ndbEncoder))
        else:
            response = {
                'logInUrl': users.create_login_url('/home'),
            }
            self.response.write(json.dumps(response, cls=func_ndbEncoder))


app = webapp2.WSGIApplication(
    [
        (decorator.callback_path, decorator.callback_handler()),
        # ('/api/users', UsersApi),
        ('/api/user', UserApi),
        ('/api/emails', EmailApi),
        ('/api/mappings', MappingsApi),
        ('/api/mappings/(.*)', MappingApi),
        ('/api/auth', MainHandler),
        ('/api/storage', StorageApi),
        ('/api/creds', CredentialsApi)

    ],
    debug=True)

authCallBack = webapp2.WSGIApplication(
    [
        (decorator.callback_path, decorator.callback_handler())
    ],
    debug=True)
