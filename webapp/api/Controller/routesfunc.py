from Model.basic import check, auth
from Object.users import user
from Object.tpe import tpe
from Object.order import order
from Object.calc import sim
from Object.admin import admin
from Object.floteur import floteur
import json

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

def signin(cn, nextc):
    err = check.contain(cn.pr, ["email", "password1"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = user()
    err = use.login(cn.pr["email"], cn.pr["password1"])
    cn.private["user"] = use

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

    use = cn.private["user"]
    err = order.orderdetails(use.id, cn.pr["order_id"])
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

def point_add(cn, nextc):
    err = check.contain(cn.pr, ["id_sig"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = floteur(cn.private["user"].id)
    err = use.add(cn.pr["id_sig"])
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
    err = check.contain(cn.pr, ["data", "sig_id", "point_id"])
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.pr = err[1]

    use = floteur()
    err = use.adddata(cn.pr["data"], cn.pr["sig_id"], cn.pr["point_id"])
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
