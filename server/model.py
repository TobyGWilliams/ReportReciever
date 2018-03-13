import httplib2
import logging
import os
import webapp2
import re
import json
import datetime

from google.appengine.api import users
from google.appengine.ext import ndb

from oauth2client import client
from oauth2client.contrib.appengine import CredentialsNDBProperty


class driveFolder(ndb.Model):
    id = ndb.StringProperty()
    name = ndb.StringProperty()
    url = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)


class AttachmentMapping(ndb.Model):
    user = ndb.UserProperty()
    emailPrefix = ndb.StringProperty()
    sender = ndb.StringProperty()
    renameFile = ndb.BooleanProperty()
    folder = ndb.StructuredProperty(driveFolder)
    active = ndb.BooleanProperty(default=True)
    created = ndb.DateTimeProperty(auto_now_add=True)


class UserModel(ndb.Model):
    credentials = CredentialsNDBProperty()
    user = ndb.UserProperty()
    approved = ndb.BooleanProperty(default=False)


class EmailAttachment(ndb.Model):
    title = ndb.StringProperty()
    fileName = ndb.StringProperty()
    fileType = ndb.StringProperty()


class ReceievedEmail(ndb.Model):
    to = ndb.StringProperty()
    addressPrefix = ndb.StringProperty()
    subject = ndb.StringProperty()
    sender = ndb.StringProperty()
    numberOfAttachments = ndb.IntegerProperty()
    attachments = ndb.StructuredProperty(EmailAttachment, repeated=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    processed = ndb.BooleanProperty(default=False)


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
