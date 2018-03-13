import logging
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler
import webapp2

class LogSenderHandler(InboundMailHandler):
    def receive(self, mail_message):

        plaintext_bodies = mail_message.bodies('text/plain')
        html_bodies = mail_message.bodies('text/html')

        for content_type, body in html_bodies:
            decoded_html = body.decode()
        
        for content_type, body in plaintext_bodies:
            plaintext = body.decode()
        
        logging.info("Received a message from: " + mail_message.sender)
        logging.info("Html body of length %d.", len(decoded_html))
        logging.info("Plain text body of length %d.", len(plaintext))

        if hasattr(mail_message, 'attachments'):
            logging.info("Has attachments")
            for filename, filecontents in mail_message.attachments:
                file_blob = filecontents.payload
                file_blob = file_blob.decode(filecontents.encoding)
                logging.info("File name: %s, encoding: %s", filename, filecontents.encoding)

        


app = webapp2.WSGIApplication([LogSenderHandler.mapping()], debug=True)