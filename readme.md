# BE NTX

This repository contains the backend service for the BE NTX project. It is designed to handle various API requests for survey statistics, user authentication, survey data, and more, using Redis caching on port 6379.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Redis](https://redis.io/) running on port 6379
- [Postman](https://www.postman.com/) or similar tool for API testing

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/BE-NTX.git
    cd BE-NTX
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the Redis server:

   Ensure Redis is running on port 6379. You can start Redis using:

    ```bash
    redis-server
    ```

4. Start the application:

    ```bash
    npm start
    ```

## API Endpoints

### 1. Survey Stats

**Endpoint:** `GET /api/survey-stats`  
**Description:** Fetch survey statistics.  
**Headers:**  
`x-access-token` - JWT Token.  
**Example Request:**
```http
GET http://localhost:6543/api/survey-stats
Headers: {
  "x-access-token": "<JWT_TOKEN>"
}
```

### 2. Login

**Endpoint:** `POST /api/login`  
**Description:** Login to get a JWT token.  
**Request Body:**
```json
{
  "id": 1,
  "digits": "DFA",
  "company": "NTX"
}
```
**Example Request:**
```http
POST http://localhost:6543/api/login
Body: {
  "id": 1,
  "digits": "DFA",
  "company": "NTX"
}
```

### 3. Survey Stats

**Endpoint:** `POST /api/survey`  
**Description:** Submit survey data.  
**Headers:**  
`x-access-token` - JWT Token.  
**Request Body:**
```json
{
  "userId": 2,
  "values": [76, 24, 36, 44, 53],
  "id": 1
}
```
**Example Request:**
```http
POST http://localhost:6543/api/survey
Headers: {
  "x-access-token": "<JWT_TOKEN>"
}
Body: {
  "userId": 2,
  "values": [76, 24, 36, 44, 53],
  "id": 1
}
```

### 4. Data

**Endpoint:** `GET /api/data`  
**Description:** Fetch data; accessible only to users with `workType` WFO.  
**Headers:**  
`x-access-token` - JWT Token.  
**Example Request:**
```http
GET http://localhost:6543/api/data
Headers: {
  "x-access-token": "<JWT_TOKEN>"
}
```

### 5. WebSocket Data

**Endpoint:** `ws://localhost:6543/api/data`
**Description:** WebSocket API to receive data from the API URL every 3 minutes.
Example Connection: Connect to the WebSocket using a client tool with the URL `ws://localhost:6543/api/data`. 