import json
import time
from .sql import sql
from .tpe import tpe
import jwt
from datetime import datetime

class order:
    def do_order(user_id, pay_id, details):
        date = str(int(round(time.time() * 1000)))
        try:
            details = json.dumps(details)
        except:
            return [False, "Invalid json", 401]
        succes = sql.input("INSERT INTO `orders` (`id`, `user_id`, `payment_id`, `status_id`, `date`) VALUES (NULL, %s, %s, %s, %s)", \
        (user_id, pay_id, order.getstatus("toValidate")[1]["id"], date))
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

    def orders(user_id):
        res = sql.get("SELECT `id`, `date`, `status_id`  FROM `orders` WHERE `user_id` = %s", (user_id))
        orders = []
        for i in res:
            orders.append({
                "id": i[0],
                "date": datetime.fromtimestamp(float(i[1]) / 1000.0).strftime("%Y-%m-%d %I:%M%p"),
                "status": order.getstatus(i[2])[1]
            })
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

    def orderdetails(user_id, order_id):
        orderObj = {}
        res = sql.get("SELECT `id`, `date`, `payment_id`, `status_id` FROM `orders` WHERE `id` = %s AND user_id = %s", (order_id, user_id))
        if len(res) == 0:
            return [False, "Invalid order id / user id match", 400]
        orderObj["id"] = res[0][0]
        orderObj["date"] = datetime.fromtimestamp(float(res[0][1]) / 1000.0).strftime("%Y-%m-%d %I:%M%p")
        orderObj["payment"] = res[0][2]
        orderObj["status"] = order.getstatus(res[0][3])[1]
        res = sql.get("SELECT `json` FROM `orderdetails` WHERE `order_id` = %s", (order_id))
        if len(res) == 0:
            return [False, "Invalid order id", 400]
        orderObj["details"] = json.loads(res[0][0])
        orderObj["payment"] = tpe.fromid(orderObj["payment"])[1]
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
