from .order import order


class sim:

    def calc():
        res = {"description": None,
               "price":
                    { "amount": "110.00", "currency": "Eur"}
              }
        token = order.gettoken(res)
        res["cmd_token"] = token
        return [True, res, None]
