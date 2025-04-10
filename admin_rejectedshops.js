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

// --- Action confirmation dialog ---
let currentAction = null; // Stores 'approve' or 'reject'
let currentRow = null;    // Stores the table row being acted upon
let currentShopId = null; // Stores the shop ID
const dialog = document.getElementById("confirmationDialog");
const overlay = document.getElementById("overlay");

// Confirm action handler
document.getElementById("confirmAction")?.addEventListener("click", function() {
    if (!currentAction || !currentShopId) return;
    
    const shopRef = ref(db, `AR_shoe_users/shop/${currentShopId}`);
    const updateData = {
        status: currentAction === "approve" ? "approved" : "rejected",
        // dateProcessed: new Date().toISOString()
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

// Cancel action handler
document.getElementById("cancelAction")?.addEventListener("click", hideDialog);

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

function updateDialogContent(shop, actionType) {
    const dialogMessage = document.getElementById("dialogMessage");
    const confirmBtn = document.getElementById("confirmAction");
    const confirmIcon = confirmBtn.querySelector('i');
    const actionText = confirmBtn.querySelector('.action-text');
    
    const username = shop.username || 'N/A';
    const shopName = shop.shopName || 'Unknown Shop';

    dialogMessage.textContent = `Are you sure you want to ${actionType} "${shopName}" (${username})?`;
    
    if (actionType === 'approve') {
        confirmIcon.className = 'fas fa-check';
        actionText.textContent = 'Approve';
        confirmBtn.className = 'approve-btn';
    } else {
        confirmIcon.className = 'fas fa-ban';
        actionText.textContent = 'Reject';
        confirmBtn.className = 'reject-btn';
    }
}

function showDialog() {
    dialog?.classList.add("show");
    overlay?.classList.add("show");
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

// Load shops functions (simplified example)
// function loadShops(status, tableBodyId) {
//     const shopsRef = ref(db, 'AR_shoe_users/shop');
//     const tbody = document.getElementById(tableBodyId);
    
//     if (!tbody) return;

//     onValue(shopsRef, (snapshot) => {
//         tbody.innerHTML = '';
        
//         if (!snapshot.exists()) {
//             tbody.innerHTML = `<tr><td colspan="7">No shops found</td></tr>`;
//             return;
//         }

//         let hasShops = false;
//         snapshot.forEach((childSnapshot) => {
//             const shop = childSnapshot.val();
//             if (shop.status === status) {
//                 hasShops = true;
//                 const row = createShopRow(childSnapshot.key, shop, status);
//                 tbody.appendChild(row);
//             }
//         });

//         if (!hasShops) {
//             tbody.innerHTML = `<tr><td colspan="7">No ${status} shops found</td></tr>`;
//         }
//     });
// }

function createShopRow(shopId, shop, status) {
    const row = document.createElement('tr');
    row.className = 'animate-fade';
    row.setAttribute('data-id', shopId);

    const maxLength = 10; // Set your desired character limit
    const reasonText = shop.rejectionReason || 'No reason provided';
    const shortenedText = reasonText.length > maxLength ? reasonText.substring(0, maxLength) + '...' : reasonText;

    // Basic row content - customize as needed
    row.innerHTML = `
        <td title="${shopId}">${shopId.substring(0, 6)}...</td>
        <td>${shop.shopName || 'N/A'}</td>
        <td>${shop.ownerName || 'N/A'}</td>
        <td>${shop.email || 'N/A'}</td>
        <td><a href="#" class="view-link"><i class="fas fa-eye"></i> View</a></td>
        <td>${shop.dateProcessed || 'Pending'}</td>
        <td title="${shop.rejectionReason}">${shortenedText || 'No reason'}</td>
        <td>
            ${status === 'pending' ? 
                `<button class="approve-btn" data-id="${shopId}"><i class="fas fa-check"></i> Approve</button>
                 <button class="reject-btn" data-id="${shopId}"><i class="fas fa-ban"></i> Reject</button>` :
                status === 'approved' ?
                `<button class="reject-btn" data-id="${shopId}"><i class="fas fa-ban"></i> Reject</button>` :
                `<button class="approve-btn" data-id="${shopId}"><i class="fas fa-check"></i> Approve</button>`}
        </td>
    `;

    // Add event listeners
    row.querySelector('.approve-btn')?.addEventListener('click', (e) => showConfirmationDialog(e, 'approve'));
    row.querySelector('.reject-btn')?.addEventListener('click', (e) => showConfirmationDialog(e, 'reject'));

    return row;
}

  

// -----------------------------------------add from macmac code---------------------------------------------------
    let currentPage = 1;
    const rowsPerPage = 10;
    const tableBody = document.querySelector("#rejected-shops tbody");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const paginationContainer = document.querySelector(".pagination");

    function updateTableDisplay() {
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll("tr");
        if (rows.length === 0) return;
        
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
        nextBtn.disabled = currentPage >= pageCount || pageCount === 0;

        const pageButtons = paginationContainer.querySelectorAll(".page-btn");
        pageButtons.forEach(btn => {
            btn.classList.remove("active");
            if (parseInt(btn.textContent) === currentPage) {
                btn.classList.add("active");
            }
        });
    

        // Update Previous/Next button disabled states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === pageCount || pageCount === 0; // Also disable if no pages
    }
    function createPageButton(pageNumber) {
        const pageBtn = document.createElement("button");
        pageBtn.className = "pagination-btn page-btn";
        pageBtn.textContent = pageNumber;

        if (pageNumber === currentPage) {
            pageBtn.classList.add("active");
        }

        pageBtn.addEventListener("click", () => {
            currentPage = pageNumber;
            setupPagination();
        });

        paginationContainer.insertBefore(pageBtn, nextBtn);
    }

    //------------------------------------------dito matatapos code ni mac------------------------------------------

// Search functionality
const searchInput = document.getElementById('shopSearch');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearch');

// Store the original shops data
let originalShops = [];
let filteredShops = [];

// Modified loadShops function to store data
function loadShops(status, tableBodyId) {
    const shopsRef = ref(db, 'AR_shoe_users/shop');
    const tbody = document.getElementById(tableBodyId);

    if (!tbody) return;

    onValue(shopsRef, (snapshot) => {
        tbody.innerHTML = '';
        originalShops = [];

        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="7">No shops found</td></tr>`;
            return;
        }

        let hasShops = false;
        snapshot.forEach((childSnapshot) => {
            const shop = childSnapshot.val();
            if (shop.status === status) {
                hasShops = true;
                const shopWithId = { ...shop, id: childSnapshot.key };
                originalShops.push(shopWithId);
                const row = createShopRow(childSnapshot.key, shop, status);
                tbody.appendChild(row);
            }
        });

        if (!hasShops) {
            tbody.innerHTML = `<tr><td colspan="7">No ${status} shops found</td></tr>`;
        }

        // Initialize filteredShops with all shops
        filteredShops = [...originalShops];
        
        // Setup pagination after loading data
        setupPagination();
    });
}

// Search function - UPDATED to use correct table ID
function performSearch(searchTerm) {
    const tbody = document.getElementById('rejectedShopsTableBody'); // Changed to rejectedShopsTableBody
    if (!tbody) return;

    if (!searchTerm.trim()) {
        // If search is empty, show all shops
        filteredShops = [...originalShops];
    } else {
        // Filter shops based on search term
        filteredShops = originalShops.filter(shop => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (shop.id && shop.id.toLowerCase().includes(searchLower)) ||
                (shop.shopName && shop.shopName.toLowerCase().includes(searchLower)) ||
                (shop.ownerName && shop.ownerName.toLowerCase().includes(searchLower)) ||
                (shop.email && shop.email.toLowerCase().includes(searchLower))
            );
        });
    }

    // Clear current table
    tbody.innerHTML = '';

    // Display filtered results
    if (filteredShops.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No matching shops found</td></tr>';
    } else {
        filteredShops.forEach(shop => {
            const row = createShopRow(shop.id, shop, 'rejected'); // Changed status to 'approved'
            tbody.appendChild(row);
        });
    }

    // Reset to first page after search
    currentPage = 1;
    setupPagination();
}

// Event listeners for search
function setupSearchListeners() {
    searchBtn?.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
    });

    clearSearchBtn?.addEventListener('click', () => {
        searchInput.value = '';
        performSearch('');
    });

    searchInput?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value.trim());
        }
    });
}

// Update your setupPagination function to work with filteredShops
function setupPagination() {
    const rows = document.querySelectorAll("#rejectedShopsTableBody tr"); // Updated selector
    const pageCount = Math.ceil(rows.length / rowsPerPage);

    // Clear existing page number buttons (excluding prev/next)
    const existingPageButtons = paginationContainer.querySelectorAll(".page-btn");
    existingPageButtons.forEach(btn => btn.remove());

    // Add page number buttons
    const maxPageButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtonsToShow / 2));
    let endPage = Math.min(pageCount, startPage + maxPageButtonsToShow - 1);

    // Adjust startPage if endPage hits the limit early
    startPage = Math.max(1, endPage - maxPageButtonsToShow + 1);

    // Add 'First' button if needed
    if (startPage > 1) {
        createPageButton(1);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.insertBefore(ellipsis, nextBtn);
        }
    }

    // Add page number buttons in the calculated range
    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i);
    }

    // Add 'Last' button if needed
    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            paginationContainer.insertBefore(ellipsis, nextBtn);
        }
        createPageButton(pageCount);
    }

    updateTableDisplay();
    updatePaginationButtons();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadShops('rejected', 'rejectedShopsTableBody');
    setupSearchListeners(); // Add this line to initialize search listeners
});
//  ------------------------- CODE NI MACMAC ------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
            // Menu toggle functionality
            const menuBtn = document.querySelector(".menu-btn");
            const navLinks = document.querySelector(".nav-links");
            
            menuBtn?.addEventListener("click", function() {
                navLinks.classList.toggle("active");
                menuBtn.innerHTML = navLinks.classList.contains("active") ? 
                    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });

            // Clear button functionality
            const clearBtn = document.getElementById("clearSearch");
            const searchInput = document.getElementById("shopSearch");
            
            clearBtn?.addEventListener("click", function(e) {
                e.preventDefault();
                searchInput.value = "";
                searchInput.focus();
                showNotification("Search cleared", "success");
            });

            // Pagination variables and functions
            let currentPage = 1;
            // const rowsPerPage = 10;
            // const tableBody = document.querySelector("#rejected-shops tbody");
            // const prevBtn = document.getElementById("prevBtn");
            // const nextBtn = document.getElementById("nextBtn");
            // const paginationContainer = document.querySelector(".pagination");

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

            // function createPageButton(pageNumber) {
            //     const pageBtn = document.createElement("button");
            //     pageBtn.className = "pagination-btn page-btn";
            //     pageBtn.textContent = pageNumber;

            //     if (pageNumber === currentPage) {
            //         pageBtn.classList.add("active");
            //     }

            //     pageBtn.addEventListener("click", () => {
            //         currentPage = pageNumber;
            //         setupPagination();
            //     });

            //     paginationContainer.insertBefore(pageBtn, nextBtn);
            // }

            function addEllipsis() {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationContainer.insertBefore(ellipsis, nextBtn);
            }

            // function updateTableDisplay() {
            //     if (!tableBody) return;
                
            //     const rows = tableBody.querySelectorAll("tr");
            //     if (rows.length === 0) return;
                
            //     const startIndex = (currentPage - 1) * rowsPerPage;
            //     const endIndex = startIndex + rowsPerPage;

            //     rows.forEach((row, index) => {
            //         row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
            //     });
            // }

            // function updatePaginationButtons() {
            //     if (!tableBody) return;
                
            //     const rows = tableBody.querySelectorAll("tr");
            //     const pageCount = Math.ceil(rows.length / rowsPerPage);

            //     prevBtn.disabled = currentPage === 1;
            //     nextBtn.disabled = currentPage >= pageCount || pageCount === 0;

            //     const pageButtons = paginationContainer.querySelectorAll(".page-btn");
            //     pageButtons.forEach(btn => {
            //         btn.classList.remove("active");
            //         if (parseInt(btn.textContent) === currentPage) {
            //             btn.classList.add("active");
            //         }
            //     });
            // }

            prevBtn?.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    setupPagination();
                }
            });

            nextBtn?.addEventListener("click", () => {
                if (!tableBody) return;
                
                const rows = tableBody.querySelectorAll("tr");
                const pageCount = Math.ceil(rows.length / rowsPerPage);

                if (currentPage < pageCount) {
                    currentPage++;
                    setupPagination();
                }
            });

            // Action confirmation dialog
            let currentAction = null;
            let currentRow = null;

            function confirmAction(button, actionType) {
                currentRow = button.closest("tr");
                if (!currentRow) return;
                
                currentAction = actionType;

                const shopName = currentRow.cells[1]?.textContent || '[Unknown Shop]';
                const dialog = document.getElementById("confirmationDialog");
                const dialogMessage = document.getElementById("dialogMessage");
                const overlay = document.getElementById("overlay");

                if (!dialog || !dialogMessage || !overlay) return;

                dialogMessage.textContent = `Are you sure you want to ${actionType} "${shopName}"?`;
                
                dialog.classList.add("show");
                overlay.classList.add("show");
            }

            // Event delegation for action buttons
            tableBody?.addEventListener('click', function(event) {
                const target = event.target.closest('button');
                if (!target) return;
                
                if (target.classList.contains('approve-btn') && target.id !== 'confirmAction') {
                    confirmAction(target, 'approve');
                }
            });

            // Confirmation dialog buttons
            document.getElementById("confirmAction")?.addEventListener("click", function() {
                const dialog = document.getElementById("confirmationDialog");
                const overlay = document.getElementById("overlay");

                dialog?.classList.remove("show");
                overlay?.classList.remove("show");

                if (currentAction === "approve" && currentRow) {
                    approveShop(currentRow);
                }

                currentAction = null;
                currentRow = null;
            });

            document.getElementById("cancelAction")?.addEventListener("click", function() {
                const dialog = document.getElementById("confirmationDialog");
                const overlay = document.getElementById("overlay");

                dialog?.classList.remove("show");
                overlay?.classList.remove("show");

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
                    showNotification(`"${shopName}" has been approved`, "success");
                    
                    // Recalculate pagination
                    if (tableBody && tableBody.querySelectorAll("tr").length === 0 && currentPage > 1) {
                        currentPage--;
                    }
                    setupPagination();
                }, 300);
            }

            // Notification function
            function showNotification(message, type) {
                const notification = document.getElementById("notification");
                if (!notification) return;
                
                notification.textContent = message;
                notification.className = 'notification';
                notification.classList.add(type, 'show');

                setTimeout(() => {
                    notification.classList.remove("show");
                }, 3000);
            }

            // Initialize pagination
            setupPagination();

            // Logout functionality
            const logoutLink = document.querySelector('a[href="admin_login.html"]');
            const logoutDialog = document.getElementById('logoutDialog');
            const cancelLogout = document.getElementById('cancelLogout');
            const confirmLogout = document.getElementById('confirmLogout');

            logoutLink?.addEventListener('click', function(e) {
                e.preventDefault();
                logoutDialog.classList.add('show');
                document.getElementById('overlay').classList.add('show');
            });

            cancelLogout?.addEventListener('click', function() {
                logoutDialog.classList.remove('show');
                document.getElementById('overlay').classList.remove('show');
            });

            confirmLogout?.addEventListener('click', function() {
                window.location.href = 'admin_login.html';
            });

            // Close dialogs when clicking overlay
            document.getElementById('overlay')?.addEventListener('click', function() {
                document.getElementById('confirmationDialog').classList.remove('show');
                logoutDialog.classList.remove('show');
                this.classList.remove('show');
            });
        });
