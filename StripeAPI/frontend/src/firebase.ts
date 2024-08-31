import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';

console.log('index.tsx is running')
// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBUta-qjILEzaOMUUHRDxEN7pjmxANt4CY",
  authDomain: "stripe-1b07d.firebaseapp.com",
  projectId: "stripe-1b07d",
  storageBucket: "stripe-1b07d.appspot.com",
  messagingSenderId: "41064962021",
  appId: "1:41064962021:web:b73d65672330c25968c10c",
  measurementId: "G-4SRH3L8FHR"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export {app, analytics}