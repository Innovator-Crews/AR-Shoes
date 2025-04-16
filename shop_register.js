import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref as dbRef, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";
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
const storage = getStorage(app);

// Initialize Firebase Authentication and Database
const auth = getAuth(app);
const db = getDatabase(app);

let userIDCredential;
let uploadPermitDocumentimagename;
let licensePreviewimagename;

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

// ... (keep all your existing imports and Firebase config)

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
    }

    // Check if files are selected
    const permitDocumentfile = document.getElementById("permitDocument").files[0];
    const licensePreviewfile = document.getElementById("businessLicense").files[0];
    const frontSidefile = document.getElementById("ownerIdFront").files[0];
    const backSidefile = document.getElementById("ownerIdBack").files[0];
    
    if (!permitDocumentfile || !licensePreviewfile) {
        alert("Please select both files.");
        return;
    }

    // Create a new user with email and password
    createUserWithEmailAndPassword(auth, ownerEmailVal, passwordVal)
        .then((userCredential) => {
            const user = userCredential.user;
            userIDCredential = user.uid;
            
            // Update the user's profile
            return updateProfile(user, {
                displayName: usernameVal, 
                appName: "AR Shoes"
            }).then(() => {
                // Save user data to database
                return set(dbRef(db, 'AR_shoe_users/shop/' + user.uid), {
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
                    // userName: usernamee.value,
                    dateApproved: '',
                    dateRejected: '',
                });
            }).then(() => {
                console.log("User data added successfully!");
                // Now upload both files
                return uploadBothFiles(user.uid, permitDocumentfile, licensePreviewfile, frontSidefile, backSidefile);
            });
        })
        .then(() => {
            alert("Registration successful!");
            // Redirect or do something else
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

function uploadBothFiles(userId, permitFile, licenseFile, frontSideFile, backSideFile) {
    // Create unique filenames to avoid overwriting
    const permitRef = storageRef(storage, `uploads/${userId}/permit_${Date.now()}_${permitFile.name}`);
    const licenseRef = storageRef(storage, `uploads/${userId}/license_${Date.now()}_${licenseFile.name}`);
    const frontPicIDRef = storageRef(storage, `uploads/${userId}/frontSide_${Date.now()}_${frontSideFile.name}`);
    const backPicIDRef = storageRef(storage, `uploads/${userId}/backSide_${Date.now()}_${backSideFile.name}`);

    // Upload both files in parallel
    const uploadPermitTask = uploadBytesResumable(permitRef, permitFile);
    const uploadLicenseTask = uploadBytesResumable(licenseRef, licenseFile);
    const uploadFrontTask = uploadBytesResumable(frontPicIDRef, frontSideFile);
    const uploadBackTask = uploadBytesResumable(backPicIDRef, backSideFile);

    // Track progress for both uploads
    uploadPermitTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Permit upload: ${progress.toFixed(2)}%`);
        },
        (error) => {
            console.error("Permit upload failed:", error);
        }
    );

    uploadLicenseTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`License upload: ${progress.toFixed(2)}%`);
        },
        (error) => {
            console.error("License upload failed:", error);
        }
    );
    uploadFrontTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Front Picture Side upload: ${progress.toFixed(2)}%`);
        },
        (error) => {
            console.error("Front Picture Side upload failed:", error);
        }
    );

    uploadBackTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Back Picture Side upload: ${progress.toFixed(2)}%`);
        },
        (error) => {
            console.error("Back Picture Side upload failed:", error);
        }
    );

    // Wait for both uploads to complete
    return Promise.all([
        uploadPermitTask.then(() => getDownloadURL(uploadPermitTask.snapshot.ref)),
        uploadLicenseTask.then(() => getDownloadURL(uploadLicenseTask.snapshot.ref)),
        uploadFrontTask.then(() => getDownloadURL(uploadFrontTask.snapshot.ref)),
        uploadBackTask.then(() => getDownloadURL(uploadBackTask.snapshot.ref)),
    ]).then(([permitUrl, licenseUrl, frontPicUrl, backPicUrl]) => {
        // Save both URLs to database
        const data = {
            permitDocument: {
                name: permitFile.name,
                url: permitUrl,
                uploadedAt: new Date().toISOString()
            },
            licensePreview: {
                name: licenseFile.name,
                url: licenseUrl,
                uploadedAt: new Date().toISOString()
            },
            frontSideID:
            {
                name: frontSideFile.name,
                url: frontPicUrl,
                uploadedAt: new Date().toISOString()
            },
            backSideID:
            {
                name: backSideFile.name,
                url: backPicUrl,
                uploadedAt: new Date().toISOString()
            }
        };

        return set(dbRef(db, 'AR_shoe_users/shop/' + userId + '/uploads'), data);
    });
}