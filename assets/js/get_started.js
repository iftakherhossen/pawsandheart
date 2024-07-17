// const database = "http://127.0.0.1:8000"
const database = "https://pawsandheart-db.onrender.com"

function switchTab(selectedTabId, tabToShow) {
    document.getElementById('signup').classList.add('hidden');
    document.getElementById('login').classList.add('hidden');
    
    document.getElementById('signup-tab').classList.remove('bg-pink-600', 'text-white');
    document.getElementById('signup-tab').classList.add('bg-white', 'text-pink-600');
    document.getElementById('login-tab').classList.remove('bg-pink-600', 'text-white');
    document.getElementById('login-tab').classList.add('bg-white', 'text-pink-600');    

    document.getElementById(tabToShow).classList.remove('hidden');

    document.getElementById(selectedTabId).classList.remove('bg-white', 'text-pink-600');
    document.getElementById(selectedTabId).classList.add('bg-pink-600', 'text-white');
}

switchTab('signup-tab', 'signup');

const togglePasswordVisibility1 = () => {
    const togglePassword = document.getElementById('togglePassword1');
    const passwordField1 = document.getElementById('password');
    const passwordField2 = document.getElementById('confirm_password');

    const type1 = passwordField1.getAttribute("type") === "password" ? "text" : "password";
    const type2 = passwordField2.getAttribute("type") === "password" ? "text" : "password";

    passwordField1.setAttribute("type", type1);    
    passwordField2.setAttribute("type", type2);

    togglePassword.textContent = type1 === "password" && type2 === "password" ? "Show Password" : "Hide Password";
}

const togglePasswordVisibility2 = () => {
    const togglePassword = document.getElementById('togglePassword2');
    const passwordField = document.getElementById('login_password');

    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);

    togglePassword.textContent = type === "password" ? "Show Password" : "Hide Password";
}

const handleSignup = (event) => {
    event.preventDefault();
    const form = document.getElementById('signup-form');
    const formData = new FormData(form);
    const error = document.getElementById("error-text");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm_password");

    if (password === confirmPassword) {        
        error.innerText = ""
        if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
            fetch(`${database}/user/register/`, {
                method: "POST",
                body: formData,
            })
                .then((res) => res.json())
                .then((data) => console.log(data));
        } else {
            error.innerText = "password must contain eight characters, at least one letter, one number and one special character:";
        }
    } else {
        error.innerText = "Password and confirm password does not match";     
    }
}; 

const handleLogin = (event) => {
    event.preventDefault();
    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;
    const success = document.getElementById("success-alert"); 
    const failed = document.getElementById("failed-alert");

    if (username && password) {
        fetch(`${database}/user/login/`, {
            method: "POST",
            headers: {
                "content-type": "application/json" 
            },
            body: JSON.stringify({
                "username": username, 
                "password": password
            }),
        })
            .then((res) => res.json())
            .then((data) => { 
                console.log(data);
                if (data.token && data.user_id) {                                 
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user_id", data.user_id);
                    success.innerHTML = `
                        <p>Logged in successfully!</p>
                    `
                    window.location.href = "index.html";
                }
            })
            .catch((error) => {              
                console.error("Error:", error);               
                failed.innerHTML = `
                    <p>${error}</p>
                `
            });
    }
}

const handleLogOut = () => {  
    const token = localStorage.getItem("token");

    fetch(`${database}/user/logout/`, {
        method: "GET",
        headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((data) => {            
            console.log(data);
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            if (data.success) {
                window.location.href = "index.html"
            }
        })
        .catch((error) => console.log(error));
};

const showUserMenuOrLogin = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const getStarted = document.getElementById("get-started-btn");
    const userMenu = document.getElementById("user-profile-btn");

    if (token && userId) {
        getStarted.classList.add("hidden");
        userMenu.classList.add("block")
    } else {
        userMenu.classList.add("hidden")
        getStarted.classList.add("block")
    }
}

showUserMenuOrLogin();