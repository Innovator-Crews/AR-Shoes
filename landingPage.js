import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAuPALylh11cTArigeGJZmLwrFwoAsNPSI",
    authDomain: "opportunity-9d3bf.firebaseapp.com",
    databaseURL: "https://opportunity-9d3bf-default-rtdb.firebaseio.com",
    projectId: "opportunity-9d3bf",
    storageBucket: "opportunity-9d3bf.firebasestorage.app",
    messagingSenderId: "57906230058",
    appId: "1:57906230058:web:2d7cd9cc68354722536453",
    measurementId: "G-QC2JSR1FJW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    var greet = document.getElementById("greet");
    if (user) {
        if (user.emailVerified) {
            // User is signed in
            greet.textContent = "Welcome, " + (user.displayName || user.email);
        } else {
            window.location.href = "login_user.html";
        }
    } else {
        // No user is signed in
        console.log("No user is logged in.");
        window.location.href = "login_user.html";
    }
});

const logoutButton = document.getElementById('logOut');
logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    signOut(auth).then(() => {
        console.log("User signed out");
    }).catch((error) => {
        console.log("Error signing out: " + error.message);
    });
});

