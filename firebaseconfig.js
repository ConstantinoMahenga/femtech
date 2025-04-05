import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyArDDItCmEVTfWH8DCsR34RsH3Yx4hav34",
    authDomain: "projecto2-987c9.firebaseapp.com",
    projectId: "projecto2-987c9",
    storageBucket: "projecto2-987c9.firebasestorage.app",
    messagingSenderId: "1020053584853",
    appId: "1:1020053584853:web:8548018f08302f629e5b5c",
    measurementId: "G-JZQHNTDRHR"
};

const app = initializeApp(firebaseConfig);

// Use initializeAuth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
