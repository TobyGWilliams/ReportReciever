
import webapp2
import logging
from google.appengine.ext import ndb
from model import ReceievedEmail, AttachmentMapping

class ReceievedEmailTask(webapp2.RequestHandler):
    def get(self):
        key = self.request.get('key')
        logging.info('ReceievedEmailTask: {0}'.format(key))
        email = ndb.Key(urlsafe=key).get()

        matchMappings = AttachmentMapping.query(
            ndb.AND(
                ndb.OR(
                    AttachmentMapping.sender ==  email.sender,
                    AttachmentMapping.sender ==  '',
                ),
                AttachmentMapping.emailPrefix == email.addressPrefix
            )
        ).fetch()
        logging.info(matchMappings)

        email.processed = True
        email.put()



        # if hasattr(mail_message, 'attachments'):
        #     logging.info('Has attachments')
        #     for filename, filecontents in mail_message.attachments:
        #         decoded_filename = encoded_words_to_text(filename)
        #         logging.info(
        #             'Attachment filename: {0}'.format(decoded_filename))
        #         file_blob = filecontents.payload.decode(filecontents.encoding)
        #         mime = MimeTypes()
        #         mime_type = mime.guess_type(decoded_filename)
        #         if(mime_type[0] == None):
        #             logging.info('Can\'t guess MIME_Type')
        #         else:
        #             logging.info('MIME Type is: {0}'.format(mime_type[0]))
        #             creds = UserModel.query().fetch()
        #             for c in creds:
        #                 logging.info(c.user, decoded_filename)
        #                 media = MediaInMemoryUpload(
        #                     file_blob, mime_type[0], resumable=True)
        #                 file = drive.files().create(
        #                     body={'name': decoded_filename}, media_body=media)
        #                 file.execute(c.credentials.authorize(http))
                        # creds = UserModel.query().fetch()
                # for c in creds:
        #                 logging.info(c.user, decoded_filename)
        #                 media = MediaInMemoryUpload(
        #                     file_blob, mime_type[0], resumable=True)
        #                 file = drive.files().create(
        #                     body={'name': decoded_filename}, media_body=media)
        #                 file.execute(c.credentials.authorize(http))


app = webapp2.WSGIApplication([
    ('/tasks/received-email', ReceievedEmailTask)
], debug=True)