set -x NEW_RELIC_ATTRIBUTES_EXCLUDE "request.headers.cookie,request.headers.authorization"
set -x NEW_RELIC_ATTRIBUTES_INCLUDE "request.headers.*"
set -x NEW_RELIC_NO_CONFIG_FILE true
set -x NEW_RELIC_ALLOW_ALL_HEADERS true
set -x NEW_RELIC_APP_NAME sock-shop-frontend