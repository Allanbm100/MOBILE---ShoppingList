// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7Tyl5DSAKLu9GMWMPaalOE31YhqmOWqg",
  authDomain: "shoppinglist-8dce5.firebaseapp.com",
  projectId: "shoppinglist-8dce5",
  storageBucket: "shoppinglist-8dce5.firebasestorage.app",
  messagingSenderId: "796380677839",
  appId: "1:796380677839:web:05afd94650de6069e159ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
const db = getFirestore(app);

export { auth, db };