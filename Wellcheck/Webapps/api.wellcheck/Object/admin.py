from .sql import sql
import json, datetime, time, jwt, os
from .order import order
from .floteur import floteur

class admin:
    def gettoken(mypass):
        password =  str(os.getenv('API_ADM', None))
        if password == '':
            return [False, "Admin functionnalities disabled", 501]
        if mypass != password:
            return [False, "Invalid password", 400]
        secret =  password + "kjb3qrbouwabO_)Oiqen123fgo9ubQP3BRTKQbgcoinQO&*"
        exp = datetime.datetime.utcnow() + datetime.timedelta(hours=48)
        ret = jwt.encode({'exp': exp, 'password': hash(password + secret)}, secret).decode('utf-8')
        return [True, {'exp': str(exp), "admtoken": str(ret)}, None, {"admtoken": str(ret)}]

    def verify(token):
        password =  str(os.getenv('API_ADM', None))
        secret =  password + "kjb3qrbouwabO_)Oiqen123fgo9ubQP3BRTKQbgcoinQO&*"
        try:
            decoded = jwt.decode(token, secret, leeway=10, algorithms=['HS256'])
            if decoded["password"] != hash(password + secret) or password == '':
                 raise
        except jwt.ExpiredSignature:
            return [False, "Signature expired", 403]
        except:
            return  [False, "Invalid admtoken", 403]
        return [True, {}, None]

    def all_user():
        ret = []
        users_id = sql.get("SELECT `id` FROM `user`", None)
        for i in users_id:
            details = {
            "id": str(i[0]),
            "email": None,
            "firstname": "",
            "lastname": "",
            "phone": "",
            "date": None
            }
            res = sql.get("SELECT `fname`, `lname`, `phone` FROM `userdetails` WHERE `user_id` = %s", (i[0]))
            if len(res) > 0:
                details["firstname"] = str(res[0][0])
                details["lastname"] = str(res[0][1])
                details["phone"] = str(res[0][2])
            res = sql.get("SELECT `email`, `date` FROM `user` WHERE `id` = %s", (i[0]))
            if len(res) > 0:
                details["email"] = str(res[0][0])
                details["date"] = str(res[0][1])
            ret.append(details)
        return [True, {"users": ret, "total": len(ret)}, None]

    def accept_or_reject_order(order_id, accepted):
        status = order.getstatus(("processing" if accepted else "rejected"))[1]
        succes = sql.input("UPDATE `orders` SET `status_id` = %s WHERE `id` = %s", (status["id"], order_id))
        if not succes:
            return [False, "Data input error", 500]
        if not accepted:
            return [True, {"order_id": order_id}, None]
        orderInfos = order.orderdetails(order_id)[1]["order"]
        devicesNumber = orderInfos["details"]["devicesNumber"]
        flot = floteur(orderInfos["user"]["id"])
        ukeys = {}
        for i in range(int(devicesNumber)):
            err = flot.add("tmp", 48.8589507, 2.3522)
            if err[0]:
                ukeys[err[1]["floteur_id"]] = err[1]["ukey"]
        return [True, {"ukeys": ukeys}, None]