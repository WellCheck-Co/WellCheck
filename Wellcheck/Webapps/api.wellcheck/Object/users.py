import json, datetime, time
import jwt
import hashlib
import time
import base64
import os
import re
import phonenumbers
from .mail import Mailer
from .sql import sql

class user:
    def __init__(self, id = -1):
        self.id = str(id)

    def gettoken(self, id = None):
        id = self.__getid(id, self.id)
        secret =  self.__getsecret()
        exp = datetime.datetime.utcnow() + datetime.timedelta(hours=48)
        ret = jwt.encode({'exp': exp,
                          'id': id,
                          'password': hash(str(id) + str(secret))
                         }, secret).decode('utf-8')
        return [True, {'exp': str(exp), "usrtoken": str(ret)}, None, {"usrtoken": str(ret)}]

    def verify(self, token, id = None):
        secret = self.__getsecret()
        try:
            decoded = jwt.decode(token, secret, leeway=10, algorithms=['HS256'])
            id = self.__getid(id, decoded["id"])
            if decoded["password"] != hash(str(id) + str(secret)):
                 raise
            self.id = id
        except jwt.ExpiredSignature:
            return [False, "Signature expired", 403]
        except:
            return  [False, "Invalid usrtoken", 400]
        return [True, {}, None]

    def verify_key(self, key):
        arr_key = key.split("|")
        if len(arr_key) < 2:
            return [False, "Invalid key", 400]
        email = base64.b64decode(str.encode(arr_key[0])).decode("utf-8")
        password = arr_key[1]
        res = sql.get("SELECT `id`, `password`, `valid` \
                       FROM `user` \
                       WHERE `email` = %s",
                       (email))
        if len(res) != 1:
            return [False, "Invalid user or key: " + email, 400]
        if self.__activationkey(email, res[0][1]) != key:
            return [False, "Invalid user or key: "+ self.__activationkey(email, res[0][1]), 400]
        if int(res[0][2]) != 0:
            return [False, "Acccount already activated", 400]
        succes = sql.input("UPDATE `user` SET valid = 1 WHERE `email` = %s", (email))
        if not succes:
            return [False, "data input error", 500]
        self.id = res[0][0]
        return [True, {}, None]

    def check_activation(self, id = None):
        id = self.__getid(id, self.id)
        res = sql.get("SELECT `valid`  FROM `user` WHERE `id` = %s", (id))
        if len(res) < 1:
            return [False, "Verification error", 500]
        if int(res[0][0]) == 1:
            return [True, {}, None]
        return [False, "Invalid right, activate your account", 401]

    def register(self, email, pass1, pass2, role = 0):
        if pass1 != pass2:
            return [False, "Passwords do not match", 400]
        if self.__exist(email):
            return [False, "Email already in use", 400]
        if not self.__email(email):
            return [False, "Invalid email", 400]

        password = self.__hash(email, pass1)
        date = str(int(round(time.time() * 1000)))
        succes = sql.input("INSERT INTO `user` (`id`, `role`, `email`, `password`, `date`, `valid`) VALUES (NULL, %s, %s, %s, %s, %s)", \
        (0, email, password, date, 0))
        if not succes:
            return [False, "data input error", 500]
        key = self.__activationkey(email, password)
        try:
            Mailer().new_user(email, key, int(date)/1000)
        except:
            sql.input("DELETE FROM `user` WHERE `email` = %s", (email))
            return [False, "Registration error", 500]
        return [True, {}, None]

    def login(self, email, password):
        password = self.__hash(email, password)
        res = sql.get("SELECT `id`  FROM `user` WHERE `email` = %s AND `password` = %s", (email, password))
        if len(res) > 0:
            self.id = str(res[0][0])
            return [True, {"user_id": self.id}, None]
        return [False, "Invalid email or password", 403]

    def updetails(self, phone, fname, lname):
        if phone != "":
            try:
                phone = phonenumbers.format_number(phonenumbers.parse(str(phone), 'FR'),
                                                   phonenumbers.PhoneNumberFormat.INTERNATIONAL)
            except phonenumbers.phonenumberutil.NumberParseException:
                return [False, "Invalid phone number", 403]
        phone = phone.replace(" ", "")

        succes = sql.input("INSERT INTO `userdetails` (`id`, `user_id`, `fname`, `lname`, `phone`) \
                            VALUES (NULL, %s, %s, %s, %s) ON DUPLICATE KEY \
                            UPDATE `fname` = %s, `lname` = %s, `phone` = %s",
                 (self.id, str(fname), str(lname), phone, str(fname), str(lname), phone))
        if not succes:
            return [False, "data input error", 500]
        return [True, {}, None]

    def getdetails(self):
        details = {
        "email": None,
        "firstname": None,
        "lastname": None,
        "phone": None,
        "date": None
        }
        res = sql.get("SELECT `fname`, `lname`, `phone` FROM `userdetails` WHERE `user_id` = %s", (self.id))
        if len(res) > 0:
            details["firstname"] = str(res[0][0])
            details["lastname"] = str(res[0][1])
            details["phone"] = str(res[0][2])
        res = sql.get("SELECT `email`, `date` FROM `user` WHERE `id` = %s", (self.id))
        if len(res) > 0:
            details["email"] = str(res[0][0])
            details["date"] = str(res[0][1])
        return [True, details , None]

    def __activationkey(self, email, password):
        return base64.b64encode(str.encode(email)).decode("utf-8")  + '|' + hashlib.sha512((email + password).encode('utf-8')).hexdigest()

    def __hash(self, email, password):
        if password is None or email is None:
            return None
        s = len(email)
        n = s % (len(password) - 1 if len(password) > 1 else 1)
        secret = self.__getsecret()
        salted = password[:n] + str(s) + password[n:] + secret
        hashed = hashlib.sha512(salted.encode('utf-8')).hexdigest()
        return hashed

    def __exist(self, email):
        res = sql.get("SELECT `id`  FROM `user` WHERE `email` = %s", (email))
        if len(res) > 0:
            return True
        return False

    def __getsecret(self):
        return str(os.getenv('API_SCRT', '!@ws4RT4ws212@#%'))

    def __getid(self, id, idbis = None):
        return id if id != "-1" and id is not None else idbis if idbis is not None else self.id

    def __email(self, email):
        return re.match("[^@]+@[^@]+\.[^@]+", email)
