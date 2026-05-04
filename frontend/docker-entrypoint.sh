#!/bin/sh
# Substitute $BACKEND_URL into nginx config at container startup
envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
