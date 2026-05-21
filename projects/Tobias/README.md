# Installing and deploying the application on a local machine

## Installation

### Requirements
- Node.js
- MongoDB (running locally on port 27017)


## Deploying


### Backend
1. Navigate to the "backend" folder
    ```
    cd backend
    ```
2. Create a ".env.dev" file with the following content:

    ```
    DB_HOSTNAME=localhost
    DB_PORT=27017
    DB_NAME=spanishpokerdice
    BACKEND_PORT=3000
    NODE_ENV=development
    HASH_SALT=someRandomStringOfYourChoosing
    ```

3. Install the necessary dependencies:
    ```
    npm install
    ```

4. Seed the database with the test data (or create your own):
    ```
    npm run seed
    ```

5. Start the backend:
    ```
    npm run dev
    ```

### Frontend

1. Navigate to the "frontend" folder
    ```
    cd frontend
    ```

2. Install the necessary dependencies:
    ```
    npm install
    ```

3. Start the frontend
    ```
    npm run dev
    ```


The app will then be available at: http://localhost:5173


### The test users
You can log into the website as any one of these users 
| Username | Password |
|----------|----------|
| Tobias   |   123    |
| Robin    |   456    |
| Aliaksei |   789    |
| Carlos   |   246    |
| Johan    |   111    |
| Sebastian|   222    |

