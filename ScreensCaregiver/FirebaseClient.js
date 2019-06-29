const firebase = require('firebase')

// Initialize Firebase
const firebaseConfig = {
  apiKey: AIzaSyDwkMeYVToqZIhAOQAECsY5y33XGwjdlP0,
  authDomain: "homecare-f7c5b.firebaseapp.com",
  databaseURL: "https://homecare-f7c5b.firebaseio.com",
  storageBucket: "homecare-f7c5b.appspot.com",
}

const firebaseApp = firebase.initializeApp(firebaseConfig)

export default firebaseApp