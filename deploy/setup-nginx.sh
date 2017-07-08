source .env

scp nginx.conf $USERNAME@$HOST:/tmp
ssh -t $USERNAME@$HOST 'sudo cp /tmp/nginx.conf /etc/nginx/sites-enabled/default && sudo service nginx reload'
