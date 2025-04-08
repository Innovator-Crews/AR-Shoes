import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
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


// Initialize Firebase Authentication and Database
const auth = getAuth(app);
const db = getDatabase(app);

const firstnameInput = document.getElementById('firstName');
const lastnameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const birthDateInput = document.getElementById('birthDate');
const addressInput = document.getElementById('address');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');
const zipInput = document.getElementById('zip');
const countryInput = document.getElementById('country');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const dateAccountCreated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
}).replace(/\//g, '-').replace(/,/g, '');

const registerButton = document.getElementById('registerButton');
registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const selectedGender = getSelectedGender();
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
                            window.location.href = "user_login.html";
                        }).catch((error) => {
                            alert("Error sending email verification: " + error.message);
                        });
                        set(ref(db, 'AR_shoe_users/customer/' + user.uid), {
                            username: username,
                            email: email,
                            status: 'active',
                            dateAccountCreated: dateAccountCreated,
                            firstName: firstnameInput.value,
                            lastName: lastnameInput.value,
                            phone: phoneInput.value,
                            gender: selectedGender,
                            birthday: birthDateInput.value,
                            address: addressInput.value,
                            city: cityInput.value,
                            state: stateInput.value,
                            zip: zipInput.value,
                            country: countryInput.value,
                        }).then(() => {
                            console.log("User data added successfully!");
                        }).catch((error) => {
                            alert("Error adding user data: " + error.message);
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

// Get the selected value
function getSelectedGender() {
    const selected = document.querySelector('input[name="gender"]:checked');
    return selected ? selected.value : null;
  }