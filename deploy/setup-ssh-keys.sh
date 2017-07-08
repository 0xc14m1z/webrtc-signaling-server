source .env

cat $SSH_KEY_PATH | ssh $USERNAME@$HOST 'cat >> ~/.ssh/authorized_keys'
