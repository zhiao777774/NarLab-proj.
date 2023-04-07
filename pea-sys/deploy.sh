npm run build
sudo rm -r ~/nar/build
sudo cp -r build/ ~/nar
sudo rm -r /var/www/html
sudo mkdir /var/www/html
sudo cp -r ./build/* /var/www/html