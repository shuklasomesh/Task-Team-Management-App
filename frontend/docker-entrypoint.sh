#!/bin/sh
# Validate required environment variables
if [ -z "$BACKEND_URL" ]; then
  echo "ERROR: BACKEND_URL environment variable is not set. Nginx proxy_pass requires a full URL (e.g., http://host:port)."
  exit 1
fi

if [ -z "$PORT" ]; then
  echo "WARNING: PORT not set, defaulting to 80"
  export PORT=80
fi

# Substitute $BACKEND_URL and $PORT into nginx config at container startup
envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
