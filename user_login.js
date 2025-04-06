import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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

// pag meron nang html file for landing page, uncomment this
const loginButton_customer = document.getElementById('loginButton_customer');
loginButton_customer.addEventListener('click', (event) => {
const emailInput = document.getElementById('customer-email');
const passwordInput = document.getElementById('customer-password');

    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            if (user.emailVerified) {
                alert("Login successful");
                window.location.href = "customer_dashboard.html";
            } else {
                alert("Please verify your email address before logging in.");
            }
        })
        .catch((error) => {
            alert("Error logging in: " + error.message);
        });
});


const loginButton_shop = document.getElementById('loginButton_shop');
loginButton_shop.addEventListener('click', (event) => {
const emailInput = document.getElementById('shop-username');
const passwordInput = document.getElementById('shop-password');

    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            if (user.emailVerified) {
                alert("Login successful");
                window.location.href = "shop_dashboard.html";
            } else {
                alert("Please verify your email address before logging in.");
            }
        })
        .catch((error) => {
            alert("Error logging in: " + error.message);
        });
});