FROM nginx

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

WORKDIR /usr/share/nginx/html

COPY . .

RUN chmod -R 777 /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]