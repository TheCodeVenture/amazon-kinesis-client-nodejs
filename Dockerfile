FROM amazonlinux:latest

WORKDIR /src

RUN amazon-linux-extras install java-openjdk11
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum install -y nodejs

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run dev