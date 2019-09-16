#!/bin/bash
docker-compose down
docker-compose up -d --build
docker-compose run rest python /src/manage.py migrate
