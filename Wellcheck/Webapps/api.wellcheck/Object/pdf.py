import json, datetime, time
import jwt
import hashlib
import time
import os, sys, base64
import uuid
from .sql import sql
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

from datetime import datetime


class pdf_doc:
    def __init__(self, userId = -1, filename = None):
        self.userId = str(userId)
        self.filename = filename

    def report(self, floteur, id_points, date_start, date_end):
        data = floteur.pdf_report(id_points, date_start * 1000, date_end * 1000)
        if id_points[0] not in data[1]["data"]:
        #    return [False, "no data", 400]
            size_data = 0
        else:
            size_data = len(data[1]["data"][id_points[0]])
        total_page = round((size_data - 29) / 40 + 1)
        total_page = total_page if total_page > 0 else 1
        id_doc = str(uuid.uuid4())
        documentTitle = 'Wellcheck - Report'
        image = '/home/api/Source/Base/Report_base.png'

        pdf = canvas.Canvas(sys.stdout)
        pdf.setPageSize((210 * mm, 272 * mm))
        pdf.setTitle(documentTitle)
        pdf.drawImage(image, 0, 0, 210 * mm, 272 * mm)

        pdf.setFillColorRGB(0, 0, 0)
        page = 1
        now = int(round(time.time()))

        save = True
        qr_link = 'https://doc.wellcheck.fr/?doc=' + id_doc
        if int(date_end) > int(now - 200):
            qr_link =  "https://doc.wellcheck.fr/src.php?id=" + str(id_points[0]) + "&from=" + str(int(date_start)) + "&to=" + str(int(date_end))
            save = False

        qr_code = qr.QrCodeWidget(qr_link)
        bounds = qr_code.getBounds()
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        dr = Drawing(80, 80, transform=[80./width,0,0,80./height,0,0])
        dr.add(qr_code)

        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(90 * mm, (267 - 40) * mm, "Informations:")
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(64 * mm, (267 - 46) * mm, "ID:  " + id_points[0])

        pdf.setFont("Helvetica", 12)
        pdf.drawString(100 * mm, 13 * mm, str(page) + " / "  + str(total_page))
        pdf.drawString(64.5 * mm, 5 * mm, "     unfinished period | temporary document" if not save else id_doc)
        renderPDF.draw(dr, pdf, 210 * mm - 82, 2)
        pdf.drawString(40 * mm, (267 - 54) * mm, "Sigfox_id")
        pdf.drawString(40 * mm, (267 - 58) * mm, "Name")
        pdf.drawString(40 * mm, (267 - 62) * mm, "Owned_by")
        pdf.drawString(111 * mm, (267 - 54) * mm, "Time_start")
        pdf.drawString(111 * mm, (267 - 58) * mm, "Time_end")
        pdf.drawString(111 * mm, (267 - 62) * mm, "Time_total")
        pdf.line(105 * mm, (267 - 50) * mm, 105 * mm, (267 - 63) * mm)

        pdf.setFont("Helvetica-Oblique", 12)
        diff = round((int(date_end) - int(date_start)) / 3600 , 1)
        pdf.drawString(65 * mm, (267 - 54) * mm, str(data[1]["detail"][id_points[0]]["sigfox_id"]))
        pdf.drawString(65 * mm, (267 - 58) * mm, str(data[1]["detail"][id_points[0]]["name"]))
        pdf.drawString(65 * mm, (267 - 62) * mm, str(data[1]["detail"][id_points[0]]["user_id"]))
        pdf.drawString(136 * mm, (267 - 54) * mm, str(datetime.fromtimestamp(int(date_start))))
        pdf.drawString(136 * mm, (267 - 58) * mm, str(datetime.fromtimestamp(int(date_end))))
        pdf.drawString(136 * mm, (267 - 62) * mm,  str(diff) + (" hours" if diff > 0 else " hour"))

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(33 * mm, (267 - 80) * mm, "Date")
        pdf.drawString(69 * mm, (267 - 80) * mm, "Note")
        pdf.drawString(89 * mm, (267 - 80) * mm, "Ph")
        pdf.drawString(109 * mm, (267 - 80) * mm, "Temp")
        pdf.drawString(138 * mm, (267 - 80) * mm, "Redox")
        pdf.drawString(168 * mm, (267 - 80) * mm, "Turbidity")

        pdf.setFont("Helvetica", 12)
        n = 0
        t = 0
        d = 11

        start = 88
        while n < size_data:
            pdf.drawString(18 * mm, (267 - start  - t * 5) * mm,  str(datetime.fromtimestamp(int(int(data[1]["data"][id_points[0]][n]["date"]) / 1000))))
            pdf.drawString(68 * mm, (267 - start - t * 5) * mm, str(data[1]["data"][id_points[0]][n]["data"]["data"]["note"]).rjust(4, '0'))
            pdf.drawString(88 * mm, (267 - start - t * 5) * mm, str(data[1]["data"][id_points[0]][n]["data"]["data"]["ph"]).rjust(4, '0'))
            pdf.drawString(110 * mm, (267 - start - t * 5) * mm, str(data[1]["data"][id_points[0]][n]["data"]["data"]["temp"]).rjust(4, '0'))
            pdf.drawString(138 * mm, (267 - start - t * 5) * mm, str(data[1]["data"][id_points[0]][n]["data"]["data"]["redox"]).rjust(6, '0'))
            pdf.drawString(172 * mm, (267 - start - t * 5) * mm, str(data[1]["data"][id_points[0]][n]["data"]["data"]["turbidity"]).rjust(4, '0'))
            n += 1
            d += 1
            t += 1
            if d > 40:
                 pdf.showPage()
                 start = 35
                 d = 0
                 t = 0
                 page += 1
                 pdf.drawImage(image, 0, 0, 210 * mm, 272 * mm)
                 pdf.setFont("Helvetica-Bold", 12)
                 pdf.drawString(33 * mm, (267 - start + 8) * mm, "Date")
                 pdf.drawString(69 * mm, (267 - start + 8) * mm, "Note")
                 pdf.drawString(89 * mm, (267 - start + 8) * mm, "Ph")
                 pdf.drawString(109 * mm, (267 - start + 8) * mm, "Temp")
                 pdf.drawString(138 * mm, (267 - start + 8) * mm, "Redox")
                 pdf.drawString(168 * mm, (267 - start + 8) * mm, "Turbidity")
                 pdf.setFont("Helvetica", 12)
                 pdf.drawString(100 * mm - ( 0 if page < 10 else 2 * mm if page < 100 else 4 * mm), 13 * mm, str(page) + " / "  + str(total_page))
                 pdf.drawString(64.5 * mm, 5 * mm, "     unfinished period | temporary document " if not save else id_doc)
                 renderPDF.draw(dr, pdf, 210 * mm - 82, 2)
        return [True, {"doc_id": id_doc, "Content": str(base64.b64encode(pdf.getpdfdata().decode('utf8', 'ignore').encode('ascii')))[2:-1], "Type": "pdf", "Save": save}, None]

    def __getsecret(self):
        return str(os.getenv('API_SCRT', '!@ws4RT4ws212@#%'))
