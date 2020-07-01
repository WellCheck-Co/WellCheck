# Wellcheck

## 1. Launch the project

**In order to run the project using localhost, create :**

- `.env` file:
  * Path: `#docker-compose/`
  * Content :
    ```bash
    API_MOD=DEV
    #API DEBUG MOD
    
    DOMAIN=localhost
    #the domain your deploying on
    
    EMAIL=eliot.courtel@wanadoo.fr 
    #a mail to be used in let's encrypt
    
    DB_USER=wellcheck 
    #a database username
    DB_PASS=1q2W3e4R 
    #a database password

    STRIPE_PRIV=XXXXXX 
    #your stripe private key
    ```

- `conf.js` file:
  * Path: `Wellcheck\Webapps\dashboard.wellcheck\front\js`
  * Content:
    ```javascript
    var address = "localhost"; //the domain your deploying on
    var api = "api." + address;
    var method = "http"; //method, use https if yout not in localhost
    var redirect = "/map"; //base page
    ```


**You're ready to deploy the infrastructure**

* ```bash
  cd \#docker-compose/; \
  docker-compose -f docker-compose.reverse.proxy.yml      up -d; \
  docker-compose -f docker-compose.wellcheck.web.yml      up -d; \
  docker-compose -f docker-compose.wellcheck.services.yml up -d; \
  docker-compose -f docker-compose.wellcheck.admin.yml    up -d;
  ```

**Lastly:**

* Go to `http://admin.${YOUR_DOMAIN}/phpmyadmin/` and import `./webapp/db/sql/dumps/wellcheck.sql` into the **wellcheck**'s database
* Go to `http://admin.${YOUR_DOMAIN}/elastic/` and create the `point` index
* Go to `http://admin.${YOUR_DOMAIN}/elastic/app/kibana#/dev_tools/console` and input
  ```
  PUT /point_test/_settings
  { "index" : { "max_inner_result_window" : 10000000 } }
  ```
**You can know use the landing page, the dashboard and the api properly !**


## 2. Administrate the project

There are multiple functionnalities available to manage your project, for exemple **goaccess** available at `http://admin.${YOUR_DOMAIN}/stats/` allow you to see up-to-date statistics of your website

To use this service you'll need to create a few files:

- `${YOUR_DOMAIN}_location` file:
  * Path: `Proxy/vhost/`
  * Content:
    ```perl
    access_log  /customlogs/${YOUR_DOMAIN}.log  main;
    ```

- `api.${YOUR_DOMAIN}_location` file:
  * Path: `Proxy/vhost/`
  * Content:
    ```perl
    access_log  /customlogs/api.${YOUR_DOMAIN}.log  main;
    ```

- `dashboard.${YOUR_DOMAIN}_location` file:
  * Path: `Proxy/vhost/`
  * Content:
    ```perl
    access_log  /customlogs/dashboard.${YOUR_DOMAIN}.log  main;
    ```

Feel free to add anylog services exposed to the outworld by adding an `_location` file into `Proxy/vhost/`, don't forget to add the proper command to the `goaccesscli` container's entrypoint:
```perl
entrypoint: "watch `goaccess /logs/${DOMAIN}.log -o /results/${DOMAIN}.html --log-format=COMBINED;
                    goaccess /logs/dashboard.${DOMAIN}.log -o /results/dashboard${DOMAIN}.html --log-format=COMBINED;
                    goaccess /logs/api.${DOMAIN}.log -o /results/api${DOMAIN}.html --log-format=COMBINED;
                    ${YOUR_COMMAND};`
                "
```
**⚠️ Warning : `DOMAIN` env variable refer to the one define in `.env`**

Composition of the command is: `goaccess ${LOGFILE} -o {HTML_OUTPUT} --logformat=COMBINED`

## 3. Secure your project

To secure the project you can use *Basic Auth* by simply using
```bash
htpasswd -c ./proxy/passwd/${THE_DOMAIN_TO_PROTECT} ${YOUR_USER}
```
(For example `htpasswd -c Proxy/passwd/admin.localhost test`)
