import json, time
import uuid
from .sql import sql
from .mail import Mailer
from .elastic import es
import requests
import hashlib
import random
import math
from elasticsearch import helpers


class floteur:
    def __init__(self, usr_id=-1):
        self.usr_id = str(usr_id)

    def add(self, id_sigfox, lat = None, lng = None):
        id_sigfox = str(id_sigfox)
        date = str(int(round(time.time() * 1000)))
        uid = str(uuid.uuid4()).upper().split("-")
        id_point = uid[0]
        if (id_sigfox == "-1"):
            if lat is None or lng is None:
                return [False, "Missing lat or lng", 400]
            number = sql.get("SELECT COUNT(*) FROM `point` WHERE id_user = %s AND id_sigfox = -1", (self.usr_id))[0][0]
            if number > 2:
                return [False, "Can't have more than 3 test devices", 401]
            name = "test_" + str(number + 1)
            data = {"data": None, "pos": {"lat": lat, "lng": lng}}
            input = self.inputrandom(id_point, self.__hash(id_sigfox), data, date) #input random test data
        else:
            number = sql.get("SELECT COUNT(*) FROM `point` WHERE id_user = %s", (self.usr_id))[0][0]
            name = "point_" + str(number + 1)
            if id_sigfox != "tmp":
                return [False, "Invalid Sigfox_id", 400]
        ukey = uid[1]
        succes = sql.input("INSERT INTO `point` (`id`, `id_user`, `id_sigfox`, `ukey`, `name`, `surname`, `date`) VALUES (%s, %s, %s, %s, %s, %s, %s)", \
        (id_point, self.usr_id, id_sigfox, ukey, name, name, date))
        if not succes:
            return [False, "data input error", 500]
        if id_sigfox == "-1":
            id_sigfox = self.__hash(id_sigfox)
            data = {"data": None, "pos": {"lat": lat, "lng": lng}}
            input = self.inputrandom(id_point, id_sigfox, data, date)
        return [True, {"ukey": ukey, "floteur_id": id_point}, None]

    def delete(self,
               id_points):
        return

    def rename(self,
               id_point,
               surname):
        """
            rename a float for a user

            float should be shared to the user or owned by user
        """
        if not self.__exist(id_point):
            return [False, "Invalid point_id: '" + id_point + "'", 400]
        succes = False
        if self.__proprietary(id_point):
            succes = sql.input("UPDATE `point` \
                SET surname = %s \
                WHERE id = %s \
                AND id_user = %s",
                (surname, id_point, self.usr_id))
        elif self.__shared(id_point):
            succes = sql.input("UPDATE `point_shared` \
                SET surname = %s \
                WHERE id_point = %s \
                AND id_user = %s",
                (surname, id_point, self.usr_id))
        else:
            return [False, "Invalid right", 403]
        if not succes:
            return [False, "Data input error", 500]
        return [True, {}, None]

    def share(self,
              id_points,
              email):
        """
            share a list of float to a user

            the user must be the owner of the float
        """
        if not isinstance(id_points, list):                                     #check the type of args
            return [False, "Id_points should be a list", 400]
        for id_point in id_points:
            if not self.__exist(id_point):
                return [False, "Invalid id_point:'" + str(id_point) + "'", 400]
            succes = False
            if self.__proprietary(id_point):
                id_to = sql.get("SELECT \
                    id FROM `user` \
                    WHERE email = %s",
                    (email,))
                if len(id_to) < 1:
                    return [False, "Invalid email: '" + str(email) + "'", 400]
                id_to = str(id_to[0][0])
                if id_to == self.usr_id:
                    return [False, "Can't share to yourself: '" + str(id_point) + "'", 401]
                if self.__shared(id_point, id_to):
                    return [False, "Already shared with: '"+ email +"'", 401]
                date = self.__time()
                number = sql.get("SELECT \
                    COUNT(*) \
                    FROM `point_shared` \
                    WHERE id_user = %s",
                    (id_to,))[0][0]
                name = "point_" + str(number)
                id_share = str(uuid.uuid4())
                succes =  sql.input("INSERT \
                    INTO `point_shared` \
                    (`id`, `id_user`, `id_point`, `date`, `surname`) \
                    VALUES (%s, %s, %s, %s, %s)",
                    (id_share, id_to, id_point, date, name))
                if not succes:
                    return [False, "Data input error", 500]
            else:
                return [False, "Invalid right : '" + str(id_point) + "'", 403]
        return [True, {}, None]

    def my_shares(self):
        """
            return wich float that the user own he shares and to who
        """
        res = sql.get("SELECT \
            point_shared.id_point, user.email, point_shared.date \
            FROM point_shared \
            INNER JOIN user \
            ON point_shared.id_user = user.id \
            INNER JOIN point \
            ON point_shared.id_point = point.id \
            WHERE point.id_user = %s",
            (self.usr_id,))
        ret = {}
        for i in res:
            index = str(i[0])
            if index not in ret:
                ret[index] = []
            ret[index].append({
                "email": i[1],
                "date": i[2]
            })
        return [True, {"shares": ret} , None]

    def infos_points(self,
              id_points=None,
              period_start=None,
              period_end=None,
              longlat=None,
              range=None,
              limit=None):
        """
            return main infos about floats

            default return last 5 data off all your floats, shared and owned
        """
        if period_end and period_start:
            if period_start > period_end:
                return [False, "'period_start' should be before 'period_end'", 400]

        prop = self.__get_point("proprietary")
        shar = self.__get_point("shared")

        if id_points:
             prop = list(set(prop).intersection(id_points))
             shar = list(set(shar).intersection(id_points))

        propdetail = self.__get_point("proprietary", details=True)
        shardetail = self.__get_point("shared", details=True)
        propdata = self.__infos_query(prop, period_start, period_end, limit)
        shardata = self.__infos_query(shar, period_start, period_end, limit)

        ret = {
            "proprietary": [],
            "shared": []
        }
        for i in prop:
             if str(i) in propdata:
                 propdetail[str(i)]["data"] = propdata[str(i)]
             else:
                 propdetail[str(i)]["data"] = []
             ret["proprietary"].append(propdetail[str(i)])
        for i in shar:
             if str(i) in shardata:
                 shardetail[str(i)]["data"] = shardata[str(i)]
             else:
                 shardetail[str(i)]["data"] = []
             ret["shared"].append(shardetail[str(i)])

        return [True, {"points": ret}, None]

    def infos_point(self, id_point, period_start, period_end, limit = 100000000):
        """
            return main infos about one float
        """
        if not self.__exist(id_point):
            return [False, "Invalid id_point: '" + str(id_point) + "'", 400]
        if self.__proprietary(id_point):
            status = "proprietary"
        elif self.__shared(id_point):
            status = "shared"
        else:
            return [False, "Invalid right", 403]

        ret = self.__get_point(status, details=True)[str(id_point)]
        res = self.__infos_query([id_point], period_start, period_end, limit)
        ret["data"] = res[str(id_point)] if str(id_point) in res else []

        return [True, ret, None]

    def graph_point(self, id_point, data):
        """
            return data of one float in order to build graphs
        """
        basetime = int(time.time() * 1000)
        ret = {}
        prop = self.__get_point("proprietary")
        shar = self.__get_point("shared")
        propdetail = self.__get_point("proprietary", details=True)
        propdata = self.__infos_query(prop, None, None, 1)
        shardata = self.__infos_query(shar, None, None, 1)
        ret["chart0"] = {'Test': [0, 0, 0], 'Your\'s': [0, 0, 0], 'Shared with you': [0, 0, 0]}
        for i in prop:
            index = 2 - math.floor(propdata[str(i)][0]["data"]["data"]["note"] / 7)
            if propdetail[str(i)]["test"]:
                ret["chart0"]["Test"][index] += 1
            else:
                ret["chart0"]["Your\'s"][index] += 1
        for i in shar:
            index = 2 - math.floor(shardata[str(i)][0]["data"]["data"]["note"] / 7)
            ret["chart0"]["Shared with you"][index] += 1
        ret["chart1"], ret["chart2"], ret["chart3"] = self.__graph(id_point, data, basetime - 86400000, basetime)
        return [True, ret, None]

    def upval(self, num, der, rou, max, min, mod = None):
        """
            check border value for random input
        """
        randNbr = random.randrange(-der * 100, der * 100 + 1, mod * 100 if mod else 1)/100
        if num + randNbr < min or num + randNbr > max:
            randNbr *= -1
        if rou != 0:
            f = "{0:."+str(rou)+"f}"
            ret = float(f.format(num + randNbr))
        else:
            ret = int(num + randNbr)
        return ret

    def pdf_report(self, id_points, date_start = None, date_end = None, limit = 10000000):
        res = sql.get("SELECT `id`, `id_sigfox`, `name`, `surname`, `id_user` FROM `point` WHERE id = %s", (id_points[0]))
        ret = {}
        for i in res:
            ret[str(i[0])] = {
                    "id": i[0],
                    "sigfox_id": i[1],
                    "name": i[2],
                    "surname": i[3],
                    "user_id": i[4]
                }
        data = self.__infos_query(id_points, date_start, date_end, limit)
        return [True, {"detail": ret, "data": data}, None]

    def note(self, ph, turb, orp, temp):
        """
            calculate a mark from all mesurement
        """
        ph_point = 1.4 * 10 ** -32 - 29.3 * ph + 8.19 * ph ** 2 - 0.56 * ph ** 3
        ph_point = 0 if float(ph_point) < float(0) else 5 if float(ph_point) > float(5) else ph_point
        orp_point = -3.39 * 10 ** -32 - 0.0846 * turb + 6.73 * 10 ** -4 * turb ** 2 - 1.12 * 10 ** -6 * turb ** 3
        orp_point = 0 if float(ph_point) < float(0) else 5 if float(ph_point) > float(5) else ph_point
        temp_point = 5.83 + 0.235 * temp - 0.0241 * temp ** 2
        temp_point = 0 if float(orp_point) < float(0) else 6 if float(orp_point) > float(6) else orp_point
        turb_point = 0 if float(turb) < float(921) else 3
        return float("{0:.1f}".format(ph_point + orp_point + temp_point + turb_point))

    def inputrandom(self, id_point, id_sigfox, data, date):
        """
            input one data set each 15 minutes 1004 times for a given float
        """
        ph = 7
        turbidity = 1000
        redox = 300
        temp = 5
        datebis = int(date) + 900000
        inputs = []
        for i in range(0, 1004):
            ph = self.upval(ph, 0.2, 1, 12.8, 0)
            turbidity = self.upval(turbidity, 4, 0, 1024, 0, 5)
            redox = self.upval(redox, 2, 1, 400, 220)
            temp = self.upval(temp, 0.3, 1, 25, 1)
            datebis = datebis - 900000
            inputs.append({
              "_index": "point_test",
              "_type": "_doc",
              "_id": str(id_sigfox) + str(id_point) + str(i),
              "_score": 1,
              "_source": {
                            "id_sigfox": id_sigfox,
                            "id_point": id_point,
                            'data': {
                               'data': {
                                   "ph": ph,
                                   "turbidity": turbidity,
                                   "redox": redox,
                                   "temp": temp,
                                   "note": self.note(ph, turbidity, redox, temp)
                               },
                               'pos': data["pos"]
                               },
                            "date": datebis
                        }
              })
        helpers.bulk(es, inputs)
        return inputs[0]

    def adddata(self, id_sigfox, id_point, ph, turbidity, redox, temp, pos):
        """
            add manually a data set for a given float
        """
        id_sigfox = self.__hash(id_sigfox)
        id_point = id_point
        date = int(round(time.time() * 1000))
        if "lng" not in pos or "lat" not in pos:
            return [False, "Missing inbex 'lon' or 'lat' inside pos", 400]
        note = self.note(ph, turbidity, redox, temp)
        input={
                "id_sigfox": id_sigfox,
                "id_point": id_point,
                'data': {
                   'data': {
                       "ph": ph,
                       "turbidity": turbidity,
                       "redox": redox,
                       "temp": temp,
                       "note": note
                   },
                   'pos': pos
                   },
                "date": date
            }
        res = es.index(index='point_test',body=input)
        act = []
        if note < 5 :
            maillist = ["eliot.courtel@gmail.com"]
            point_name = ""
            Mailer().alerte(maillist, point_name, id_point, date/1000, note)
            act.append({"email": [maillist, point_name, id_point, date/1000, note]})
        return [True, {"data_added": input, "actions": act}, None]

    # def pref_mail(self, id_point, mail = 0):
    #     if not self.__exist(id_point):
    #         return [False, "Invalid id_point: id_point : '" + str(id_point) + "'", 404]
    #     if not self.__proprietary(id_point) and not self.__shared(id_point):
    #         return [False, "Invalid right : id_point : '" + str(id_point) + "'", 403]
    #     ##to do
    #     succes = sql.input("INSERT INTO `point_mail` (`id`, `user_id`, `id_point`, `mail`) \
    #                         VALUES (NULL, %s, %s, %s) ON DUPLICATE KEY \
    #                         UPDATE `mail` = %s",
    #              (self.id, str(id_point), mail, mail))
    #     if not succes:
    #         return [False, "data input error", 500]
    #     return [True, {}, None]

    def __time(self):
        """
            return a timestamp
        """
        return str(int(round(time.time() * 1000)))

    def __exist(self, id_point):
        """
            check if a float exist
        """
        ret = False
        try:
            if sql.get("SELECT \
                COUNT(*) \
                FROM `point` \
                WHERE id = %s",
                (id_point))[0][0] > 0:
                ret = True
        except:
            ret = False
        return ret

    def __proprietary(self, id_point):
        """
            check if user is owner
        """
        ret = False
        try:
            if sql.get("SELECT \
                COUNT(*) \
                FROM `point` \
                WHERE id_user = %s \
                AND id = %s",
                (self.usr_id, id_point))[0][0] > 0:
                ret = True
        except:
            ret = False
        return ret

    def __shared(self, id_point, id_user = None):
        """
            check if float is shared to the owner
        """
        ret = False
        try:
            if sql.get("SELECT \
                COUNT(*) \
                FROM `point_shared` \
                WHERE id_user = %s \
                AND id_point = %s",
                (id_user if id_user else self.usr_id, id_point))[0][0] > 0:
                ret = True
        except:
            ret = False
        return ret

    def __get_point(self, type = "proprietary", details = False):
        """
            return points by type ('proprietary' or 'shared')
        """
        res = []
        if type == "proprietary":
            if details:
                res = sql.get("SELECT `id`, `id_sigfox`, `name`, `surname`, `date` FROM `point` WHERE id_user = %s", (self.usr_id))
                ret = {}
                for i in res:
                    ret[str(i[0])] = {
                            "id": i[0],
                            "test": True if i[1] == -1 else False,
                            "name": i[2],
                            "surname": i[3],
                            "date": i[4]
                        }
            else:
                res = sql.get("SELECT \
                    `id` \
                    FROM `point` \
                    WHERE id_user = %s",
                    (self.usr_id))
                ret = []
                for i in res:
                    ret.append(i[0])
        elif type == "shared":
            if details:
                res = sql.get("SELECT \
                    point.id, point.id_sigfox, point.name, \
                    point_shared.surname, point_shared.date \
                    FROM `point_shared` \
                    INNER JOIN `point` \
                    ON `id_point` = point.id \
                    WHERE point_shared.id_user = %s",
                    (self.usr_id))
                ret = {}
                for i in res:
                    ret[str(i[0])] = {
                            "id": i[0],
                            "test": True if i[1] == -1 else False,
                            "name": i[2],
                            "surname": i[3],
                            "date": i[4]
                        }
            else:
                res = sql.get("SELECT \
                    `id_point` \
                    FROM `point_shared` \
                    WHERE id_user = %s",
                    (self.usr_id))
                ret = []
                for i in res:
                    ret.append(i[0])
        return ret

    def __graph(self, id_point, data, date_start = None, date_end = None,limit = None):
        """
            retrun data to build graph for a given float
        """
        id_point = [id_point]
        range = {"from": "0"}
        if date_start:
            range["from"] = str(date_start)
        if date_end:
            range["to"] = str(date_end)
        limit = limit if limit else 10000000
        query = {
          "size": 0,
          "aggs" : {
            "dedup" : {
              "filter": {
                "terms": {
                  "id_point.keyword":id_point
                }
              },
              "aggs": {
                "date_range" : {
                  "range" : {
                    "field" : "date",
                    "ranges" :
                      [range]
                  },
                  "aggs": {
                    "per_hour": {
                      "date_histogram": {
                        "field": "date",
                        "fixed_interval": "2h"
                      },
                      "aggs": {
                        "note": {
                          "avg": {
                            "field": "data.data.note"
                          }
                        },
                        data: {
                          "avg": {
                            "field": "data.data." + data
                          }
                        }
                      }
                    },
                    "min" : {
                      "min" : {
                        "field" : "data.data." + data
                      }
                    },
                    "max" : {
                      "max" : {
                        "field" : "data.data." + data
                      }
                    }
                  }
                },
                "per_day": {
                  "date_histogram": {
                    "field": "date",
                    "fixed_interval": "12h"
                  },
                  "aggs": {
                    data: {
                      "avg": {
                        "field": "data.data." + data
                      }
                    }
                  }
                },
                "min" : {
                  "min" : {
                    "field" : "data.data." + data
                  }
                },
                "max" : {
                  "max" : {
                    "field" : "data.data." + data
                  }
                }
              }
            }
          }
        }
        es.indices.refresh(index="point_test")
        res = es.search(index="point_test", body=query)["aggregations"]

        model = {
            "ph":        {"max_x" : 9,   "min_x": 6,   "opt": {"high": 8.2, "low": 6.5 }},
            "turbidity": {"max_x" : 5.5, "min_x": 4,   "opt": {"high": 5,   "low": 4.5 }},
            "temp":      {"max_x" : 25,  "min_x": 0,   "opt": {"high": 20,  "low": 1   }},
            "redox":     {"max_x" : 500, "min_x": 150, "opt": {"high": 400, "low": 220 }},
            "note":      {"max_x" : 19,  "min_x": 0,   "opt": {"high": 20,  "low": 15  }},
        }
        d_opt = model[data]
        n_opt = model["note"]

        dat = res["dedup"]["date_range"]["buckets"][0]["per_hour"]["buckets"]
        if len(dat) != 0:
            min_date = dat[0]["key"]
            max_date = dat[len(dat) - 1]["key"]
        else:
            max_date = 0
            min_date = 0
        min_data = res["dedup"]["date_range"]["buckets"][0]["min"]["value"]
        min_data = d_opt["min_x"] if min_data is  None else min_data
        min_data = d_opt["min_x"] if d_opt["min_x"] < min_data else min_data
        min_data = 0 if min_data < 1 else min_data - 1
        max_data = res["dedup"]["date_range"]["buckets"][0]["max"]["value"]
        max_data = d_opt["max_x"] if max_data is  None else max_data
        max_data = (d_opt["max_x"] if d_opt["max_x"] > max_data else max_data) + 1

        ret1 = {"data": {"data": [], "label": []}, "limits": {"y": {"min": min_date, "max": max_date}, "x": {"min": n_opt["min_x"], "max": n_opt["max_x"]}, "opt": n_opt["opt"]}}
        ret2 = { data: {"data": [], "limits": {"y": {"min": min_date, "max": max_date}, "x": {"min": min_data, "max": max_data}, "opt": d_opt["opt"]}}}
        i = 0
        while i < len(dat):
            ret1["data"]["data"].append(dat[i]["note"]["value"])
            ret1["data"]["label"].append(dat[i]["key"])
            ret2[data]["data"].append({"y": dat[i][data]["value"], "t": dat[i]["key"]})
            i += 1

        dat = res["dedup"]["per_day"]["buckets"]
        if len(dat) != 0:
            min_date = dat[0]["key"]
            max_date = dat[len(dat) - 1]["key"]
        else:
            max_date = 0
            min_date = 0
        min_data = res["dedup"]["min"]["value"]
        min_data = d_opt["min_x"] if min_data is  None else min_data
        min_data = d_opt["min_x"] if d_opt["min_x"] < min_data else min_data
        min_data = 0 if min_data < 1 else min_data - 1
        max_data = res["dedup"]["max"]["value"]
        max_data = d_opt["max_x"] if max_data is  None else max_data
        max_data = (d_opt["max_x"] if d_opt["max_x"] > max_data else max_data) + 1

        ret3 = { data: {"data": [], "limits": {"y": {"min": min_date, "max": max_date}, "x": {"min": min_data, "max": max_data}, "opt": d_opt["opt"]}}}

        i = 0
        while i < len(dat):
            ret3[data]["data"].append({"y": dat[i][data]["value"], "t": dat[i]["key"]})
            i += 1
        return ret1, ret2, ret3

    def __infos_query(self, id_points, date_start = None, date_end = None, limit = None):
        range = {"from": "0"}
        if date_start:
            range["from"] = str(date_start)
        if date_end:
            range["to"] = str(date_end)
        limit = limit if limit else 5
        query = {
          "size": -1,
          "aggs" : {
            "date_range" : {
              "range" : { "field" : "date", "ranges" : [range]},
              "aggs": {
                "dedup" : {
                  "filter": {"terms": {"id_point.keyword": id_points}},
                      "aggs": {
                        "dedup" : {
                          "terms":{"field": "id_point.keyword"},
                          "aggs": {
                            "top_sales_hits": {
                              "top_hits": {
                                "sort": [{"date": {"order": "desc"}}],
                                "_source": {"includes": [ "date", "data" ]},
                                "size" : limit
                              }
                            }
                          }
                        }
                      }
                    }
                }
            }
          }
        }
        es.indices.refresh(index="point_test")
        res = es.search(index="point_test", body=query)
        ret = {}
        for i in res["aggregations"]["date_range"]["buckets"][0]["dedup"]["dedup"]["buckets"]:
            ret[str(i["key"])] = []
            for i2 in i["top_sales_hits"]["hits"]["hits"]:
                if "date" in i2["_source"]:
                    i2["_source"]["date"] = str(i2["_source"]["date"])
                ret[str(i["key"])].append(i2["_source"])
        return ret

    def __hash(self, string):
        return  None if not string else hashlib.sha256(str(string).encode('utf-8')).hexdigest()
