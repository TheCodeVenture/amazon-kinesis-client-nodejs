FROM amazonlinux:latest

WORKDIR /src

RUN amazon-linux-extras install java-openjdk11
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum install -y nodejs

COPY package*.json ./

RUN npm install

COPY . .

CMD "./bin/kcl-bootstrap --java /usr/bin/java -e -p ./samples/basic_sample/consumer/logging_consumer.properties"