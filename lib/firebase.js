import firebase from "firebase/compat/app";
import 'firebase/compat/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCj-8kmefcYpMEA22tTurMvcWAusjEHtfY",
    authDomain: "cashman-project-de46d.firebaseapp.com",
    databaseURL: "https://cashman-project-de46d-default-rtdb.firebaseio.com",
    projectId: "cashman-project-de46d",
    storageBucket: "cashman-project-de46d.appspot.com",
    messagingSenderId: "1078776264780",
    appId: "1:1078776264780:web:622c74b0f96f32767a9ce9",
    measurementId: "G-VN0XFVDD2X"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

export {firestore};

