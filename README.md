# Yahtzee Game Setup

This project is an object-oriented version of Yahtzee. Follow the steps below to set up and run the project.

## Prerequisites

Make sure you have Node.js and npm installed on your machine.

## Setup Instructions

### Step 1: Start the Pub/Sub Server

1. Open a terminal and navigate to the `pubsub` folder:
    ```sh
    cd pubsub
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the Pub/Sub server:
    ```sh
    npm run start
    ```

### Step 2: Start the Game Server

1. Open a new terminal and navigate to the `server` folder:
    ```sh
    cd server
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the game server:
    ```sh
    npm run start
    ```

### Step 3: Start the Client

1. Open a third terminal and navigate to the `client` folder:
    ```sh
    cd client
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the client:
    ```sh
    npm run dev
    ```

### Step 4: Play Yahtzee

1. Open your browser and go to [http://localhost:5173/](http://localhost:5173/).
2. You can log in using any username you wish.

Enjoy playing Yahtzee!