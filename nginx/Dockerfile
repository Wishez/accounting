FROM ubuntu:14.04
MAINTAINER Filipp Zhuravlev (shiningfinger@list.ru)

# install nginx
RUN apt-get update -y
RUN apt-get install -y python-software-properties
RUN apt-get install -y software-properties-common
RUN add-apt-repository -y ppa:nginx/stable
RUN apt-get update -y
RUN apt-get install -y nginx

# deamon mode off
RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
RUN chown -R www-data:www-data /var/lib/nginx

# volume
VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/var/log/nginx"]

# expose ports
EXPOSE 8443

# add nginx conf
COPY ./conf.d/ /etc/nginx/conf.d/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./locale /etc/nginx/conf.d/locale

WORKDIR /etc/nginx

CMD ["nginx"]