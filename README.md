# webrtc-signaling-server

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