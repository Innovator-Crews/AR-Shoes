<!DOCTYPE html>
<html>
<head>
    <title>Login Page</title>
    <link rel="stylesheet" type="text/css" href="login_user.css">
</head>
<body>
    <div class="container">
        <h1>Login</h1>
        <form id="loginForm" action="login.php" method="post">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required><br>
            
            <label for="password">Password:</label>
            <div class="password-container">
                <input type="password" id="password" name="password" required>
                <span class="toggle-password" onclick="togglePassword('password')">&#128068;</span>
            </div><br>
            
            <button type="submit">Login</button>
        </form>
        
        <!-- Additional Label for Registration -->
        <p class="login-prompt">
            Don't have an account? 
            <a href="registration_user.php">Register here</a>.
        </p>
    </div>
    <script src="script.js"></script>
</body>
</html>
