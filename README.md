# webrtc-signaling-server

## work locally

To test the signaling server locally, you must have installed `nodejs`.

If you have it:

- clone the repo with just `git clone git@github.com:ciamiz/webrtc-signaling-server.git`;
- `cd` into the project folder;
- run `npm install` to get the dependencies;
- run `npm start` to launch the server.

---

**Tip**: if you don't have a tool to communicate with the signaling server using the web sockets, you can `wscat`.
Install it globally with `npm install -g wscat`, then launch it with `wscat -c ws://localhost:8888`.

## requirements for setup and deploy

In order to be able to properly setup an hosting server and then deploy the application to it, you must have a `.env` file
where you specifiy these environment variables:

- `SSH_KEY_PATH`: which should contain the path to your public ssh key, usually `~/.ssh/id_rsa.pub`;
- `HOST`: which should be the ip address of the hosting server;
- `USERNAME`: which represents the username of the application user on the hosting server.


## hosting server setup

The production server is a `nodejs` installation upon `ubuntu server 16.04` (not 17.04, nodejs isn't supported very well, yet). It'll use the `pm2` package to manage the application process during it's entire lifecycle.

### setting up the application user

Once logged in as `root`, first of all retrieve and apply tha latest software updates with:

```
apt-get update
apt-get upgrade -y
```

Then create a user for the application and add it to the `sudoers` group:

```
adduser app
```

Change `app` with whatever username you like. From now on, remember to update it with the name you choose in this step.

You'll be asked to provide a password for the new user and to confirm it.

You will also be asked of a bunch of information about the user that you probably never use, so skip them all hitting the `ENTER` key 10<sup>42</sup> times until the shell prompt appears again.

Created the user, add it to the sudoers group with:

```
adduser app sudo
```

**Optional**

If you don't want to be bothered with password asking for `sudo` commands via SSH or during the deploy process, run:

```
echo 'app ALL=NOPASSWD: ALL' >> /etc/sudoers
```

### install software dependencies

The application need the latest version of:

- `nginx` as reverse proxy;
- `nodejs` as application server;
- `pm2` as node process manager.

Login into the server as the brand new application user and install `nginx` with:

```
sudo apt-get install nginx -y
```

If the installation finish without throwing errors, you should see something like "Welcome do nginx!" visiting the server ip address through the web browser.

The next step is the installation of `nodejs`, the application server, with:

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs -y
```

Check that the installation went well with `node -v`. You should see something like `v8.x.x`.

The last software needed to properly run the signaling server is `pm2`, node process manager. This package provides an easy way to manage and daemonize node applications.

```
sudo npm install -g pm2
```

The `-g` option tells `npm` to install the module globally, so that it's available system-wide.

Verify that pm2 has been installed correctly running `pm2 -v`. An ASCII art welcome message should confirm you that everything has been done correctly.

### environment configuration

First of all we have to allow remote users to log into the server without password, using ssh keys. In order to achieve this, we have to generate the ssh keys for the server itself running:

```
ssh-keygen -t rsa
```

You'll be asked where to store the new key and if you'd like to setup a passphrase. Let's just hit `ENTER` right now and complete the creation of the keys.

---

**Attention**: before moving on, check the the required .env file contains the required variables. In the next helper scripts isn't yet provided any form of error handling. Also, you have to be sure that all the helper scripts are executable running `npm run config:scripts`.

---

To proceed with the configuraion, we first have to exchange our local ssh keys with the server using the `npm` helper script `npm run config:ssh`.

Once done the exchange, running `npm run config:nginx` will setup the reverse proxy. By default, it will listen on port 80 reversing to the 8888. If you want to change this values, look at the `nginx.conf:12` and `server.js:2` files.

We now have to set the process manager to start on boot:

```
npm run config:pm2
```

## deploy

**Attention**: it is assumed that you have already make all the scripts executable with `npm run config:scripts` and exchanged keys with the server running `npm run config:ssh`.

---

The deploy process consists in a single command. It changes whether it is the first deploy ever or a next one. If it's the first time you deploy the application on a new server, you have to run:

```
npm run deploy:initial
```

If, instead, is a deploy on the already-running application, use

```
npm run deploy
```