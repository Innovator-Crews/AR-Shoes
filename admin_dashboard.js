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
let currentPage = 1;
const rowsPerPage = 10;

// DOM elements
const dialog = document.getElementById("confirmationDialog");
const overlay = document.getElementById("overlay");
const logoutDialog = document.getElementById('logoutDialog');
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const logoutLink = document.querySelector('a[href="admin_login.html"]');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// --- Utility Functions ---
function hideDialog() {
    dialog?.classList.remove("show");
    overlay?.classList.remove("show");
    currentAction = null;
    currentRow = null;
    currentShopId = null;
}

function checkEmptyTable() {
    const tbody = document.querySelector('tbody');
    if (tbody && tbody.querySelectorAll('tr').length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No pending shops remaining</td></tr>';
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// updateDialogContent function to update the dialog message and button styles
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
        <td><a href="#" class="view-link"><i class="fas fa-eye"></i> View</a></td>
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

    return row;
}


function updateTableDisplay() {
    const tableBody = document.querySelector("#pending-shops tbody");
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll("tr");
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    rows.forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });
}



// --- Event Listeners ---
function initializeEventListeners() {
    // Menu toggle
    menuBtn?.addEventListener("click", function() {
        navLinks?.classList.toggle("active");
    });

    // updated Action confirmation
    document.getElementById("confirmAction")?.addEventListener("click", function () {
        if (!currentAction || !currentShopId) return;
    
        const rejectionInput = document.getElementById("rejectionReason");
        let reason = null;
    
        if (currentAction === "reject") {
            reason = rejectionInput.value.trim();
            if (!reason) {
                showNotification("Please provide a reason for rejection.", "error");
                return;
            }
        }
    
        const shopRef = ref(db, `AR_shoe_users/shop/${currentShopId}`);
        const updateData = {
            status: currentAction === "approve" ? "approved" : "rejected",
            ...(reason && { rejectionReason: reason }) // only add if rejecting
        };
    
        update(shopRef, updateData)
            .then(() => {
                showNotification(`Shop ${currentAction}ed successfully!`, "success");
                currentRow?.remove();
                checkEmptyTable();
                updatePaginationAfterAction();
            })
            .catch((error) => {
                showNotification(`Failed to ${currentAction} shop: ${error.message}`, "error");
            })
            .finally(() => {
                hideDialog();
            });
    });
    

    document.getElementById("cancelAction")?.addEventListener("click", hideDialog);

    // Pagination
    prevBtn?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            setupPagination();
        }
    });

    nextBtn?.addEventListener("click", () => {
        const rows = document.querySelector("#pending-shops tbody")?.querySelectorAll("tr") || [];
        const pageCount = Math.ceil(rows.length / rowsPerPage);
        
        if (currentPage < pageCount) {
            currentPage++;
            setupPagination();
        }
    });

    // Logout
    logoutLink?.addEventListener('click', function(e) {
        e.preventDefault();
        logoutDialog?.classList.add('show');
        overlay?.classList.add('show');
    });

    cancelLogout?.addEventListener('click', function() {
        logoutDialog?.classList.remove('show');
        overlay?.classList.remove('show');
    });

    confirmLogout?.addEventListener('click', function() {
        window.location.href = 'admin_login.html';
    });

    overlay?.addEventListener('click', function() {
        logoutDialog?.classList.remove('show');
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



// --------------------------------------------------CODE NI MACMAC-------------------------------------------------------
/*document.addEventListener("DOMContentLoaded", function () {
    // --- Menu toggle functionality ---
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", function() {
            navLinks.classList.toggle("active");
        });
    }

    // --- Action confirmation dialog ---
    let currentAction = null; // Stores 'approve' or 'reject'
    let currentRow = null;    // Stores the table row being acted upon
    const dialog = document.getElementById("confirmationDialog");
    const overlay = document.getElementById("overlay");

    function confirmAction(button, actionType) {
        currentRow = button.closest("tr");
        if (!currentRow) {
            console.error("Could not find table row for action.");
            return;
        }
        currentAction = actionType;

        const shopName = currentRow.cells[1]?.textContent || '[Unknown Shop]';
        const dialogMessage = document.getElementById("dialogMessage");
        const confirmBtn = document.getElementById("confirmAction");
        const cancelBtn = document.getElementById("cancelAction");
        const confirmIcon = confirmBtn.querySelector('i');
        const actionText = confirmBtn.querySelector('.action-text');

        if (!dialog || !dialogMessage || !overlay || !confirmBtn || !cancelBtn) {
            console.error("Dialog elements not found.");
            return;
        }

        // Update dialog content
        dialogMessage.textContent = `Are you sure you want to ${actionType} "${shopName}"?`;
        
        // Update button text and icon
        if (actionType === 'approve') {
            confirmIcon.className = 'fas fa-check';
            actionText.textContent = 'Approve';
            confirmBtn.className = 'approve-btn';
        } else {
            confirmIcon.className = 'fas fa-ban';
            actionText.textContent = 'Reject';
            confirmBtn.className = 'reject-btn';
        }

        // Show dialog and overlay
        dialog.classList.add("show");
        overlay.classList.add("show");
    }

    // Handle approve/reject button clicks
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('approve-btn')) {
            confirmAction(target, 'approve');
        } else if (target.classList.contains('reject-btn')) {
            confirmAction(target, 'reject');
        }
    });

    // Confirm action handler
    document.getElementById("confirmAction")?.addEventListener("click", function() {
        // Hide dialog
        dialog?.classList.remove("show");
        overlay?.classList.remove("show");

        if (currentAction && currentRow) {
            if (currentAction === "approve") {
                approveShop(currentRow);
            } else {
                rejectShop(currentRow);
            }
        }

        // Reset state
        currentAction = null;
        currentRow = null;
    });

    // Cancel action handler
    document.getElementById("cancelAction")?.addEventListener("click", function() {
        // Hide dialog
        dialog?.classList.remove("show");
        overlay?.classList.remove("show");

        // Reset state
        currentAction = null;
        currentRow = null;
    });

    // Shop approval function
    function approveShop(row) {
        const shopId = row.getAttribute("data-id");
        const shopName = row.cells[1]?.textContent || '[Unknown Shop]';

        // Simulate API call
        setTimeout(() => {
            row.remove();
            showNotification(`"${shopName}" has been approved successfully!`, "success");
            updatePaginationAfterAction();
        }, 300);
    }

    // Shop rejection function
    function rejectShop(row) {
        const shopId = row.getAttribute("data-id");
        const shopName = row.cells[1]?.textContent || '[Unknown Shop]';
        const reason = prompt(`Please enter the reason for rejecting "${shopName}":`);

        if (reason !== null && reason.trim() !== '') {
            // Simulate API call
            setTimeout(() => {
                row.remove();
                showNotification(`"${shopName}" has been rejected. Reason: ${reason}`, "error");
                updatePaginationAfterAction();
            }, 300);
        } else if (reason !== null) {
            alert("Rejection reason cannot be empty.");
        }
    }

    // Update pagination after row removal
    function updatePaginationAfterAction() {
        const tableBody = document.querySelector("#pending-shops tbody");
        if (tableBody && tableBody.querySelectorAll("tr:not([style*='display: none'])").length === 0 && currentPage > 1) {
            currentPage--;
        }
        setupPagination();
    }

    // Notification function
    function showNotification(message, type) {
        const notification = document.getElementById("notification");
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type, 'show');
            
            setTimeout(() => {
                notification.classList.remove("show");
            }, 3000);
        }
    }

    // --- Pagination variables ---
    let currentPage = 1;
    const rowsPerPage = 10;
    const tableBody = document.querySelector("#pending-shops tbody");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const paginationContainer = document.querySelector(".pagination");

    // --- Initialize pagination ---
    function setupPagination() {
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll("tr");
        const pageCount = Math.ceil(rows.length / rowsPerPage);
        
        // Clear existing page buttons (except prev/next)
        document.querySelectorAll('.page-btn').forEach(btn => btn.remove());
        
        // Don't show pagination if only one page
        if (pageCount <= 1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }
        
        // Create page buttons (show max 5 pages at a time)
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages/2));
        let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
        
        // Adjust if we're at the start or end
        if (endPage - startPage + 1 < maxVisiblePages) {
            if (currentPage < pageCount/2) {
                endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
            } else {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }
        
        // Add first page and ellipsis if needed
        if (startPage > 1) {
            createPageButton(1);
            if (startPage > 2) {
                addEllipsis();
            }
        }
        
        // Add visible pages
        for (let i = startPage; i <= endPage; i++) {
            createPageButton(i);
        }
        
        // Add last page and ellipsis if needed
        if (endPage < pageCount) {
            if (endPage < pageCount - 1) {
                addEllipsis();
            }
            createPageButton(pageCount);
        }
        
        updateTableDisplay();
        updatePaginationButtons();
    }

    function createPageButton(pageNumber) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "pagination-btn page-btn";
        pageBtn.textContent = pageNumber;
        pageBtn.classList.toggle("active", pageNumber === currentPage);
        
        pageBtn.addEventListener("click", () => {
            currentPage = pageNumber;
            setupPagination();
        });

        paginationContainer.insertBefore(pageBtn, nextBtn);
    }

    function createEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'pagination-ellipsis';
        paginationContainer.insertBefore(ellipsis, nextBtn);
    }

    function updateTableDisplay() {
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll("tr");
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        rows.forEach((row, index) => {
            row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
        });
    }

    function updatePaginationButtons() {
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll("tr");
        const pageCount = Math.ceil(rows.length / rowsPerPage);
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === pageCount || pageCount === 0;
    }

    // Pagination button handlers
    prevBtn?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            setupPagination();
        }
    });

    nextBtn?.addEventListener("click", () => {
        const rows = tableBody?.querySelectorAll("tr") || [];
        const pageCount = Math.ceil(rows.length / rowsPerPage);
        
        if (currentPage < pageCount) {
            currentPage++;
            setupPagination();
        }
    });

    // Initialize
    setupPagination();
});

// Logout functionality
const logoutLink = document.querySelector('a[href="admin_login.html"]');
const logoutDialog = document.getElementById('logoutDialog');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

// Prevent default logout link behavior
logoutLink?.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show logout confirmation dialog
    logoutDialog.classList.add('show');
    document.getElementById('overlay').classList.add('show');
});

// Cancel logout
cancelLogout?.addEventListener('click', function() {
    logoutDialog.classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

// Confirm logout
confirmLogout?.addEventListener('click', function() {
    // In a real app, you might want to:
    // 1. Send a logout request to your backend
    // 2. Clear any session data
    // 3. Then redirect
    
    // For this example, we'll just redirect immediately
    window.location.href = 'admin_login.html';
});

// Close dialog when clicking overlay
document.getElementById('overlay')?.addEventListener('click', function() {
    logoutDialog.classList.remove('show');
    this.classList.remove('show');
});*/