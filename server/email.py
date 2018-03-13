import logging
import re
import json
import datetime
import webapp2
import uuid

import cloudstorage as gcs

from google.appengine.ext.webapp.mail_handlers import InboundMailHandler
from google.appengine.api import taskqueue
from google.appengine.api import users
from google.appengine.api import app_identity

from mimetypes import MimeTypes

from apiclient.http import MediaInMemoryUpload

from model import *


class EmailHandler(InboundMailHandler):
    def receive(self, mail_message):
        logging.info('Received a message from: ' + mail_message.sender)
        logging.info('Message subject: ' + mail_message.subject)
        logging.info('Message to: ' + mail_message.to)

        # set prefix = '', then analyse for <prefix>@application.appspotmail.com, then later test if updated
        prefix = ''
        addresses = mail_message.to.strip().split(',')
        for a in addresses:
            m = re.match(
                r'([a-zA-Z0-9./-]+)@' + app_identity.get_application_id() + '.appspotmail.com', a.strip())
            if m:
                prefix = m.groups(0)[0]
                logging.info(
                    'App engine email address prefix: {0}'.format(prefix))

        if prefix == '':
            logging.info('ERROR: unable to establish prefix')
            # error out here

        attachments = []

        if hasattr(mail_message, 'attachments'):
            for filename, filecontents in mail_message.attachments:
                hex_filename = uuid.uuid4().hex
                logging.info(
                    'Hopefully unique file name: {0}'.format(hex_filename))
                decoded_filename = encoded_words_to_text(filename)
                logging.info(
                    'Attachment filename: {0}'.format(decoded_filename))
                file_blob = filecontents.payload.decode(filecontents.encoding)
                mime = MimeTypes()
                mime_type = mime.guess_type(decoded_filename)
                if(mime_type[0] == None):
                    logging.info('Can\'t guess MIME_Type')
                else:
                    logging.info('MIME Type is: {0}'.format(mime_type[0]))
                    bucket_name = os.environ.get(
                        'BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
                    gcs_file = gcs.open('/' + bucket_name + '/' + hex_filename,
                                        'w',  # w = write
                                        content_type=mime_type[0],
                                        )
                    gcs_file.write(file_blob)
                    gcs_file.close()
                    attachments.append(
                        EmailAttachment(
                                    title= decoded_filename,
                                    fileName = hex_filename,
                                    fileType = mime_type[0]
                        )
                    )

        emailKey=ReceievedEmail(
            to=mail_message.to,
            sender=mail_message.sender,
            subject=mail_message.subject,
            attachments=attachments,
            numberOfAttachments=len(attachments),
            addressPrefix=prefix
        ).put()

        logging.info('create task')
        taskqueue.add(
            method='GET',
            url='/tasks/received-email?key={0}'.format(emailKey.urlsafe()),
            target='worker'
        )
        self.response.set_status(200)

mail=webapp2.WSGIApplication([EmailHandler.mapping()], debug=True)
