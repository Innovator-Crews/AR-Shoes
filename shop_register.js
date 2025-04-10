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

const shopName = document.getElementById('shopName');
const shopCategory = document.getElementById('shopCategory');
const shopDescription = document.getElementById('shopDescription');
const yearsInBusiness = document.getElementById('yearsInBusiness');
const ownerName = document.getElementById('ownerName');
const ownerEmail = document.getElementById('ownerEmail');
const ownerPhone = document.getElementById('ownerPhone');
const shopAddress = document.getElementById('shopAddress');
const shopCity = document.getElementById('shopCity');
const shopState = document.getElementById('shopState');
const shopZip = document.getElementById('shopZip');
const shopCountry = document.getElementById('shopCountry');
const usernamee = document.getElementById('username');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

const dateProcessed = new Date().toLocaleDateString('en-US', {
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
    const usernameVal = username.value;
    const passwordVal = password.value;
    const confirmPasswordVal = confirmPassword.value;
    const ownerEmailVal = ownerEmail.value;

    if (passwordVal !== confirmPasswordVal) {
        alert('Passwords do not match');
        return;
    } else {
        // Create a new user with email and password
        createUserWithEmailAndPassword(auth, ownerEmailVal, passwordVal)
            .then((userCredential) => {
                var user = userCredential.user;
                // Update the user's profile with the full name
                updateProfile(user, {
                    displayName: usernameVal, appName: "AR Shoes"
                }).then(() => {
                    // Send email verification
                    sendEmailVerification(auth.currentUser)
                        .then(() => {
                            alert("Email Verification sent to your email address. Please verify your email address to login.");
                            // window.location.href = "user_login.html";
                        }).catch((error) => {
                            alert("Error sending email verification: " + error.message);
                        });
                        set(ref(db, 'AR_shoe_users/shop/' + user.uid), {
                            username: usernameVal,
                            email: ownerEmailVal,
                            status: 'pending',
                            ownerName: ownerName.value,
                            shopName: shopName.value,
                            shopCategory: shopCategory.value,
                            shopDescription: shopDescription.value,
                            yearsInBusiness: yearsInBusiness.value,
                            ownerPhone: ownerPhone.value,
                            shopAddress: shopAddress.value,
                            shopCity: shopCity.value,
                            shopState: shopState.value,
                            shopZip: shopZip.value,
                            shopCountry: shopCountry.value,
                            dateProcessed: dateProcessed,
                            userName: usernamee,
                            dateApproved: '',
                            dateRejected: '',
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
