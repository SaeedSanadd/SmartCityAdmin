// src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD-MG9e8-PtnOAgP5mvf8LDyPMr4OijUAg",
    authDomain: "waste-report-81922.firebaseapp.com",
    projectId: "waste-report-81922",
    storageBucket: "waste-report-81922.firebasestorage.app",
    messagingSenderId: "281908166078",
    appId: "1:281908166078:web:8ed78ed67668fa002bcdef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Initialize Firestore
export const db = getFirestore(app);

// 🔐 Initialize Firebase Auth
export const auth = getAuth(app);