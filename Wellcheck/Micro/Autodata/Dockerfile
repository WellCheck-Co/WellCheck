FROM python:latest AS AUTODATA

LABEL maintainer="Courtel Eliot"
LABEL maintainermail="eliot.courtel@wanadoo.fr"

WORKDIR /home/autodata
RUN  apt-get update && apt-get install cron -y

RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --upgrade -r requirements.txt


COPY ./init.sh ./
COPY ./adddata.py ./

RUN chmod +x /home/autodata/init.sh && \
    chmod +x /home/autodata/adddata.py


ENTRYPOINT bash ./init.sh
