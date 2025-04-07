import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js"; // Added get import
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
const auth = getAuth();
const db = getDatabase(app);

document.body.style.display = 'none';
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("Auth state: User is logged in", user.uid);
        console.log("User email: ", user.email);

        get(ref(db, `AR_shoe_users/customer/${user.uid}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    document.getElementById('userName_display1').textContent = userData.username;
                    document.getElementById('userName_display2').textContent = userData.username;
                    document.body.style.display = '';
                } else {
                    alert("Account does not exist");
                    auth.signOut();
                }
            });
        // Update UI or redirect
    } else {
        // User is signed out
        console.log("Auth state: User is logged out");
        window.location.href = "user_login.html";
        // Redirect to login page
    }
});

document.getElementById('logout_btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log("User signed out");
        // window.location.href = "customer_dashboard.html"; // Redirect to login page
        // di na need ng window.location.href kasi kay onAuthStateChanged else na yung window.location.href = "user_login.html";
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
});