FROM collinestes/docker-node-oracle:8
MAINTAINER paul.green@dlink.com
RUN apt-get update && apt-get install -y \
    nano \
    git \
 && rm -rf /var/lib/apt/lists/*
RUN git config --global credential.helper "cache --timeout 7200"
RUN npm install -g pm2
COPY ./configs/bash/bash.bashrc /etc/bash.bashrc
COPY ./configs/bash/DIR_COLORS /etc/DIR_COLORS
COPY ./configs/bash/.bashrc /root/.bashrc
COPY ./configs/secret/tnsnames.ora /opt/oracle/instantclient/network/admin/
COPY . /app
WORKDIR /app/src
RUN npm install
CMD ["pm2-runtime", "index.js"]
