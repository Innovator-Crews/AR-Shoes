function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const toggleIcon = passwordField.nextElementSibling;

    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.innerHTML = "&#128065;"; // Eye icon open need change
    } else {
        passwordField.type = "password";
        toggleIcon.innerHTML = "&#128068;"; // Eye icon closed need change
    }
}

// validate passwords to pre
function validatePasswords() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("errorMessage");

    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        errorMessage.innerText = "Passwords do not match.";
        return false;
    }
    errorMessage.style.display = "none";
    return true;
}
