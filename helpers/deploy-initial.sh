source .env

npm run deploy:upload
ssh $USERNAME@$HOST 'npm install && NODE_ENV=production pm2 start server.js && pm2 save'
