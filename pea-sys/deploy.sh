git reset --hard origin
git pull
npm run build
sudo cp -r ./build/* ~/../../var/www/html