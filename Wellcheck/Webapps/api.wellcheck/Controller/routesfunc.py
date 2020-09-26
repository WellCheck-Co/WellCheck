from Model.basic import check, auth
from Object.users import user
from Object.tpe import tpe
from Object.order import order
from Object.calc import sim
from Object.admin import admin
from Object.floteur import floteur
from Object.pdf import pdf_doc
import json
import os.path
import binascii
from os import path

def getauth(cn, nextc):
    err = check.contain(cn.pr, ["pass"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]
    err = auth.gettoken(cn.pr["pass"])
    return cn.call_next(nextc, err)

def myauth(cn, nextc):
    err = check.contain(cn.hd, ["token"], "HEAD")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.hd = err[1]
    err = auth.verify(cn.hd["token"])
    return cn.call_next(nextc, err)

def signup(cn, nextc):
    err = check.contain(cn.pr, ["email", "password1", "password2"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = user()
    err = use.register(cn.pr["email"], cn.pr["password1"], cn.pr["password2"])
    cn.private["user"] = use

    return cn.call_next(nextc, err)

def verifykey(cn, nextc):
    err = check.contain(cn.pr, ["key"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = user()
    err = use.verify_key(cn.pr["key"])
    cn.private["user"] = use
    return cn.call_next(nextc, err)

def signin(cn, nextc):
    err = check.contain(cn.pr, ["email", "password1"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = user()
    err = use.login(cn.pr["email"], cn.pr["password1"])
    cn.private["user"] = use

    return cn.call_next(nextc, err)

def check_act(cn, nextc):
    use = cn.private["user"]
    err = use.check_activation()
    return cn.call_next(nextc, err)

def authuser(cn, nextc):
    err = check.contain(cn.hd, ["usrtoken"], "HEAD")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.hd = err[1]

    use = user()
    err = use.verify(cn.hd["usrtoken"])
    cn.private["user"] = use

    return cn.call_next(nextc, err)

def gettoken(cn, nextc):
    err = check.contain(cn.pr, [])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = use.gettoken()
    return cn.call_next(nextc, err)

def changepassword(cn, nextc):
    err = check.contain(cn.pr, ["password1", "password2"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = use.changepass(cn.pr["password1"], cn.pr["password2"])
    return cn.call_next(nextc, err)

def infos(cn, nextc):
    use = cn.private["user"]
    err = use.getdetails()
    return cn.call_next(nextc, err)

def upinfos(cn, nextc):
    err = check.contain(cn.pr, ["firstname", "lastname", "phone"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = use.updetails(cn.pr["phone"], cn.pr["firstname"], cn.pr["lastname"])
    return cn.call_next(nextc, err)

def addcard(cn, nextc):
    err = check.contain(cn.pr, ["crd_token"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = tpe.addcard(cn.pr["crd_token"], use.id)
    return cn.call_next(nextc, err)

def delcard(cn, nextc):
    err = check.contain(cn.pr, ["crd_token"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = tpe.delcard(cn.pr["crd_token"], use.id)
    return cn.call_next(nextc, err)

def listcard(cn, nextc):
    use = cn.private["user"]
    err = tpe.userdetails(use.id)
    return cn.call_next(nextc, err)

def cmd_decode(cn, nextc):
    err = check.contain(cn.pr, ["cmd_token"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = order.tokendata(cn.pr["cmd_token"])
    if err[0]:
        cn.private["cmd"] = err[1]
    return cn.call_next(nextc, err)

def pay(cn, nextc):
    err = check.contain(cn.pr, ["crd_token"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = tpe.pay(cn.private["cmd"]["price"]["amount"], cn.pr["crd_token"], use.id)
    if err[0]:
        cn.private["pay_id"] = err[1]["id"]
    return cn.call_next(nextc, err)

def ordering(cn, nextc):
    use = cn.private["user"]
    err = order.do_order(use.id, cn.private["pay_id"], cn.private["cmd"])
    if err[0]:
        cn.private["order_id"] = err[1]["order_id"]
    return cn.call_next(nextc, err)

def payments(cn, nextc):
    use = cn.private["user"]
    err = tpe.payments(use.id)
    return cn.call_next(nextc, err)

def paymentdetails(cn, nextc):
    err = check.contain(cn.pr, ["chr_token"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = tpe.paymentdetails(cn.pr["chr_token"])
    return cn.call_next(nextc, err)

def orderdetails(cn, nextc):
    err = check.contain(cn.pr, ["order_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = order.orderdetails(cn.pr["order_id"])
    return cn.call_next(nextc, err)

def history(cn, nextc):
    use = cn.private["user"]
    err = order.orders(use.id)
    return cn.call_next(nextc, err)

def emulate(cn, nextc):
    err = check.contain(cn.pr, [])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = sim.calc()
    return cn.call_next(nextc, err)

def order_token(cn, nextc):
    err = check.contain(cn.pr, ["order"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = order.gettoken(cn.pr["order"])
    return cn.call_next(nextc, err)

def point_add(cn, nextc):
    err = check.contain(cn.pr, ["id_sigfox"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]
    cn.pr = check.setnoneopt(cn.pr, ["lng", "lat"])

    use = floteur(cn.private["user"].id)
    err = use.add(cn.pr["id_sigfox"], cn.pr["lat"], cn.pr["lng"])
    return cn.call_next(nextc, err)

def point_share(cn, nextc):
    err = check.contain(cn.pr, ["id_points", "email"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = floteur(cn.private["user"].id)
    err = use.share(cn.pr["id_points"], cn.pr["email"])
    return cn.call_next(nextc, err)

def point_rename(cn, nextc):
    err = check.contain(cn.pr, ["id_point", "surname"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = floteur(cn.private["user"].id)
    err = use.rename(cn.pr["id_point"], cn.pr["surname"])
    return cn.call_next(nextc, err)

def points_infos(cn, nextc):
    cn.pr = check.setnoneopt(cn.pr, ["id_points", "period_start", "period_end", "longlat", "range", "limit"])
    use = floteur(cn.private["user"].id)
    err = use.infos_points(cn.pr["id_points"],
                     cn.pr["period_start"],
                     cn.pr["period_end"],
                     cn.pr["longlat"],
                     cn.pr["range"],
                     cn.pr["limit"]
                     )
    return cn.call_next(nextc, err)

def point_infos(cn, nextc):
    err = check.contain(cn.pr, ["id_point"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]
    cn.pr = check.setnoneopt(cn.pr, ["period_start", "period_end", "limit"])
    use = floteur(cn.private["user"].id)
    err = use.infos_point(cn.pr["id_point"],
                     cn.pr["period_start"],
                     cn.pr["period_end"],
                     cn.pr["limit"]
                     )
    return cn.call_next(nextc, err)

def point_graph(cn, nextc):
    err = check.contain(cn.pr, ["id_point", "datas"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])

    use = floteur(cn.private["user"].id)
    err = use.graph_point(cn.pr["id_point"], cn.pr["datas"])
    return cn.call_next(nextc, err)

def points_shared(cn, nextc):
    use = floteur(cn.private["user"].id)
    err = use.my_shares()
    return cn.call_next(nextc, err)

def data_add(cn, nextc):
    err = check.contain(cn.pr, ["data", "sigfox_id", "point_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]
    err = check.contain(cn.pr["data"], ["data", "pos"], "data")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr["data"] = err[1]
    err = check.contain(cn.pr["data"]["data"], ["ph", "turbidity", "redox", "temp"], "data.data")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr["data"]["data"] = err[1]

    use = floteur()
    err = use.adddata(cn.pr["sigfox_id"],
                      cn.pr["point_id"],
                      cn.pr["data"]["data"]["ph"],
                      cn.pr["data"]["data"]["turbidity"],
                      cn.pr["data"]["data"]["redox"],
                      cn.pr["data"]["data"]["temp"],
                      cn.pr["data"]["pos"])
    return cn.call_next(nextc, err)

def pdf_report(cn, nextc):
    err = check.contain(cn.pr, ["points_id", "period_start", "period_end"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = pdf_doc()
    err = use.report(floteur(), cn.pr["points_id"], cn.pr["period_start"], cn.pr["period_end"])
    return cn.call_next(nextc, err)

def admtoken(cn, nextc):
    err = check.contain(cn.pr, ["password"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = admin.gettoken(cn.pr["password"])
    return cn.call_next(nextc, err)


def authadmin(cn, nextc):
    err = check.contain(cn.hd, ["admtoken"], "HEAD")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.hd = err[1]

    err = admin.verify(cn.hd["admtoken"])
    return cn.call_next(nextc, err)

def all_users(cn, nextc):
    err = admin.all_user()
    return cn.call_next(nextc, err)

def gettokenadm(cn, nextc):
    err = check.contain(cn.pr, ["usr_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = user(cn.pr["usr_id"])
    err = use.gettoken()
    return cn.call_next(nextc, err)

def sigfox_data_get(cn, nextc):
    f = open("test.txt", "r")
    sig_data = json.loads(f.read())
    f.close()
    err =  [True, {"last": sig_data}, None]
    return cn.call_next(nextc, err)

dataTypeBytes = {
    "Pression": {
        "bits": 12,
        "function": lambda x: (x + 8700) / 10,
        "unit": "hP"
    },
"Turbidity": {
        "bits": 10,
        "function": lambda x: x * 5 / 1024,
        "unit": "V"
    },
    "Temperature": {
        "bits": 10,
        "function": lambda x: x / 10,
        "unit": "°C"
    },
    "GPS_lat": {
        "bits": 20,
        "function": lambda x: round(x * (10 / 4)) / 10000,
        "unit": "°"
    },
    "GPS_long": {
        "bits": 19,
        "function": lambda x: round(x * (10 / 4)) / 10000,
        "unit": "°"
    },
    "GPS_long_sign": {
        "bits": 1,
        "function": lambda x: x,
        "unit": ""
    },
    "GPS_lat_sign": {
        "bits": 1,
        "function": lambda x: x,
        "unit": ""
    },
    "pH": {
        "bits": 7,
        "function": lambda x: x / 10,
        "unit": ""
    },
    "In Water": {
        "bits": 1,
        "function": lambda x: x,
        "unit": ""
    },
    "ORP / RedOx": {
        "bits": 10,
        "function": lambda x: round(x * (10 / 2)) - 2000,
        "unit": ""
    },
    "Antenna Battery": {
        "bits": 2,
        "function": lambda x: x * 25,
        "unit": "%"
    },
    "Floater Battery": {
        "bits": 2,
        "function": lambda x: x * 25,
        "unit": "%"
    },
}

def decompress(data):
    result = {}
    binary = "{0:096b}".format(int(data, 16))
    actualBit = 0
    for dataType, item in dataTypeBytes.items():
        print(dataType + " has " + str(item["bits"]) + " bit(s) and begin at bit " + str(actualBit))
        binaryValue = binary[actualBit:actualBit + item["bits"]]
        print("Binary value : " + binaryValue)
        decimalValue = int(binaryValue, 2)
        print("Decimal value : " + str(decimalValue))
        value = item["function"](decimalValue)
        print("Value : " + str(value) + item["unit"])
        print()
        actualBit += item["bits"]
        result[dataType] = value
    return result

def sigfox_data_add(cn, nextc):
    f = open("test.txt", "w")
    if cn.pr and "data" in cn.pr:
        cn.pr["data"] =  decompress(cn.pr["data"])
    f.write(json.dumps(cn.pr))
    f.close()
    err = [True, {}, None]
    return cn.call_next(nextc, err)

def add_address(cn, nextc):
    err = check.contain(cn.pr, ["address"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = tpe.addaddress(cn.pr["address"], use.id)
    return cn.call_next(nextc, err)

def list_addresses(cn, nextc):
    use = cn.private["user"]
    err = tpe.listaddresses(use.id)
    return cn.call_next(nextc, err)

def del_address(cn, nextc):
    err = check.contain(cn.pr, ["address_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = tpe.deladdress(cn.pr["address_id"])
    return cn.call_next(nextc, err)

def get_address(cn, nextc):
    err = check.contain(cn.pr, ["address_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = cn.private["user"]
    err = tpe.getaddress(use.id, cn.pr["address_id"])
    return cn.call_next(nextc, err)

def get_new_orders(cn, nextc):
    err = order.orders(None, True)
    return cn.call_next(nextc, err)

def accept_order(cn, nextc):
    err = check.contain(cn.pr, ["order_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = admin.accept_or_reject_order(cn.pr["order_id"], True)
    if err[0]:
        cn.private["ukeys"] = err[1]["ukeys"]
    return cn.call_next(nextc, err)

def reject_order(cn, nextc):
    err = check.contain(cn.pr, ["order_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = admin.accept_or_reject_order(cn.pr["order_id"], False)
    return cn.call_next(nextc, err)

def send_mail_accepted(cn, nextc):
    err = check.contain(cn.pr, ["user_id", "order_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = order.send_mail(cn.pr["user_id"], cn.pr["order_id"], "accepted", cn.private["ukeys"])
    return cn.call_next(nextc, err)

def send_mail_rejected(cn, nextc):
    err = check.contain(cn.pr, ["user_id", "order_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    err = order.send_mail(cn.pr["user_id"], cn.pr["order_id"], "rejected")
    return cn.call_next(nextc, err)

def send_confirm_mail(cn, nextc):
    err = order.send_mail(cn.private["user"].id, cn.private["order_id"], "confirmed")
    return cn.call_next(nextc, err)
