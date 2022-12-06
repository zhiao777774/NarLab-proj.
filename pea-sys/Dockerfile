# image build phase
FROM node
WORKDIR /myapp
COPY package.json .
RUN npm install
COPY . .
# container running phase
ENTRYPOINT ["npm", "start"]
