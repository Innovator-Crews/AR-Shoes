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

const userIsApproved = document.getElementById("status-message-approved").style.display; // Set this based on your logic
const userIsRejected = document.getElementById("status-message-reject").style.display; // Set this based on your logic
const userIsPending = document.getElementById("status-message-pending").style.display; // Set this based on your logic

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("Auth state: User is logged in", user.uid);
        console.log("User email: ", user.email);

        get(ref(db, `AR_shoe_users/shop/${user.uid}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    if (userData.status === "approved") {
                        document.getElementById("status-message-approved").style.display = "block";
                        document.getElementById("status-message-reject").style.display = "none";
                        document.getElementById("status-message-pending").style.display = "none";
                    }else if (userData.status === "rejected") {
                        document.getElementById("status-message-approved").style.display = "none";
                        document.getElementById("status-message-reject").style.display = "block";
                        document.getElementById("status-message-pending").style.display = "none";
                    }
                    else if (userData.status === "pending") {
                        document.getElementById("status-message-approved").style.display = "none";
                        document.getElementById("status-message-reject").style.display = "none";
                        document.getElementById("status-message-pending").style.display = "block";
                    } else {
                        document.getElementById("status-message-approved").style.display = "none";
                        document.getElementById("status-message-reject").style.display = "none";
                        document.getElementById("status-message-pending").style.display = "none";
                    }
                    
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
        alert("Error loading data. Please refresh the page."); // add lang ako ng message for user
    });
});

const statusContainer = document.getElementById("status-message");

// Sample condition (replace with actual logic)
    // const shopStatus = "rejected"; // or "approved"
    // const rejectionReasons = [
    //   "Invalid or incomplete business permit.",
    //   "Shop description is too vague."
    // ];

    // if (shopStatus === "approved") {
    //   statusContainer.classList.add("approved");
    //   statusContainer.innerHTML = `
    //     <div>
    //         <strong>Congratulations!</strong> Your shop has been <strong>approved</strong>.
    //         You can now access all dashboard features including adding products and employees.
    //     </div>
    //   `;
    // } else if (shopStatus === "rejected") {
    //   statusContainer.classList.add("rejected");
    //   statusContainer.innerHTML = `
    //     <div>
    //         <strong>We're sorry.</strong> Your shop registration has been <strong>rejected</strong> due to the following reasons:
    //         <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
    //             ${rejectionReasons.map(reason => `<li>${reason}</li>`).join("")}
    //         </ul>
    //         <p style="margin-top: 0.5rem;">Please review and update your details, then re-apply.</p>
    //     </div>
    //     <button class="reapply-btn">Reapply</button>
    //   `;
    // }

