import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js"; // Added get import
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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
const db = getDatabase(app); // Initialize database

// Customer Login
const loginButton_customer = document.getElementById('loginButton_customer');
loginButton_customer.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('customer-email').value;
    const password = document.getElementById('customer-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.emailVerified) {
                get(ref(db, `AR_shoe_users/customer/${user.uid}`))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            alert("Login successful");
                            window.location.href = "customer_dashboard.html";
                        } else {
                            alert("You are not registered as a customer");
                            auth.signOut();
                        }
                    });
            } else {
                alert("Please verify your email address before logging in.");
            }
        })
        .catch((error) => {
            alert("Error logging in: " + error.message);
        });
});

// Shop Login
const loginButton_shop = document.getElementById('loginButton_shop');
loginButton_shop.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('shop-username').value;
    const password = document.getElementById('shop-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.emailVerified) {
                get(ref(db, `AR_shoe_users/shop/${user.uid}`))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            alert("Login successful");
                            window.location.href = "shop_dashboard.html";
                        } else {
                            alert("You are not registered as a shop owner");
                            auth.signOut();
                        }
                    });
            } else {
                alert("Please verify your email address before logging in.");
            }
        })
        .catch((error) => {
            alert("Error logging in: " + error.message);
        });
});