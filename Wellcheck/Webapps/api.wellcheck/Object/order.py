import json, time, uuid, jwt
from .sql import sql
from .tpe import tpe
from .users import user
from datetime import datetime
from email.mime.text import MIMEText

class order:
    def do_order(user_id, pay_id, details):
        date = str(int(round(time.time() * 1000)))
        try:
            details = json.dumps(details)
        except:
            return [False, "Invalid json", 401]
        uid = str(uuid.uuid4()).upper().split("-")
        succes = sql.input("INSERT INTO `orders` (`id`, `user_id`, `payment_id`, `status_id`, `date`) VALUES (%s, %s, %s, %s, %s)", \
        (uid[4], user_id, pay_id, order.getstatus("toValidate")[1]["id"], date))
        if not succes:
            return [False, "data input error12", 500]
        res = sql.get("SELECT `id`  FROM `orders` WHERE `user_id` = %s AND `date` = %s", (user_id, date))
        if len(res) > 0:
            id = str(res[0][0])
            return order.orderup(id, details)
        return [False, "data read error", 500]

    def orderup(order_id, details):
        succes = sql.input("INSERT INTO `orderdetails` (`id`, `order_id`, `json`) VALUES (NULL, %s, %s)", \
        (order_id, details))
        if not succes:
            return [False, "data input error", 500]
        return [True, {"order_id": order_id}, None]

    def orders(user_id = None, toValidate = False):
        if toValidate:
            status = order.getstatus("toValidate")[1]
        param = status["id"] if toValidate else user_id
        query = "SELECT `id` FROM `orders` WHERE `"+("status" if toValidate else "user")+"_id` = %s"
        res = sql.get(query, (param))
        orders = []
        for i in res:
            orderDetail = order.orderdetails(i[0])
            if orderDetail[0]:
                orders.append(orderDetail[1]['order'])
        return [True, {"orders": orders}, None]

    def getstatus(status_id_or_name):
        try:
            statusSql = sql.get("SELECT * FROM `order_status` WHERE `id` = %s OR `name` = %s", (status_id_or_name, status_id_or_name))[0]
        except Exception as e:
            return [False, "Invalid status id or name", 401]
        status = {
            "id": statusSql[0],
            "name": statusSql[1],
            "label": statusSql[2],
            "color": statusSql[3]
        }
        return [True, status, None]

    def orderdetails(order_id):
        orderObj = {}
        res = sql.get("SELECT `id`, `date`, `user_id`, `payment_id`, `status_id` FROM `orders` WHERE `id` = %s", (order_id))
        if len(res) == 0:
            return [False, "Invalid order id", 400]
        orderObj["id"] = res[0][0]
        orderObj["date"] = datetime.fromtimestamp(float(res[0][1]) / 1000.0).strftime("%Y-%m-%d %I:%M%p")
        orderObj["user"] = res[0][2]
        orderObj["payment"] = res[0][3]
        orderObj["status"] = order.getstatus(res[0][4])[1]
        res = sql.get("SELECT `json` FROM `orderdetails` WHERE `order_id` = %s", (order_id))
        if len(res) == 0:
            return [False, "Invalid order id", 400]
        orderObj["details"] = json.loads(res[0][0])
        orderObj["payment"] = tpe.fromid(orderObj["payment"])[1]
        orderObj["user"] = user.getdetails(None, orderObj["user"])[1]
        return [True, {"order": orderObj}, None]

    def gettoken(res):
        secret =  "ijshzgoubzsdogbzosengozwsbdg9ouigubnzwsoeg"
        ret = jwt.encode(res, str(secret)).decode('utf-8')
        return [True, ret, None]

    def tokendata(token = None):
        secret = "ijshzgoubzsdogbzosengozwsbdg9ouigubnzwsoeg"
        decoded = None
        try:
            decoded = jwt.decode(token, str(secret), algorithms=['HS256'])
        except:
            return  [False, "Invalid usr_token", 403]
        return [True, decoded, None]

    def send_mail(user_id, order_id, status, ukeys = None):
        text = "<h1>Your order "+order_id+" has been "+status+"</h1><br/>"
        if status == "accepted":
            idAndUkeys = ""
            style = """ style="border: 1px solid black;padding: 10px;">"""
            for floteur_id, ukey in ukeys.items():
                idAndUkeys += """<tr"""+style+"""
                    <td"""+style + floteur_id + """</td>
                    <td"""+style + ukey + """</td>
                </tr>"""
            text += """<br/>
            <table style="border-collapse: collapse;border: 1px solid black;">
                <tr"""+style+"""
                    <th"""+style+"""Device Id</th>
                    <th"""+style+"""Device Key</th>
                </tr>
                """+idAndUkeys+"""
            </table>"""
        elif status == "rejected":
            text += "<span>Please contact an administrator if you want more informations</span>"
        elif status == "confirmed":
            text += "<span>You can have more details in your dashboard (Section 'Your profile' > 'Orders')</span>"
        else:
            return [False, "Invalid status", 404]
        use = user(user_id)
        msg = MIMEText(text, 'html')
        msg['Subject'] = "[Wellcheck] - Order " + status
        return use.send_mail(msg)