import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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

async function approveShop(e) {
    const shopId = e.target.getAttribute('data-id');
    const shopRef = ref(db, `AR_shoe_users/shop/${shopId}`);
    
    try {
        // Update the status and approval date
        await update(shopRef, {
            status: "approved",
            // dateApproved: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        });
        
        showNotification("Shop approved successfully!", "success");
        
        // Remove the row from the table
        e.target.closest('tr').remove();
        
        // If no more pending shops, show message
        if (document.querySelectorAll('tbody tr').length === 0) {
            document.querySelector('tbody').innerHTML = 
                '<tr><td colspan="7">No pending shops remaining</td></tr>';
        }
        
    } catch (error) {
        console.error("Error approving shop:", error);
        showNotification("Failed to approve shop: " + error.message, "error");
    }
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

//  loadShops_forPending function to include status check
async function loadShops_forPending() {
    try {
        const shopsRef = ref(db, 'AR_shoe_users/shop');
        const snapshot = await get(shopsRef);
        
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
                        <!--<td>
                            ${shop.businessPermitUrl ? 
                                `<a href="${shop.businessPermitUrl}" target="_blank" class="view-link">
                                    <i class="fas fa-eye"></i> View Here
                                </a>` : 
                                'N/A'}
                        </td>-->
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
    } catch (error) {
        console.error("Error loading shops:", error);
        showNotification("Error loading shops: " + error.message, "error");
    }
}


async function loadShops_forApproved() {
    try {
        const shopsRef = ref(db, 'AR_shoe_users/shop');
        const snapshot = await get(shopsRef);
        
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
                        <!--<td>
                            ${shop.businessPermitUrl ? 
                                `<a href="${shop.businessPermitUrl}" target="_blank" class="view-link">
                                    <i class="fas fa-eye"></i> View Here
                                </a>` : 
                                'N/A'}
                        </td>-->
                        <td><a href="uploads/permit41.pdf" target="_blank" class="view-link"><i class="fas fa-eye"></i> View Here</a></td>
                        <td>${shop.dateApproved || 'Approved'}</td>
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
            
            if (!hasApprovedShops) {
                tbody.innerHTML = '<tr><td colspan="7">No approved shops found</td></tr>';
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
    } catch (error) {
        console.error("Error loading shops:", error);
        showNotification("Error loading shops: " + error.message, "error");
    }
}


async function loadShops_forRejected() {
    try {
        const shopsRef = ref(db, 'AR_shoe_users/shop');
        const snapshot = await get(shopsRef);
        
        const tbody = document.getElementById('rejectedShopsTableBody');
        tbody.innerHTML = '';
        
        if (snapshot.exists()) {
            let hasRejectedShops = false;
            
            snapshot.forEach((childSnapshot) => {
                const shop = childSnapshot.val();
                const shopId = childSnapshot.key;
                
                if (shop.status === "rejected") {
                    hasRejectedShops = true;
                    
                    const row = document.createElement('tr');
                    row.className = 'animate-fade';
                    row.setAttribute('data-id', shopId);
                    
                    row.innerHTML = `
                        <td><abbr style="text-decoration:none;" title="${shopId}">${shopId.substring(0, 6)}...</abbr></td>
                        <td>${shop.shopName || 'N/A'}</td>
                        <td>${shop.ownerName || 'N/A'}</td>
                        <td>${shop.email || 'N/A'}</td>
                        <!--<td>
                            ${shop.businessPermitUrl ? 
                                `<a href="${shop.businessPermitUrl}" target="_blank" class="view-link">
                                    <i class="fas fa-eye"></i> View Here
                                </a>` : 
                                'N/A'}
                        </td>-->
                        <td><a href="uploads/permit41.pdf" target="_blank" class="view-link"><i class="fas fa-eye"></i> View Here</a></td>
                        <td>${shop.dateRejected || 'Rejected'}</td>
                        <td>
                            ${shop.rejectionReason || 'No reason provided'}
                        </td>
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
            
            if (!hasRejectedShops) {
                tbody.innerHTML = '<tr><td colspan="7">No rejected shops found</td></tr>';
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
    } catch (error) {
        console.error("Error loading shops:", error);
        showNotification("Error loading shops: " + error.message, "error");
    }
}


// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadShops_forPending);
document.addEventListener('DOMContentLoaded', loadShops_forApproved);
document.addEventListener('DOMContentLoaded', loadShops_forRejected);