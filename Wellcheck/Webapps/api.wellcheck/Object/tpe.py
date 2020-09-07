import stripe
import time
import os
from .sql import sql

stripe.api_key = str(os.getenv('STRIPE_PRIV', None))

class tpe:
    def addcard(token, user_id):
        card = {}
        stripe_id = tpe.__getcus(user_id)
        if stripe_id is None:
            res = sql.get("SELECT `email` FROM `user` WHERE `id` = %s", (user_id))
            if len(res) == 0:
                return [False, "invalid user", 403]
            email = str(res[0][0])
            try:
                customer = stripe.Customer.create(source=token, email=email)
            except:
                return [False, "Invalid card token: " + token, 400]
            succes = sql.input("INSERT INTO `userstripes` (`id`, `user_id`, `stripe_id`) VALUES (NULL, %s, %s)", \
            (user_id, customer["id"]))
            if not succes:
                return [False, "data input error", 500]
            card = customer["sources"]["data"][0]
        else:
            try:
                card = stripe.Customer.create_source(stripe_id, source=token)
            except:
                return [False, "Invalid card token", 401]
        return [True, {'card': tpe.__formatcard(card)}, None]

    def delcard(card_token, user_id):
        stripe_id = tpe.__getcus(user_id)
        if stripe_id is None:
            return [False, "user have no card", 401]
        try:
            deleted = stripe.Customer.delete_source(stripe_id, card_token)
        except:
            return [False, "Invalid card token", 401]
        return [True, {"deleted": deleted}, None]

    def userdetails(user_id):
        card = {}
        stripe_id = tpe.__getcus(user_id)
        if stripe_id is None:
            return [True, {"cards": []}, None]
        cards = stripe.Customer.list_sources(stripe_id)
        return [True, {"cards": tpe.__formatcards(cards)}, None]

    def pay(amount, source, user_id):
        stripe_id = tpe.__getcus(user_id)
        if stripe_id is None:
            return [False, "user have no card", 401]
        try:
            charge = stripe.Charge.create(amount=int(float(amount)*100),currency='eur',
                                          customer=stripe_id,source=source)
        except:
            return [False, "Invalid card token", 401]
        charge =  tpe.__formatcharge(charge)
        date = str(int(round(time.time() * 1000)))
        succes = sql.input("INSERT INTO `paymentstripe` (`id`, `user_id`, `chr_token`, `amount`, `date`) VALUES (NULL, %s, %s, %s, %s)", \
        (user_id, charge["chr_token"], charge["amount"], date))
        if not succes:
            return [False, "data input error", 500]
        id = -1
        try:
            id = sql.get("SELECT `id` FROM `paymentstripe` WHERE `chr_token` = %s", (charge["chr_token"]))[0][0]
        except:
            return [False, "data input error", 500]
        return [True, {"charge": charge, "id": id}, None]

    def payments(user_id):
        res = sql.get("SELECT `user_id`, `chr_token`, `amount`, `date` FROM `paymentstripe` WHERE `user_id` = %s", (user_id))
        payments = []
        for i in res:
            payments.append({
                "chr_token": i[1],
                "amount": "{0:.2f}".format(i[2]),
                "date": i[3]
            })
        return [True, {"payments": payments}, None]

    def paymentdetails(chr_token):
        res = None
        try:
            res = stripe.Charge.retrieve(chr_token)
        except:
            return [False, "Invalid charge token", 401]
        return [True, tpe.__formatcharge(res), None]

    def fromid(pay_id):
        try:
            chr_token = sql.get("SELECT `chr_token` FROM `paymentstripe` WHERE `id` = %s", (pay_id))[0][0]
        except:
            return [False, "Invalid pay id", 401]
        return tpe.paymentdetails(chr_token)

    def addaddress(address, user_id):
        if len(address["name"]) > 50 or len(address["country"]) > 30 or len(address["city"]) > 30 or\
            len(address["address"]) > 100 or len(address["complement"]) > 100 or len(address["postal_code"]) > 5:
            return [False, "The length of an input is too long", 500]
        if not address["postal_code"].isnumeric():
            return [False, "Postal code needs to be numeric", 500]
        succes = False
        try:
            succes = sql.input("INSERT INTO `addresses` (`user_id`, `name`, `country`, `city`, `address`, `complement`, `postal_code`) VALUES (%s, %s, %s, %s, %s, %s, %s)", \
                (user_id, address['name'], address["country"], address["city"], address["address"], address["complement"], address["postal_code"]))
        except Exception as e:
            return [False, str(e), 500]
        if not succes:
            return [False, "Data input error", 500]
        return [True, {"address": address}, None]

    def deladdress(address_id):
        try:
            deleted = sql.input("DELETE FROM `addresses` WHERE `id` = %s", (address_id))
        except:
            return [False, "Invalid address id", 404]
        return [True, {"deleted": deleted}, None]

    def listaddresses(user_id):
        addresses = []
        res = sql.get("SELECT * FROM `addresses` WHERE `user_id` = %s", (user_id))
        for i in res:
            addresses.append({
                "id": i[0],
                "name": i[2],
                "country": i[3],
                "city": i[4],
                "address": i[5],
                "complement": i[6],
                "postal_code": i[7]
            })
        return [True, {"addresses": addresses}, None]

    def getaddress(user_id, address_id):
        res = sql.get("SELECT * FROM `addresses` WHERE `user_id` = %s AND `id` = %s", (user_id, address_id))
        if len(res) == 0:
            return [False, "Invalid address id / user id match", 400]
        address ={
            "id": res[0][0],
            "name": res[0][2],
            "country": res[0][3],
            "city": res[0][4],
            "address": res[0][5],
            "complement": res[0][6],
            "postal_code": res[0][7]
        }
        return [True, {"address": address}, None]

    def __getcus(user_id):
        res = sql.get("SELECT `stripe_id` FROM `userstripes` WHERE `user_id` = %s", (user_id))
        if len(res) == 0:
            return None
        return str(res[0][0])

    def __formatcards(cards):
        ret = []
        for i in cards:
            ret.append(tpe.__formatcard(i))
        return ret

    def __formatcard(card):
        card = {
        "crd_token": card["id"],
        "brand": card["brand"],
        "country": card["country"],
        "exp_month": card["exp_month"],
        "exp_year": card["exp_year"],
        "last4": card["last4"],
        }
        return card

    def __formatcharge(charge):
        charge = {
        "chr_token": charge["id"],
        "amount": "{0:.2f}".format(round(charge["amount"] / 100, 2)),
        "paid": charge["paid"],
        "source": tpe.__formatcard(charge["source"]),
        "paid": charge["paid"]
        }
        return charge
