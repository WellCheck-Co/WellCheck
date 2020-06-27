FROM python:latest AS BACK_END

LABEL maintainer="Courtel Eliot"
LABEL maintainermail="eliot.courtel@wanadoo.fr"

WORKDIR /home/api

RUN pip install --upgrade pip
COPY ./requirements.txt ./
RUN pip install --upgrade -r requirements.txt

ENTRYPOINT python3 server.py;
