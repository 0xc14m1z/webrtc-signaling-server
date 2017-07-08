source .env

ssh $USERNAME@$HOST 'pm2 startup systemd'
ssh $USERNAME@$HOST "sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USERNAME --hp /home/$USERNAME"
