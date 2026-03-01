# Dragon Vault

A tomogachi-like website where you must save money to keep your dragon from becoming sad


## Backend Setup

To run the backend, you must have Firebase set up with Firestore Database and Authentication

To set up Firebase, create a project in the Firebase Console, and register your app.

Go to the Firebase Console → Add project

In your project:

Build → Authentication → enable the sign-in methods you want (ex: Email/Password)

Build → Firestore Database → Create database (start in test mode for prototyping, then lock it down)

To get the backend to connect to your Firebase project, you need to create a config.JSON file, this is created by clicking on the `Project settings (gear)` to the right of `Project Overview` and then clicking on `Service Accounts` and
then on `Generate New Private Key`. This downloads a JSON file which needs to be placed in a `secrets` directly in the `backend` directory. Alongside it a `.env` file with `FIREBASE_SERVICE_ACCOUNT_JSON='secrets/firebase_config.json'`.

To run the backend, make sure you are in the `backend` directory and download the requirements with `pip install -r requirements.txt` (virtual environments preferred), and then run `flask run`

## Frontend Setup

Ensure you have a `Node.js` version greater than 20.19+ to run Vite

You still need to use setup Firebase in order for logins to work

To set it up, you need several environment variables, all are found by clicking on the `Project settings (gear)` to the right of `Project Overview` and then clicking on `General`, the example JavaScript snippet has all of the environment 
variables you need. Create a `.env` file in the `client` directory with the following:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Once all of that is done, make sure you are in the `client` directory and run `npm install` to install dependencies and then run `npm run dev` to start the frontend.
