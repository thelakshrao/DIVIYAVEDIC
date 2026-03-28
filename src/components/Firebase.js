import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
 
const firebaseConfig = {
  apiKey: "AIzaSyBqC8pxbWoW7ZCPDeD7fS0BGCHzZkgCMSw",
  authDomain: "diviyavedicshop.firebaseapp.com",
  projectId: "diviyavedicshop",
  storageBucket: "diviyavedicshop.firebasestorage.app",
  messagingSenderId: "1090312084024",
  appId: "1:1090312084024:web:b3ba1cf2f07ef7884ea4cd",
  measurementId: "G-X2EDH0CTPZ"
};
 
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
 