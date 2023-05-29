import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
    apiKey: "AIzaSyDw3zNAkGyVPYcPaiHGSdGw-8PMw5oTQq4",
    authDomain: "apor-7f136.firebaseapp.com",
    projectId: "apor-7f136",
    storageBucket: "apor-7f136.appspot.com",
    messagingSenderId: "908619663117",
    appId: "1:908619663117:web:7c1765ec92d0b4135ed244",
    measurementId: "G-QB856BNFJN"
  };


  // Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export const auth = getAuth(app);