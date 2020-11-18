FROM creepinson/alpine-pnpm

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN pnpm install

#
EXPOSE 3330
EXPOSE 3055

CMD ["/bin/sh", "entrypoint.sh"]
