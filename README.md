<h1 align="center"> 
EVENT SERVICES
</h1>
<p align="center">Express.js application to create Event Services [ Event Driven Microservices Architecture ] .</p>


<h2 align='center'>
<a href='https://get-youtube-subscribers-eight.vercel.app/' target="_blank">Application</a>
</h2>

## Table of Contents

- [Introduction ](#introduction)
- [Features ](#features)
- [Tech Stack ](#tech-stack)
- [Prerequisites ](#prerequisites)
- [Installation & Run](#installation-and-run)
- [About Me](#about-me)
- [Contact ](#contact)



## Introduction

Event-Driven Microservices with Kafka using Express.js and mongoDb
Welcome to the Event-Driven Microservices with Kafka project! This repository demonstrates the implementation of a robust, scalable, and decoupled microservices architecture using Apache Kafka as the core messaging system. Kafka's event streaming capabilities allow services to communicate asynchronously and reliably, ensuring real-time data processing and seamless integration.




## Features
- OrderService

- API Endpoint for Placing Orders: Exposes a RESTful API endpoint (/place-order) where users can place orders by providing necessary order details.

- Kafka Producer: 
Sends order details as messages to the Kafka topic orders upon receiving a request to place an order.

- Input Validation and Error Handling: 
Validates incoming order requests and handles errors gracefully, such as invalid input data or missing order details.

- Docker Integration:
 Contains a Dockerfile to build the OrderService container for consistent deployment.

- Unit Tests: 
Includes comprehensive unit tests to ensure the reliability and correctness of the order placement functionality.

- InventoryService

- Kafka Consumer: 
Listens to the orders Kafka topic for incoming order messages.
Inventory Management: Processes received orders by updating the inventory count for the ordered items.

- Error Handling: 
Includes robust error handling mechanisms for scenarios such as non-existent items or insufficient inventory, logging appropriate messages for each case.

- Logging: 
Logs messages indicating the successful processing of orders or any errors encountered during processing.

- Docker Integration:
 Contains a Dockerfile to build the InventoryService container for consistent deployment.

- Unit Tests:
 Includes comprehensive unit tests to ensure the reliability and correctness of inventory management functionality.

## Prerequisites
Ensure you have the following installed on your machine:

- Docker

- Docker Compose

- Node.js (for local development and testing)


## Tech Stack

OrderService/InventoryService

Language: JavaScript (Node.js)

Framework: Express.js - For building the
 RESTful API endpoint to place orders.

Database: MongoDB - For storing order details and managing order-related data.

Message Broker: Apache Kafka - For sending order messages to the orders topic.

Containerization: Docker - For containerizing the service.

Testing: Jest - For writing and running unit tests.


## Installation and Run
Prerequisites
```

Ensure you have the following installed on your machine:

- Docker

- Docker Compose

- Node.js (for local development and testing)
- Confluent Kafka (for local development and testing)
```
Docker Configuration

1. Dockerfile for OrderService:
```
FROM node:18

# Set working directory
WORKDIR /orderservices-app1

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the application
CMD ["npm", "start"]

```

     
    
2.  Dockerfile for InventoryService:
```
FROM node:18

# Set working directory
WORKDIR /inventoryservices-app1

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the application
CMD ["npm", "start"]
```


    
3. Docker Compose Configuration:
```
version: '3.9'
services:
  zookeeper:
    container_name: zookeeper
    image: wurstmeister/zookeeper:latest
    ports:
      - 2181:2181
    # networks:
    #   - my_network
  kafka:
    container_name: kafka
    image: wurstmeister/kafka:latest
    ports:
     - 9092:9092
    volumes:
      - ./data/kafka:/var/run/docker.sock
    environment:
      - KAFKA_ADVERTISED_HOST_NAME=kafka
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS= PLAINTEXT://kafka:9092
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR= 1
    # networks:
    #   - my_network

  mongo:
      container_name: mongo
      image: mongo
      ports:
       - 27017:27017
      volumes:
       - ./data/mongo:/data/db
  <!-- postgres:
      container_name: postgres_16
      image: postgres:16
      ports:
        - 5433:5433
      volumes:
        - ./data/postgres:/var/lib/postgresql/data
      environment:
        - POSTGRES_USER = postgres
        - POSTGRES_PASSWORD = postgres
        - POSTGRES_DB = postgres
        - POSTGRES_HOST=localhost
        - POSTGRES_PORT=5433 -->
        
  orderservices-app1:
       container_name: orderservices-app1
       image : node:18
       build: 
         context: ./orderservices-app1
         dockerfile: Dockerfile
       volumes:
          - ./orderservices-app1:/orderservices-app1
       working_dir: /orderservices-app1
       command: npm start
       ports:
          - 8080:8080
       environment: 
          - PORT=8080
          - POSTGRES_URL=postgres://postgres:postgres@postgres:5433/postgres
          - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
          - KAFKA_TOPIC=orders
       depends_on:
           - postgres
           - kafka
    
  inventoryservices-app2:
         container_name: inventoryservices-app2
         image : node:18
         build: 
          context: ./inventoryservices-app2
          dockerfile: Dockerfile
         volumes:
              - ./inventoryservices-app2:/inventoryservices-app2
         working_dir: /inventoryservices-app2
         command: npm start
         ports:
          - 8082:8080
         environment: 
          - PORT=8082
          - MONGO_URL=mongodb+srv://Damini:Saanv!00@cluster0.51e4ypk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
          - KAFKA_BOOTSTRAP_SERVERS= kafka:9092
          - KAFKA_TOPIC=orders
         depends_on:
           - postgres
           - kafka
<!--          
  # networks:
  #   my-kafka-network:
  #     driver: bridge -->

```
    
4.  Build and Run the Services:
```
docker-compose up --build
```
5. Testing the Services:
OrderService: Use Thunder Client for  API client to place an order.

Endpoint: http://localhost:8080/place-order
Method: POST

```{
  "productname":"speakers",
  "qty":2,
  "price":300 
}
```
6.Running Unit Tests
```
cd orderservices-app1
npm install
npm test

cd ../inventoryservices-app2
npm install
npm test
```

       
## About Me
- Damini Gadpal [GitHub](https://github.com/Daminigadpal) | [LinkedIn](https://www.linkedin.com/in/damini-gadpal-01996716b) | [YouTube](https://youtu.be/tzykJmtIHvg)


## Contact
If you have any questions or suggestions, feel free to reach out to us at [Gmail](https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSGLPhhCThjSQBxqqKCTksFHbgmPZGmrTXlskrtrXBgHxRqbmdRdzJJlNBtvTWsTLmjdVLbb).


## Happy Learning

<p align="center">
<a href="https://github.com/Abhi1o/get_youtube_subscribers" title="GET youtube subscriber projects">
<img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white">
    
</a>
</p>
