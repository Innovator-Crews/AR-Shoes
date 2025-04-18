// Initialize EmailJS with your User ID
emailjs.init('gBZ5mCvVmgjo7wn0W');

document.querySelectorAll('.reject-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const parentRow = e.target.closest('tr'); // Get the parent row
        console.log('asdasd');
        if (parentRow) {
            const emailCell = parentRow.querySelector('td:nth-child(4)'); // 4th column
            if (emailCell) {
                const email = emailCell.textContent.trim();
                console.log('Email:', email);
            } else {
                console.error('Email cell not found');
            }
        } else {
            console.error('Parent row not found');
        }
    });
});


document.getElementById('confirmAction').addEventListener('click', function (e) {
    // const recipientEmail = document.getElementById('recipientEmail').value;
    
    // if (!recipientEmail) {
    //     alert('Please enter a recipient email');
    //     return;
    // }

    // const templateParams = {
    //     email: recipientEmail,  // This will populate {{email}} in your template
    //     from_name: 'Your App Name',
    //     message: 'Macmac Palo.',
    //     reply_to: 'your-default-reply@example.com'
    // };

    // emailjs.send('service_8i28mes', 'template_btslatu', templateParams)
    //     .then(function(response) {
    //         console.log('Email sent!', response.status, response.text);
    //         alert('Email sent successfully to ' + recipientEmail);
    //     }, function(error) {
    //         console.error('Failed to send', error);
    //         alert('Failed to send email: ' + error.text);
    //     });
});