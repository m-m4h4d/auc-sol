// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCMxqFz64u_b5q9eKnUCMd7vZGVRJLQuKw",
  authDomain: "auc-sol.firebaseapp.com",
  projectId: "auc-sol",
  storageBucket: "auc-sol.appspot.com",
  messagingSenderId: "78916035755",
  appId: "1:78916035755:web:41ae95a61ebacbf817c3ee",
  measurementId: "G-GXQDSRFN0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);