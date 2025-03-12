import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, updateProfile, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const registerButton = document.getElementById('registerButton');
registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const username = usernameInput.value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    } else {
        // Create a new user with email and password
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                var user = userCredential.user;
                // Update the user's profile with the full name
                updateProfile(user, {
                    displayName: username, appName: "AR Shoes"
                }).then(() => {
                    // Send email verification
                    sendEmailVerification(auth.currentUser)
                        .then(() => {
                            alert("Email Verification sent to your email address. Please verify your email address to login.");
                            window.location.href = "login_user.html";
                        }).catch((error) => {
                            alert("Error sending email verification: " + error.message);
                        });
                }).catch((error) => {
                    alert("Error updating profile: " + error.message);
                });
            })
            .catch((error) => {
                alert("Error creating user: " + error.message);
            });
    }
});
