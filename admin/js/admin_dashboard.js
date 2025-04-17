import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Initialize Firebase
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global variables
let currentAction = null; // Stores 'approve' or 'reject'
let currentRow = null;    // Stores the table row being acted upon
let currentShopId = null; // Stores the shop ID

// DOM elements
const dialog = document.getElementById("confirmationDialog");
const overlay = document.getElementById("overlay");
const logoutDialog = document.getElementById('logoutDialog');
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const logoutLink = document.querySelector('a[href="/admin/html/admin_login.html"]');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');
const modal = document.getElementById("ModalDialog");

// --- Utility Functions ---
function checkEmptyTable() {
    const tbody = document.querySelector('tbody');
    if (tbody && tbody.querySelectorAll('tr').length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No pending shops remaining</td></tr>';
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error("Notification element not found!");
        return;
    }

    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Trigger the show animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10); // Small timeout to ensure CSS transition works

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Reset after transition completes
        setTimeout(() => {
            notification.className = 'notification';
        }, 400); // Matches your CSS transition duration
    }, 3000);
}

function updateDialogContent(shop, actionType) {
    const dialogMessage = document.getElementById("dialogMessage");
    const confirmBtn = document.getElementById("confirmAction");
    const confirmIcon = confirmBtn.querySelector('i');
    const actionText = confirmBtn.querySelector('.action-text');
    const rejectionInput = document.getElementById("rejectionReason");

    const username = shop.username || 'N/A';
    const shopName = shop.shopName || 'Unknown Shop';

    dialogMessage.textContent = `Are you sure you want to ${actionType} "${shopName}" (${username})?`;

    if (actionType === 'approve') {
        confirmIcon.className = 'fas fa-check';
        actionText.textContent = 'Approve';
        confirmBtn.className = 'approve-btn';
        rejectionInput.style.display = 'none';  // hide reason input
    } else {
        confirmIcon.className = 'fas fa-ban';
        actionText.textContent = 'Reject';
        confirmBtn.className = 'reject-btn';
        rejectionInput.style.display = 'block'; // show reason input
        rejectionInput.value = ''; // clear previous input
    }
}

function showDialog() {
    dialog?.classList.add("show");
    overlay?.classList.add("show");
}

function showModalfunc() {
    modal?.classList.add("show");
    overlay?.classList.add("show");
}

function hideDialog() {
    dialog?.classList.remove("show");
    overlay?.classList.remove("show");
    modal?.classList.remove("show");
    currentAction = null;
    currentRow = null;
    currentShopId = null;
}

function showModal(e) {
    e.preventDefault();
    currentShopId = e.currentTarget.getAttribute('data-id');
    currentRow = e.currentTarget.closest("tr");

    const shopRef = ref(db, `AR_shoe_users/shop/${currentShopId}`);

    onValue(shopRef, (snapshot) => {
        if (snapshot.exists()) {
            const shop = snapshot.val();
            updateModalContent(shop, currentShopId);
            showModalfunc();
        } else {
            showNotification("Shop data not found", "error");
        }
    });
}

function updateModalContent(shop, currentShopId) {
    const modalContent = document.getElementById("modalContent");
    const modalName = document.getElementById("modalName");
    
    modalContent.innerHTML = `
        <div class="modal-body">
            <div class="info-group">
                <span class="info-label">Shop Name: </span>
                <span class="info-value">${shop.shopName || 'Unknown Shop'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Shop Category: </span>
                <span class="info-value">${shop.shopCategory || 'Unknown Category'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Shop Description: </span>
                <span class="info-value">${shop.shopDescription || 'Unknown Description'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Years in Business: </span>
                <span class="info-value">${shop.yearsInBusiness || 'Unknown Years in Business'}</span>
            </div>
            
            <h3 style="margin: 20px 0 10px; color: var(--secondary-color);">Owner Information</h3>
            <div class="info-group">
                <span class="info-label">Owner Name: </span>
                <span class="info-value">${shop.ownerName || 'Unknown Owner'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Email: </span>
                <span class="info-value">${shop.email || 'Unknown Email'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Phone Number: </span>
                <span class="info-value">+63 ${shop.ownerPhone || 'Unknown Phone'}</span>
            </div>
            
            <h3 style="margin: 20px 0 10px; color: var(--secondary-color);">Location Information</h3>
            <div class="info-group">
                <span class="info-label">Address: </span>
                <span class="info-value">${shop.shopAddress || 'Unknown Barangay'}, ${shop.shopCity || 'Unknown City'}, ${shop.shopState || 'Unknown Province'}, ${shop.shopCountry || 'Unknown Country'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">City: </span>
                <span class="info-value">${shop.shopCity || 'Unknown City'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">State/Province: </span>
                <span class="info-value">${shop.shopState || 'Unknown Province'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">ZIP Code: </span>
                <span class="info-value">${shop.shopZip || 'Unknown ZIP Code'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Country: </span>
                <span class="info-value">${shop.shopCountry || 'Unknown Country'}</span>
            </div>
            
            <h3 style="margin: 20px 0 10px; color: var(--secondary-color);">Business Documentation</h3>
            <div class="info-group">
                <span class="info-label">Tax Identification Number: </span>
                <span class="info-value">${shop.identificationTax || 'Unknown Identification Tax'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Documents: </span>
                <div class="document-preview">
                    <div class="document-thumbnail">
                        <a href="${shop.uploads.frontSideID.url || 'no image available'}" 
                            target="_blank" 
                            rel="noopener noreferrer">
                            <img src="${shop.uploads.frontSideID.url || 'no image available'}" 
                                width="100px" height="100px" alt="Front Side ID Url">
                        </a>
                    </div>
                    <div class="document-thumbnail">
                        <a href="${shop.uploads.backSideID.url || 'no image available'}" 
                            target="_blank" 
                            rel="noopener noreferrer">
                            <img src="${shop.uploads.backSideID.url || 'no image available'}" 
                                width="100px" height="100px" alt="Back Side ID Url">
                        </a>
                    </div>
                    <div class="document-thumbnail">
                        <a href="${shop.uploads.licensePreview.url || 'no image available'}" 
                            target="_blank" 
                            rel="noopener noreferrer">
                            <img src="${shop.uploads.licensePreview.url || 'no image available'}" 
                                width="100px" height="100px" alt="License Preview Url">
                        </a>
                    </div>
                    <div class="document-thumbnail">
                        <a href="${shop.uploads.permitDocument.url || 'no image available'}" 
                            target="_blank" 
                            rel="noopener noreferrer">
                            <img src="${shop.uploads.permitDocument.url || 'no image available'}" 
                                width="100px" height="100px" alt="Permit Document Url">
                        </a>
                    </div>
                </div>
            </div>
            
            <h3 style="margin: 20px 0 10px; color: var(--secondary-color);">Account Information</h3>
            <div class="info-group">
                <span class="info-label">Username: </span>
                <span class="info-value">${shop.username || 'Unknown username'}</span>
            </div>
            <div class="info-group">
                <span class="info-label">Registration Date: </span>
                <span class="info-value">${shop.dateProcessed || 'Unknown Identification Tax'}</span>
            </div>
        </div>
    `;
}


// --- Shop Management Functions ---
function showConfirmationDialog(e, actionType) {
    e.preventDefault();
    currentShopId = e.currentTarget.getAttribute('data-id');
    currentAction = actionType;
    currentRow = e.currentTarget.closest("tr");

    const shopRef = ref(db, `AR_shoe_users/shop/${currentShopId}`);

    onValue(shopRef, (snapshot) => {
        if (snapshot.exists()) {
            const shop = snapshot.val();
            updateDialogContent(shop, actionType);
            showDialog();
        } else {
            showNotification("Shop data not found", "error");
        }
    }, { onlyOnce: true });
}

function loadShops(status, tableBodyId) {
    const shopsRef = ref(db, 'AR_shoe_users/shop');
    const tbody = document.getElementById(tableBodyId);

    if (!tbody) return;

    onValue(shopsRef, (snapshot) => {
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="7">No shops found</td></tr>`;
            return;
        }

        let hasShops = false;
        snapshot.forEach((childSnapshot) => {
            const shop = childSnapshot.val();
            if (shop.status === status) {
                hasShops = true;
                const row = createShopRow(childSnapshot.key, shop, status);
                tbody.appendChild(row);
            }
        });

        if (!hasShops) {
            tbody.innerHTML = `<tr><td colspan="7">No ${status} shops found</td></tr>`;
        }
    });
}

function createShopRow(shopId, shop, status) {
    const row = document.createElement('tr');
    row.className = 'animate-fade';
    row.setAttribute('data-id', shopId);

    const maxLength = 10; // Set your desired character limit
    const reasonText = shop.rejectionReason || 'No reason provided';
    const shortenedText = reasonText.length > maxLength ? reasonText.substring(0, maxLength) + '...' : reasonText;

    row.innerHTML = `
        <td title="${shopId}">${shopId.substring(0, 6)}...</td>
        <td>${shop.shopName || 'N/A'}</td>
        <td>${shop.ownerName || 'N/A'}</td>
        <td>${shop.email || 'N/A'}</td>
        <td><a href="#" data-id="${shopId}" class="view-link"><i class="fas fa-eye"></i> View</a></td>
        <td>${shop.dateProcessed || 'Pending'}</td>
        ${status === 'rejected' ? `<td title="${shortenedText}">${shortenedText || 'No reason'}</td>` : ''}
        <td>
            ${status === 'pending' ?
            `<button class="approve-btn" data-id="${shopId}"><i class="fas fa-check"></i> Approve</button>
                 <button class="reject-btn" data-id="${shopId}"><i class="fas fa-ban"></i> Reject</button>` :
            status === 'approved' ?
                `<button class="reject-btn" data-id="${shopId}"><i class="fas fa-ban"></i> Reject</button>` :
                `<button class="approve-btn" data-id="${shopId}"><i class="fas fa-check"></i> Approve</button>`}
        </td>
    `;

    row.querySelector('.approve-btn')?.addEventListener('click', (e) => showConfirmationDialog(e, 'approve'));
    row.querySelector('.reject-btn')?.addEventListener('click', (e) => showConfirmationDialog(e, 'reject'));
    row.querySelector('.view-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(e);
    });

    return row;
}

// --- Event Listeners ---
function initializeEventListeners() {
    document.getElementById("closeModal")?.addEventListener("click", hideDialog);
    
    // Menu toggle
    menuBtn?.addEventListener("click", function () {
        navLinks?.classList.toggle("active");
    });

    // Action confirmation
    document.getElementById("confirmAction")?.addEventListener("click", function () {
        if (!currentAction || !currentShopId) return;
    
        const rejectionInput = document.getElementById("rejectionReason");
        let reason = null;
    
        if (currentAction === "reject") {
            reason = rejectionInput.value.trim();
            if (!reason) {
                showNotification("Please provide a reason for rejection.", "error");
                
                // Add visual feedback to the textarea
                rejectionInput.style.border = "2px solid red";
                rejectionInput.focus();
                
                // Remove the red border after 2 seconds
                setTimeout(() => {
                    rejectionInput.style.border = "";
                }, 2000);
                
                return;
            }
        }
    
        const shopRef = ref(db, `AR_shoe_users/shop/${currentShopId}`);
        const updateData = {
            status: currentAction === "approve" ? "approved" : "rejected",
            ...(reason && { rejectionReason: reason })
        };
    
        update(shopRef, updateData)
            .then(() => {
                showNotification(`Shop ${currentAction}ed successfully!`, "success");
                currentRow?.remove();
                checkEmptyTable();
            })
            .catch((error) => {
                showNotification(`Failed to ${currentAction} shop: ${error.message}`, "error");
            })
            .finally(() => {
                hideDialog();
            });
    });

    document.getElementById("cancelAction")?.addEventListener("click", hideDialog);

    // Logout
    logoutLink?.addEventListener('click', function (e) {
        e.preventDefault();
        logoutDialog?.classList.add('show');
        overlay?.classList.add('show');
    });

    cancelLogout?.addEventListener('click', function () {
        logoutDialog?.classList.remove('show');
        overlay?.classList.remove('show');
    });

    confirmLogout?.addEventListener('click', function () {
        window.location.href = '/admin/html/admin_login.html';
    });

    overlay?.addEventListener('click', function () {
        logoutDialog?.classList.remove('show');
        dialog?.classList.remove('show');
        modal?.classList.remove('show');
        this.classList.remove('show');
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadShops('pending', 'pendingShopsTableBody');
    loadShops('approved', 'approvedShopsTableBody');
    loadShops('rejected', 'rejectedShopsTableBody');
});