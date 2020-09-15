from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import os
from datetime import datetime
from Source.email.heb_report import *
from Source.email.alerte import *
from Source.email.new_user import *

smtp_user =     str(os.getenv('MAILER_USER', None))
smtp_pass =     str(os.getenv('MAILER_PASS', None))
smtp_server =   str(os.getenv('MAILER_HOST', None))
smtp_port =   str(os.getenv('MAILER_PORT', None))

class Mailer():
    def __init__(self):
        """Open connection to the mail server"""
        self.sender = smtp_user
        self.password = smtp_pass
        self.server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        self.server.login(self.sender, self.password)
        self.msg = MIMEMultipart()

    def heb_report(self, to_list, point_name, point_id, timestamp_start, timestamp_end, timestamp_origin):
        """Send a message to the recipient"""
        point_id = str(point_id)
        start = datetime.fromtimestamp(timestamp)
        end = datetime.fromtimestamp(timestamp)
        origin = datetime.fromtimestamp(timestamp)
        self.html = report_header + report_body.format(point_id    = point_id,
                                                       report_link = "https://doc.wellcheck.fr/src.php?id=" + point_id + "&from=" + str(timestamp_start) + "&to=" + str(timestamp_end),
                                                       date_start  = start.strftime("%d/%m/%Y"),
                                                       date_end    = end.strftime("%d/%m/%Y"),
                                                       date_origin = origin.strftime("%H:%M:%S %d/%m/%Y"))
        self.to_list = to_list
        self.msg['Subject'] = "Rapport hebdomadaire Point " + point_name
        self.__send()
        return [True, {}, None]

    def alerte(self, to_list, point_name, point_id, timestamp, note):
        """Send a message to the recipient"""
        point_id = str(point_id)
        date = datetime.fromtimestamp(timestamp)
        self.html = alerte_header + alerte_body.format(point_id    = point_id,
                                                       alerte_link = "https://dashboard.wellcheck.fr/stats?bindlocal=true&force=true&selected=" + point_id,
                                                       date        = date.strftime("%H:%M:%S %d/%m/%Y"),
                                                       note_10     = "{:.2f}".format(note))
        self.to_list = to_list
        self.msg['Subject'] = "Alerte pollution ! Point " + point_name
        self.__send()
        return [True, {}, None]

    def new_user(self, to, key, timestamp):
        """Send a message to the recipient"""
        date = datetime.fromtimestamp(timestamp)
        self.html = new_header + new_body.format(valid_link = "https://dashboard.wellcheck.fr/valid?bindlocal=true&act_key=" + key.replace("=", "%3D"),
                                                        key = str(key))
        self.to_list = [to]
        self.msg['Subject'] = "Votre inscription Wellcheck"
        self.__send()
        return [True, {}, None]

    def __send(self):
        self.message = ""
        self.msg['From'] = self.sender
        self.msg['To'] = ", ".join(self.to_list)
        self.msg.attach(MIMEText(self.html, 'html'))
        self.msg.attach(MIMEText(self.message, 'plain'))
        self.server.send_message(self.msg, self.msg['From'], self.to_list)
        self.__close()
        return


    def __close(self):
        """Close the server connection"""
        self.server.quit()
