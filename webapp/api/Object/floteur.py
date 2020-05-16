import json, time
import uuid
from .sql import sql
from .elastic import es
import requests
import hashlib
import random
from elasticsearch import helpers


class floteur:
    def __init__(self, usr_id = -1):
        self.usr_id = str(usr_id)

    def add(self, id_sig):
        id_sig = str(id_sig)
        if (id_sig != "-1"):
            return [False, "Invalid Sigfox_id", 400]
        if (id_sig == "-1"):
            number = sql.get("SELECT COUNT(*) FROM `point` WHERE id_user = %s AND id_sig = -1", (self.usr_id))[0][0]
            if number > 2:
                return [False, "Can't have more than 3 test devices", 401]
            name = "test_" + str(number + 1)
        else:
            number = sql.get("SELECT COUNT(*) FROM `point` WHERE id_user = %s", (self.usr_id))[0][0]
            name = "point_" + str(number + 1)
        date = str(int(round(time.time() * 1000)))
        succes = sql.input("INSERT INTO `point` (`id`, `id_user`, `id_sig`, `name`, `surname`, `date`) VALUES (NULL, %s, %s, %s, %s, %s)", \
        (int(self.usr_id), id_sig, name, name, date))
        if not succes:
            return [False, "data input error", 500]
        return [True, {}, None]

    def delete(self, id_points):
        return

    def rename(self, id_point, surname):
        if not self.__exist(id_point):
            return [False, "Invalid point_id: '" + id_point + "'", 400]
        succes = False
        if self.__proprietary(id_point):
            succes = sql.input("UPDATE `point` SET surname = %s WHERE id = %s AND id_user = %s", (surname, id_point, self.usr_id))
        elif self.__shared(id_point):
            succes = sql.input("UPDATE `point_shared` SET surname = %s WHERE id_point = %s AND id_user = %s", (surname, id_point, self.usr_id))
        else:
            return [False, "Invalid right", 403]
        if not succes:
            return [False, "data input error", 500]
        return [True, {}, None]

    def share(self, id_points, email):
        if not isinstance(id_points, list):
            return [False, "Id_points should be a list", 400]
        for id_point in id_points:
            if not self.__exist(id_point):
                return [False, "Invalid id_point: id_point : '" + str(id_point) + "'", 400]
            succes = False
            if self.__proprietary(id_point):
                id_to = sql.get("SELECT id FROM `user` WHERE email = %s", (email))
                if len(id_to) < 1:
                    return [False, "Invalid email: '" + email + "'", 400]
                id_to = str(id_to[0][0])
                if id_to == self.usr_id:
                    return [False, "Can't share to yourself: id_point : '" + str(id_point) + "'", 401]
                if self.__shared(id_point, id_to):
                    return [False, "Already shared with: '"+ email +"'", 401]
                date = str(int(round(time.time() * 1000)))
                number = sql.get("SELECT COUNT(*) FROM `point_shared` WHERE id_user = %s", (id_to))[0][0]
                name = "point_" + str(number)
                succes =  sql.input("INSERT INTO `point_shared` (`id`, `id_user`, `id_point`, `date`, `surname`) VALUES (NULL, %s, %s, %s, %s)", \
                (id_to, id_point, date, name))
                if not succes:
                    return [False, "data input error", 500]
            else:
                return [False, "Invalid right : id_point : '" + str(id_point) + "'", 403]
        return [True, {}, None]

    def my_shares(self):
        res = sql.get("SELECT point_shared.id_point, user.email, point_shared.date FROM point_shared INNER JOIN user ON point_shared.id_user = user.id INNER JOIN point ON point_shared.id_point = point.id WHERE point.id_user = %s", (self.usr_id))
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
              id_points = None,
              period_start = None,
              period_end = None,
              longlat = None,
              range = None,
              limit = None):
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
             propdetail[str(i)]["data"] = propdata[str(i)] if str(i) in propdata else []
             ret["proprietary"].append(propdetail[str(i)])
        for i in shar:
             shardetail[str(i)]["data"] = shardata[str(i)] if str(i) in shardata else []
             ret["shared"].append(shardetail[str(i)])
        return [True, {"points": ret}, None]

    def infos_point(self, id_point, period_start, period_end, limit = 100000000):
        if not self.__exist(id_point):
            return [False, "Invalid id_point: '" + str(id_point) + "'", 400]
        status = "proprietary" if self.__proprietary(id_point) else "shared" if self.__shared(id_point) else None
        if not status:
            return [False, "Invalid right", 403]
        ret = self.__get_point(status, details=True)[str(id_point)]
        res = self.__infos_query([id_point], period_start, period_end, limit)
        ret["data"] = res[str(id_point)] if str(id_point) in res else []
        return [True, ret, None]

    def graph_point(self, id_point, datas):
        if not isinstance(datas, list):
            return [False, "Datas should be a list", 400]
        basetime = int(time.time() * 1000)
        ret = {}
        ret["chart1"] = self.__graph(id_point, ["note"], basetime - 86400000, basetime)["note"]
        ret["chart2"] = self.__graph(id_point, datas, basetime - 86400000, basetime)
        ret["chart3"] = self.__graph(id_point, datas)
        res = {"label": [], "data": []}
        for i in ret["chart1"]["data"]:
            res["label"].append(i["t"])
            res["data"].append(i["y"])
        ret["chart1"]["data"] = res
        return [True, ret, None]

    def upval(self, num, der, rou, max, min, mod = None):
        randNbr = random.randrange(-der * 100, der * 100 + 1, mod * 100 if mod else 1)/100
        if num + randNbr < min or num + randNbr > max:
            randNbr *= -1
        if rou != 0:
            f = "{0:."+str(rou)+"f}"
            ret = float(f.format(num + randNbr))
        else:
            ret = int(num + randNbr)
        return ret

    def note(self, ph, turb, orp, temp):
        ph_point = 1.4*10**-32-29.3*ph+8.19*ph**2-0.56*ph**3
        ph_point = 0 if float(ph_point) < float(0) else 5 if float(ph_point) > float(5) else ph_point
        orp_point = -3.39*10**-32-0.0846*turb+6.73*10**-4*turb**2-1.12*10**-6*turb**3
        orp_point = 0 if float(ph_point) < float(0) else 5 if float(ph_point) > float(5) else ph_point
        temp_point = 5.83+0.235*temp-0.0241*temp**2
        temp_point = 0 if float(orp_point) < float(0) else 6 if float(orp_point) > float(6) else orp_point
        turb_point = 0 if float(turb) < float(921) else 3
        return float("{0:.1f}".format(ph_point + orp_point + temp_point + turb_point))

    def inputrandom(self, id_point, id_sig, data, date):
        ph = 7
        turbidity = 1000
        redox = 300
        temp = 5
        datebis = date
        inputs = []
        for i in range(0, 1003):
            ph = self.upval(ph, 0.2, 1, 12.8, 0)
            turbidity = self.upval(turbidity, 4, 0, 1024, 0, 5)
            redox = self.upval(redox, 2, 1, 400, 220)
            temp = self.upval(temp, 0.3, 1, 25, 1)
            datebis = datebis - 900000
            inputs.append({
              "_index": "point_test",
              "_type": "_doc",
              "_id": str(id_sig) + str(id_point) + str(i),
              "_score": 1,
              "_source": {
                            "id_sig": id_sig,
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

    def adddata(self, data, id_sig, id_point):
        id_sig = self.__hash(id_sig)
        id_point = id_point
        date = int(round(time.time() * 1000))
        if "pos" not in data or not data["pos"]:
            return [False, "Missing index 'pos' inside data", 400]
        if "lon" not in data['pos'] or "lat" not in data['pos']:
            return [False, "Missing inbex 'lon' or 'lat' inside data.pos", 400]
        if data["data"] == -1:
            input = self.inputrandom(id_point, id_sig, data, date)
        else:
            input={
                "id_sig": id_sig,
                "id_point": id_point,
                "data": data,
                "date": date
            }
            res = es.index(index='point_test',body=input)
        return [True, {"data_added": input}, None]



    def __exist(self, id_point):
        ret = False
        try:
            if sql.get("SELECT COUNT(*) FROM `point` WHERE id = %s", (id_point))[0][0] > 0:
                ret = True
        except:
            ret = False
        return ret

    def __proprietary(self, id_point):
        ret = False
        try:
            if sql.get("SELECT COUNT(*) FROM `point` WHERE id_user = %s AND id = %s", (self.usr_id, id_point))[0][0] > 0:
                ret = True
        except:
            ret = False
        return ret

    def __shared(self, id_point, id_user = None):
        ret = False
        try:
            if sql.get("SELECT COUNT(*) FROM `point_shared` WHERE id_user = %s AND id_point = %s", (id_user if id_user else self.usr_id, id_point))[0][0] > 0:
                ret = True
        except:
            ret = False
        return ret

    def __get_point(self, type = "proprietary", details = False):
        res = []
        if type == "proprietary":
            if details:
                res = sql.get("SELECT `id`, `id_sig`, `name`, `surname`, `date` FROM `point` WHERE id_user = %s", (self.usr_id))
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
                res = sql.get("SELECT id FROM `point` WHERE id_user = %s", (self.usr_id))
                ret = []
                for i in res:
                    ret.append(i[0])
        elif type == "shared":
            if details:
                res = sql.get("SELECT point.id, point.id_sig, point.name, point_shared.surname, point_shared.date FROM `point_shared` INNER JOIN `point` ON `id_point` = point.id WHERE point_shared.id_user = %s", (self.usr_id))
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
                res = sql.get("SELECT id_point FROM `point_shared` WHERE id_user = %s", (self.usr_id))
                ret = []
                for i in res:
                    ret.append(i[0])
        return ret

    def __graph(self, id_point, datas, date_start = None, date_end = None,limit = None):
        id_point = [id_point]
        range = {"from": "0"}
        if date_start:
            range["from"] = str(date_start)
        if date_end:
            range["to"] = str(date_end)
        limit = limit if limit else 10000000
        query = {
          "size": -1,
          "aggs" : {
            "date_range" : {
              "range" : { "field" : "date", "ranges" : [range]},
              "aggs": {
                "dedup" : {
                  "filter": {"terms": {"id_point": id_point}},
                      "aggs": {
                        "dedup" : {
                          "terms":{"field": "id_point"},
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
        for i in datas:
            ret[i] = []
        for i in res["aggregations"]["date_range"]["buckets"][0]["dedup"]["dedup"]["buckets"]:
            for i2 in i["top_sales_hits"]["hits"]["hits"]:
                for i in datas:
                    if ("date" in i2["_source"] and i in i2["_source"]["data"]["data"]):
                        ret[i].append({"t": int(i2["_source"]["date"]), "y": float(i2["_source"]["data"]["data"][i])})
        res = ret
        ret = {}
        model = {
        "ph": {"max_x" : 8, "min_x": 6, "opt": {"high": 7.6, "low": 6.2}},
        "note": {"max_x" : 19, "min_x": 0}
        }
        for i in datas:
            if i in res and len(res[i]) > 0:
                opt = []
                max_y = res[i][0]["t"]
                min_y = res[i][len(res[i]) - 1]["t"]
                max_x = res[i][0]["y"]
                min_x = res[i][0]["y"]
                if i in model:
                    max_x = model[i]["max_x"] if "max_x" in model[i] else max_x
                    min_x = model[i]["min_x"] if "min_x" in model[i] else min_x
                    max_y = model[i]["max_y"] if "max_y" in model[i] else max_y
                    min_y = model[i]["min_y"] if "min_y" in model[i] else min_y
                    opt   = model[i]["opt"]   if "opt"   in model[i] else opt
                for i2 in res[i]:
                    if   i2["y"] > max_x:
                        max_x =  i2["y"]
                    elif i2["y"] < min_x:
                        min_x =  i2["y"]
                ret[i] = { "data": res[i], "limits": {"y": {"min": min_y, "max": max_y}, "x": {"min": min_x - 1 if min_x >= 1 else 0, "max": max_x + 1}, "opt": opt}}
            else:
                ret[i] = {"data": [], "limits": {"y": {"min": 0, "max": 0}, "x": {"min":0, "max":0}, "opt": []}}
        return ret

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
                  "filter": {"terms": {"id_point": id_points}},
                      "aggs": {
                        "dedup" : {
                          "terms":{"field": "id_point"},
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
