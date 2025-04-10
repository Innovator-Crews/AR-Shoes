import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAuPALylh11cTArigeGJZmLwrFwoAsNPSI",
    authDomain: "opportunity-9d3bf.firebaseapp.com",
    databaseURL: "https://opportunity-9d3bf-default-rtdb.firebaseio.com",
    projectId: "opportunity-9d3bf",
    storageBucket: "opportunity-9d3bf.appspot.com", // fixed here
    messagingSenderId: "57906230058",
    appId: "1:57906230058:web:2d7cd9cc68354722536453",
    measurementId: "G-QC2JSR1FJW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let shopID;

document.addEventListener('DOMContentLoaded', () => {
    const random6DigitCode = generate6DigitCode();
    document.getElementById('shoeCode').value = ""+random6DigitCode;
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        shopID = user.uid;
        console.log("shopID: ", shopID);
    } else {
        window.location.href = "user_login.html";
    }
});

    function generate6DigitCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function generate18CharID() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 18; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }


    
    document.getElementById('shoeCode').disabled = true;

    document.getElementById('addShoeBtn').addEventListener('click', function () {
        if (!shopID) {
            alert("Please wait for authentication to complete");
            return;
        }
    
        // Get the shoeCode from the input field
        const shoeCode = document.getElementById('shoeCode').value;
    
        const shoeName = document.getElementById('shoeName').value;
        const shoeDescription = document.getElementById('shoeDescription').value;
        const variantName_1 = document.getElementById('variantName_1').value;
        const color_1 = document.getElementById('color_1').value;
        const variantPrice_1 = document.getElementById('variantPrice_1').value;
        const random18CharID = generate18CharID();
    
        set(ref(db, 'AR_shoe_users/shoe/' + shopID + '/' + random18CharID + "_" + shoeCode), {
            shoeName: shoeName,
            shoeCode: shoeCode,  // Use the retrieved value
            generalDescription: shoeDescription,
            defaultImage: '',
            variantName: variantName_1,
            color: color_1,
            price: variantPrice_1,
            variantImage: '',
            shopID: shopID,
        }).then(() => {
            console.log("Shoe data added successfully!");
            alert("Shoe added successfully!");
            window.location.href = "shopowner_addshoe.html";
        }).catch((error) => {
            console.error("Error adding shoe data: ", error);
            alert("Error adding shoe data: " + error.message);
        });
    });
