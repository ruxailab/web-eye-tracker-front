# 👁️ Eye Lab: Gaze Tracker WEB

Eye Lab is an open source tool to create eye tracking usability tests. It started as a final undergraduation work for Computer Engineering of student [Karine Pistili](https://www.linkedin.com/in/karine-pistili/) that created the first prototype. The idea is to evolve it to a more complete and useful tool with the help of the community.

The current version of the software allows users to create their usability sessions of an website, recording the webcam, screen and mouse movements and use this information to find out where the user has been looking into the screen by using heatmaps.

## 👩‍💻 Setting up project locally

The project consists of two parts, this repository contains the frontend of the application and the backend can be found [here](https://github.com/uramakilab/web-eye-tracker). Install it as well.

### Prerequisites

* [Vue CLI 5x](https://www.npmjs.com/package/@vue/cli)
* [Nodejs 20x](https://nodejs.org/en/download/)

### 1. Install dependencies

We have created a vue project, do first thing is to install all the dependencies in your computer by using:

```
npm install
```

### 2. Run in Developmente Mode

If you want to test the application or develop on it, you can use the dev mode of vue cli by running:

```
npm run serve
```

### 3. Run for production

If you want to deploy the application in production or build for some other reason use:

```
npm run build
```

### 4. Deploy to Firebase Hosting

If you need to deploy to a hosting system, the project is already configured to be deployed into the Firebase Hosting. To make it work you just need to create a .env file containg the following information of your firebase project:

```
VUE_APP_FIREBASE_API_KEY='place-your-api-key'
VUE_APP_FIREBASE_AUTH_DOMAIN='place-your-auth-domain'
VUE_APP_FIREBASE_PROJECT_ID='place-your-project-id'
VUE_APP_FIREBASE_STORAGE_BUCKET='place-your-storage-bucket'
VUE_APP_FIREBASE_MESSAGING_SENDER_ID='place-your-sender-id'
VUE_APP_FIREBASE_APP_ID='place-your-app-id'
VUE_APP_FIREBASE_MEASUREMENT_ID='place-your-measurement-id'
```

After creating the .env you just need to login into your firebase account via terminal and then use:

```
firebase deploy --only hosting
```

### 5. GitHub CI/CD

This project has the Firebase Hosting Workflow from the Github Actions. If you want to use it on your on repository feel free to edit *.github/workflows* files with your settings.


## 🧑‍🤝‍🧑 Contributing

Anyone is free to contribute to this project. Just do a pull request with your code and if it is all good we will accept it. You can also help us look for bugs, if you find anything create and issue.

## 📃 License

This software is under the [MIT License](https://opensource.org/licenses/MIT). 

Copyright 2021 Uramaki Lab
