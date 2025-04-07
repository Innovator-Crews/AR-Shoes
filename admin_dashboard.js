import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, remove, get, update, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Initialize Firebase with your config
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

function approveShop(e) {
    const shopId = e.currentTarget.getAttribute('data-id');
    const shopRef = ref(db, `AR_shoe_users/shop/${shopId}`);

    update(shopRef, {
        status: "approved",
        // dateApproved: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    }).then(() => {
        showNotification("Shop approved successfully!", "success");

        // Remove the row from the table
        e.target.closest('tr').remove();

        // If no more pending shops, show message
        if (document.querySelectorAll('tbody tr').length === 0) {
            document.querySelector('tbody').innerHTML =
                '<tr><td colspan="7">No pending shops remaining</td></tr>';
        }
    }).catch((error) => {
        console.error("Error approving shop:", error);
        showNotification("Failed to approve shop: " + error.message, "error");
    });
}

function rejectShop(e) {
    const shopId = e.currentTarget.getAttribute('data-id');
    const shopRef = ref(db, `AR_shoe_users/shop/${shopId}`);

    update(shopRef, {
        status: "rejected",
        // dateApproved: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    }).then(() => {
        showNotification("Shop rejected successfully!", "success");

        // Remove the row from the table
        e.target.closest('tr').remove();

        // If no more pending shops, show message
        if (document.querySelectorAll('tbody tr').length === 0) {
            document.querySelector('tbody').innerHTML =
                '<tr><td colspan="7">No pending shops remaining</td></tr>';
        }
    }).catch((error) => {
        console.error("Error approving shop:", error);
        showNotification("Failed to approve shop: " + error.message, "error");
    });
}

// Function to show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Replace all get() calls with onValue() observers

function loadShops_forPending() {
    const shopsRef = ref(db, 'AR_shoe_users/shop');
    onValue(shopsRef, (snapshot) => {  // Changed from get() to onValue()
        const tbody = document.getElementById('pendingShopsTableBody');
        tbody.innerHTML = '';

        if (snapshot.exists()) {
            let hasPendingShops = false;

            snapshot.forEach((childSnapshot) => {
                const shop = childSnapshot.val();
                const shopId = childSnapshot.key;

                if (shop.status === "pending") {
                    hasPendingShops = true;

                    const row = document.createElement('tr');
                    row.className = 'animate-fade';
                    row.setAttribute('data-id', shopId);

                    row.innerHTML = `
                        <td><abbr style="text-decoration:none;" title="${shopId}">${shopId.substring(0, 6)}...</abbr></td>
                        <td>${shop.shopName || 'N/A'}</td>
                        <td>${shop.ownerName || 'N/A'}</td>
                        <td>${shop.email || 'N/A'}</td>
                        <td><a href="uploads/permit41.pdf" target="_blank" class="view-link"><i class="fas fa-eye"></i> View Here</a></td>
                        <td>${shop.dateApproved || 'Pending'}</td>
                        <td>
                            <button class="approve-btn" data-id="${shopId}">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="reject-btn" data-id="${shopId}">
                                <i class="fas fa-ban"></i> Reject
                            </button>
                        </td>
                    `;

                    tbody.appendChild(row);
                }
            });

            if (!hasPendingShops) {
                tbody.innerHTML = '<tr><td colspan="7">No pending shops found</td></tr>';
            }

            // Add event listeners
            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', approveShop);
            });
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', rejectShop);
            });

        } else {
            tbody.innerHTML = '<tr><td colspan="7">No shops found</td></tr>';
        }
    }, (error) => {
        console.error("Error loading shops:", error);
        showNotification("Error loading shops: " + error.message, "error");
    });
}

function loadShops_forApproved() {
    const shopsRef = ref(db, 'AR_shoe_users/shop');
    onValue(shopsRef, (snapshot) => {  // Changed from get() to onValue()
        const tbody = document.getElementById('approvedShopsTableBody');
        tbody.innerHTML = '';

        if (snapshot.exists()) {
            let hasApprovedShops = false;

            snapshot.forEach((childSnapshot) => {
                const shop = childSnapshot.val();
                const shopId = childSnapshot.key;

                if (shop.status === "approved") {
                    hasApprovedShops = true;

                    const row = document.createElement('tr');
                    row.className = 'animate-fade';
                    row.setAttribute('data-id', shopId);

                    row.innerHTML = `
                        <td><abbr style="text-decoration:none;" title="${shopId}">${shopId.substring(0, 6)}...</abbr></td>
                        <td>${shop.shopName || 'N/A'}</td>
                        <td>${shop.ownerName || 'N/A'}</td>
                        <td>${shop.email || 'N/A'}</td>
                        <td><a href="uploads/permit41.pdf" target="_blank" class="view-link"><i class="fas fa-eye"></i> View Here</a></td>
                        <td>${shop.dateApproved || 'Approved'}</td>
                        <td>
                            <button class="reject-btn" data-id="${shopId}">
                                <i class="fas fa-ban"></i> Reject
                            </button>
                        </td>
                    `;

                    tbody.appendChild(row);
                }
            });

            if (!hasApprovedShops) {
                tbody.innerHTML = '<tr><td colspan="7">No approved shops found</td></tr>';
            }

            // Add event listeners
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', rejectShop);
            });

        } else {
            tbody.innerHTML = '<tr><td colspan="7">No shops found</td></tr>';
        }
    }, (error) => {
        console.error("Error loading shops:", error);
        showNotification("Error loading shops: " + error.message, "error");
    });
}

function loadShops_forRejected() {
    const shopsRef = ref(db, 'AR_shoe_users/shop');
    onValue(shopsRef, (snapshot) => {  // Changed from get() to onValue()
        const tbody = document.getElementById('rejectedShopsTableBody');
        tbody.innerHTML = '';

        if (snapshot.exists()) {
            let hasRejectedShops = false;

            snapshot.forEach((childSnapshot) => {
                const shop = childSnapshot.val();
                const shopId = childSnapshot.key;

                if (shop.status === "rejected" && shopId !== "null") {
                    hasRejectedShops = true;
                    console.log(shopId);
                    const row = document.createElement('tr');
                    row.className = 'animate-fade';
                    row.setAttribute('data-id', shopId);

                    row.innerHTML = `
                        <td><abbr style="text-decoration:none;" title="${shopId}">${shopId.substring(0, 6)}...</abbr></td>
                        <td>${shop.shopName || 'N/A'}</td>
                        <td>${shop.ownerName || 'N/A'}</td>
                        <td>${shop.email || 'N/A'}</td>
                        <td><a href="uploads/permit41.pdf" target="_blank" class="view-link"><i class="fas fa-eye"></i> View Here</a></td>
                        <td>${shop.dateRejected || 'Rejected'}</td>
                        <td>
                            ${shop.rejectionReason || 'No reason provided'}
                        </td>
                        <td>
                            <button class="approve-btn" data-id="${shopId}">
                                <i class="fas fa-check"></i> Approve
                            </button>
                        </td>
                    `;

                    tbody.appendChild(row);
                } else {
                    const db = getDatabase();
                    const reference = ref(db, 'AR_shoe_users/shop' + shopId); 
                    remove(reference)
                        .then(() => {
                            console.log('Data removed successfully');
                        })
                        .catch((error) => {
                            console.error('Error removing data:', error);
                        });
                }
            });

            if (!hasRejectedShops) {
                tbody.innerHTML = '<tr><td colspan="8">No rejected shops found</td></tr>';
            }

            // Add event listeners
            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', approveShop);
            });

        } else {
            tbody.innerHTML = '<tr><td colspan="8">No shops found</td></tr>';
        }
    }, (error) => {
        console.error("Error loading shops:", error);
        showNotification("Error loading shops: " + error.message, "error");
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadShops_forPending();
    loadShops_forApproved();
    loadShops_forRejected();
});