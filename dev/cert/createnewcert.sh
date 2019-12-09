#!/usr/bin/env bash

openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days -999 -in csr.pem -signkey key.pem -out server.crt
cp server.crt certificate.pem
