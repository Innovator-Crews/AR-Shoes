import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, remove, set, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAuPALylh11cTArigeGJZmLwrFwoAsNPSI",
    authDomain: "opportunity-9d3bf.firebaseapp.com",
    databaseURL: "https://opportunity-9d3bf-default-rtdb.firebaseio.com",
    projectId: "opportunity-9d3bf",
    storageBucket: "opportunity-9d3bf.appspot.com",
    messagingSenderId: "57906230058",
    appId: "1:57906230058:web:2d7cd9cc68354722536453",
    measurementId: "G-QC2JSR1FJW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let shopLoggedin;

// Add this at the top to expose functions to global scope
window.showShoeDetails = showShoeDetails;
window.editShoe = editShoe;
window.promptDelete = promptDelete;
window.closeModal = closeModal;

onAuthStateChanged(auth, (user) => {
    if (user) {
        shopLoggedin = user.uid;
        loadShops('inventoryTableBody'); // Load shops after authentication
    } else {
        window.location.href = "user_login.html";
    }
});

// Modified loadShops function
function loadShops(tableBodyId) {
    const shopsRef = ref(db, `AR_shoe_users/shoe/${shopLoggedin}`);
    const tbody = document.getElementById(tableBodyId);

    if (!tbody) return;

    onValue(shopsRef, (snapshot) => {
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="7">No shoes found</td></tr>`;
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const shoe = childSnapshot.val();
            const row = createShopRow(childSnapshot.key, shoe);
            tbody.appendChild(row);
        });
    });
}

function createShopRow(shoeId, shoe) {
    const row = document.createElement('tr');
    row.className = 'animate-fade';
    row.setAttribute('data-id', shoeId);

    // Calculate total stock if available
    let totalStock = 'N/A';
    if (shoe.stock && Array.isArray(shoe.stock)) {
        totalStock = shoe.stock.reduce((sum, item) => sum + parseInt(item), 0);
    }

    row.innerHTML = `
        <td>${shoe.variantImage ? '...' : 'No Image'}</td>
        <td>${shoe.shoeName || 'N/A'}</td>
        <td>${shoe.shoeCode || 'N/A'}</td>
        <td>$${shoe.price || 'No description'}</td>
        <td>${shoe.totalStock || 'N/A'}</td>
        <td>${shoe.addedTime || 'N/A'}</td>
        <td>
            <button class="btn btn-view" onclick="showShoeDetails('${shoeId}')">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-edit" onclick="editShoe('${shoeId}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="promptDelete('${shoeId}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;
    return row;
}

// Modified showShoeDetails function
function showShoeDetails(shoeId) {
    // Use the correct path including shop ID
    const shoeRef = ref(db, `AR_shoe_users/shoe/${shopLoggedin}/${shoeId}`);

    onValue(shoeRef, (snapshot) => {
        const shoe = snapshot.val();
        if (!shoe) {
            alert('Shoe not found');
            return;
        }

        // Ensure modal elements exist
        const modalContent = document.getElementById('shoeDetailsContent');
        const modalElement = document.getElementById('shoeDetailsModal');

        if (!modalContent || !modalElement) {
            console.error('Modal elements not found in DOM');
            return;
        }

        let variantsHtml = '';
        if (shoe.variantName && shoe.color && shoe.price) {
            variantsHtml = `
                <div class="variant-detail">
                    <h4>${shoe.variantName} (${shoe.color})</h4>
                    <p><strong>Price:</strong> $${shoe.price}</p>
                    ${shoe.variantImage ? `<img src="${shoe.variantImage}" alt="${shoe.variantName}" style="max-width:100px; margin:0.5rem 0;">` : ''}
                </div>
                <hr style="margin-top: 1rem; margin-bottom: 1rem;">
            `;
        }

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Shoe Name: ${shoe.shoeName || 'N/A'}</h2>
                <h3>Shoe Code: ${shoe.shoeCode || 'N/A'}</h3>
                <button onclick="closeModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Description:</strong> ${shoe.generalDescription || 'No description'}</p>
                ${shoe.defaultImage ? `<img src="${shoe.defaultImage}" alt="${shoe.shoeCode}" style="max-width:100%; margin:1rem 0; border-radius:8px;">` : ''}
                <h3 style="margin-top:1.5rem;">Variants</h3>
                ${variantsHtml}
            </div>
        `;

        modalElement.classList.add('show');
        document.body.classList.add('modal-open');
    }, (error) => {
        console.error("Error fetching shoe details:", error);
        alert('Error loading shoe details');
    });
}

// Modal and delete functions
function closeModal() {
    document.getElementById('shoeDetailsModal').classList.remove('show');
    document.body.classList.remove('modal-open');
}

function promptDelete(shoeId) {
    if (confirm('Are you sure you want to delete this shoe?')) {
        deleteShoe(shoeId);
    }
}

function deleteShoe(shoeId) {
    const shoeRef = ref(db, `AR_shoe_users/shoe/${shopLoggedin}/` + shoeId);
    remove(shoeRef)
        .then(() => {
            alert("Data deleted successfully!");
        })
        .catch((error) => {
            console.error("Error deleting data:", error);
        });
}

// Edit function
function editShoe(shoeId) {
    window.location.href = `shopowner_addshoe.html?edit=${shoeId}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Role-based access control
    const userRole = localStorage.getItem('userRole');
    if (userRole === "employee") {
        document.querySelectorAll(".manager, .shopowner").forEach(el => el.style.display = "none");
    } else if (userRole === "manager") {
        document.querySelectorAll(".shopowner").forEach(el => el.style.display = "none");
    }

    // Search functionality
    document.getElementById('searchInventory')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#inventoryTable tbody tr').forEach(row => {
            const name = row.children[1]?.textContent.toLowerCase() || '';
            const code = row.children[2]?.textContent.toLowerCase() || '';
            row.style.display = (name.includes(term)) || (code.includes(term)) ? '' : 'none';
        });
    });
});