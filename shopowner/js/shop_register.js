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
// ------------pwede to tanggalin pag gusto mo -----------------------
const registerButton = document.getElementById('registerButton');
function setButtonDisable() {
    registerButton.style.background = "linear-gradient(135deg, #43579d, #694c8d)";
    registerButton.style.color = "#838383";
    registerButton.disabled = true;
}
function setButtonAble() {
    registerButton.style.background = "linear-gradient(135deg, var(--primary), var(--secondary))";
    registerButton.style.color = "var(--light)";
    registerButton.disabled = false;
}

// ... (keep all your existing imports and Firebase config)+

// Add these loader control functions
function showLoader() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoader() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// registerButton.addEventListener('click', (event) => {
//     // setButtonDisable();
//     // event.preventDefault();
//     // setButtonDisable();
//     // line 80 to 82 kasama sa  original
//     // start ng baguhin dito
//     // warning crtl + z 
//     const usernameVal = username.value;
//     const passwordVal = password.value;
//     const confirmPasswordVal = confirmPassword.value;
//     const ownerEmailVal = ownerEmail.value;

//     if (passwordVal !== confirmPasswordVal) {
//         alert('Passwords do not match');
//         setButtonAble();
//         return;
//     }

//     // Check if files are selected
//     const permitDocumentfile = document.getElementById("permitDocument").files[0];
//     const licensePreviewfile = document.getElementById("businessLicense").files[0];
//     const frontSidefile = document.getElementById("ownerIdFront").files[0];
//     const backSidefile = document.getElementById("ownerIdBack").files[0];

//     if (!permitDocumentfile || !licensePreviewfile) {
//         alert("Please select both files.");
//         setButtonAble();
//         return;
//     }


//     // Create a new user with email and password
//     createUserWithEmailAndPassword(auth, ownerEmailVal, passwordVal)
//         .then((userCredential) => {
//             const user = userCredential.user;
//             userIDCredential = user.uid;

//             // Update the user's profile
//             return updateProfile(user, {
//                 displayName: usernameVal,
//                 appName: "AR Shoes"
//             }).then(() => {
//                 // Save user data to database
//                 return set(dbRef(db, 'AR_shoe_users/shop/' + user.uid), {
//                     username: usernameVal,
//                     email: ownerEmailVal,
//                     status: 'pending',
//                     ownerName: ownerName.value,
//                     shopName: shopName.value,
//                     shopCategory: shopCategory.value,
//                     shopDescription: shopDescription.value,
//                     yearsInBusiness: yearsInBusiness.value,
//                     ownerPhone: ownerPhone.value,
//                     shopAddress: shopAddress.value,
//                     shopCity: shopCity.value,
//                     shopState: shopState.value,
//                     shopZip: shopZip.value,
//                     shopCountry: shopCountry.value,
//                     dateProcessed: dateProcessed,
//                     // userName: usernamee.value,
//                     dateApproved: '',
//                     dateRejected: '',
//                 }).then(() => {
//                     // Send email verification
//                     sendEmailVerification(auth.currentUser)
//                         .then(() => {
//                             // eto kahit di na alert kumbaga para nalang syang yung notif na lalabas sa upper right kapag nagreject ka sa admin dashboard yung 3secs lang lalabas then mawawala na
//                             alert("Email Verification sent to your email address. Please verify your email address to login.");
//                             // window.location.href = "user_login.html";
//                         }).catch((error) => {
//                             alert("Error sending email verification: " + error.message);
//                         });
//                 });
//             }).then(() => {
//                 console.log("User data added successfully!");
//                 // Now upload both files
//                 return uploadBothFiles(user.uid, permitDocumentfile, licensePreviewfile, frontSidefile, backSidefile);
//             });
//         })
//         .then(() => {
//             alert("Registration successful!");
//             // Redirect or do something else
//         })
//         .catch((error) => {
//             alert("Error: " + error.message);
//             setButtonAble();
//         });
// });

// Update the registration handler with complete validation
registerButton.addEventListener('click', async (event) => {
    event.preventDefault();
    setButtonDisable();
    showLoader();

    try {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
        
        // Validate all fields
        const errors = [];
        const requiredFields = [
            { id: 'shopName', name: 'Shop Name' },
            { id: 'shopCategory', name: 'Shop Category' },
            { id: 'shopDescription', name: 'Shop Description' },
            { id: 'ownerName', name: 'Owner Name' },
            { id: 'ownerEmail', name: 'Email' },
            { id: 'ownerPhone', name: 'Phone Number' },
            { id: 'ownerIdFront', name: 'ID Front' },
            { id: 'ownerIdBack', name: 'ID Back' },
            { id: 'shopAddress', name: 'Shop Address' },
            { id: 'shopCity', name: 'City' },
            { id: 'shopState', name: 'State/Province' },
            { id: 'shopZip', name: 'ZIP/Postal Code' },
            { id: 'shopCountry', name: 'Country' },
            { id: 'businessLicense', name: 'Mayor\'s Permit / Business License' },
            { id: 'taxId', name: 'Tax ID' },
            { id: 'permitDocument', name: 'Business Permit' },
            { id: 'username', name: 'Username' },
            { id: 'password', name: 'Password' },
            { id: 'confirmPassword', name: 'Confirm Password' }
        ];

        // Check required fields
        requiredFields.forEach(({ id, name }) => {
            const field = document.getElementById(id);
            if (!field.value.trim()) {
                errors.push(`${name} is required`);
                showFieldError(field, `${name} is required`);
            }
        });

        // Validate email format
        const emailField = document.getElementById('ownerEmail');
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailField.value)) {
            errors.push('Invalid email format');
            showFieldError(emailField, 'Please enter a valid email address');
        }

        // Validate phone number
        const phoneField = document.getElementById('ownerPhone');
        if (phoneField.value.length !== 10 || !/^\d+$/.test(phoneField.value)) {
            errors.push('Invalid phone number');
            showFieldError(phoneField, 'Please enter a valid 10-digit Philippine mobile number');
        }

        // Validate password match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
            showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
        }

        // Validate file uploads
        const validateFileUpload = (id, name) => {
            const fileInput = document.getElementById(id);
            if (fileInput.files.length === 0) {
                errors.push(`${name} is required`);
                showFieldError(fileInput, `${name} is required`);
                return;
            }
            
            const file = fileInput.files[0];
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${name} file size exceeds 5MB limit`);
                showFieldError(fileInput, 'File size exceeds 5MB limit');
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                errors.push(`${name} invalid file type`);
                showFieldError(fileInput, 'Only JPEG, PNG, or PDF files are allowed');
            }
        };

        // error message lang to kaya commented
        // validateFileUpload('ownerIdFront', 'Front ID');
        // validateFileUpload('ownerIdBack', 'Back ID');
        // validateFileUpload('businessLicense', 'Business License');
        // validateFileUpload('permitDocument', 'Business Permit');

        // Validate terms agreement
        if (!document.getElementById('agreeTerms').checked) {
            errors.push('You must agree to the Terms of Service and Privacy Policy');
            showFieldError(document.getElementById('agreeTerms'), ' \u00A0\u00A0 You must agree to the Terms of Service and Privacy Policy');
        }

        // If any errors, stop here
        if (errors.length > 0) {
            hideLoader();
            setButtonAble();
            showErrorOverlay(errors);
            document.querySelector('.form-group.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Proceed with registration
        const usernameVal = username.value;
        const passwordVal = password;
        const ownerEmailVal = emailField.value;
        const permitDocumentfile = document.getElementById("permitDocument").files[0];
        const licensePreviewfile = document.getElementById("businessLicense").files[0];
        const frontSidefile = document.getElementById("ownerIdFront").files[0];
        const backSidefile = document.getElementById("ownerIdBack").files[0];

        // Create user and upload files
        const userCredential = await createUserWithEmailAndPassword(auth, ownerEmailVal, passwordVal);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: usernameVal });
        await set(dbRef(db, `AR_shoe_users/shop/${user.uid}`), { /* your data object */ });
        await uploadBothFiles(user.uid, permitDocumentfile, licensePreviewfile, frontSidefile, backSidefile);
        
        // Send verification email
        await sendEmailVerification(user);
        
        hideLoader();
        setButtonAble();
        showSuccessOverlay();
        document.getElementById('shopRegistrationForm').reset();

    } catch (error) {
        hideLoader();
        setButtonAble();
        showErrorOverlay([error.message]);
    }
});

// Helper function to show field errors
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup?.classList.add('error');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    formGroup?.appendChild(errorElement);
}

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

        // return set(dbRef(db, 'AR_shoe_users/shop/' + userId + '/uploads'), data);
        return set(dbRef(db, `AR_shoe_users/shop/${userId}/uploads`), data);
    });
}