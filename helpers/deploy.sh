source .env

ssh $USERNAME@$HOST 'pm2 delete server'
npm run deploy:initial
