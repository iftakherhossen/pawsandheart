// const database = "http://127.0.0.1:8000"
const database = "https://pawsandheart-db.onrender.com"

const userId = localStorage.getItem("user_id");
const profileData = document.getElementById("profiledata");
const noData = document.getElementById("nodata");

if (userId) {
    profileData.style.display = "block"; 
    noData.style.display = "none";
} else {
    profileData.style.display = "none";  
    noData.style.display = "block"; 
}

const loadUser = () => {
    fetch(`${database}/user/list/${userId}`)
        .then((res) => res.json())
        .then((data) => {
            showProfileDetails(data);
        });
};

const loadAdoptionHistory = () => {
    fetch(`${database}/transactions/list/?transaction_type=purchase`)
        .then((res) => res.json())
        .then((data) => {
            showAdoptionHistory(data.results);
        });
}

const showProfileDetails = (data) => {
    const parent = document.getElementById("user-details");
    const div = document.createElement("div");
    div.classList.add("flex", "flex-col", "md:flex-row", "justify-start", "md:justify-between", "md:items-center", "gap-4");

    div.innerHTML = `
        <div class="flex items-center gap-4">
            <div>
                <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="${data.user.username}" class="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-pink-600 object-fit" />
            </div>
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold tracking-wide">${data.user.first_name} ${data.user.last_name}</h2>
                <h6 class="sm:text-lg text-pink-600 font-medium">@${data.user.username}</h6>
            </div>
        </div>
        <div>
            <div class="text-lg sm:text-[20.5px] font-bold bg-white rounded-xl px-6 py-2.5 text-center md:text-left tracking-wide text-pink-600">Balance: $ ${data.balance}</div>
        </div>
    `;

    parent.appendChild(div);
}  

const getDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

const showAdoptionHistory = (data) => {
    const noHistory = document.getElementById("no-history");

    if (data) {
        noHistory.style.display = "none";
        const parent = document.getElementById("history-table-body");        
        const count = document.getElementById("adoption-count");
        parent.innerHTML = "";           
        
        let adoptionCount = 0

        data.forEach(item => {
            if (item.account === parseInt(userId)) {
                adoptionCount++;

                const tr = document.createElement("tr");
                tr.classList.add("bg-white", "border-b", "border-pink-200", "font-medium", "text-pink-900");
        
                tr.innerHTML = `
                    <th scope="row" class="px-6 py-4 whitespace-nowrap">${getDate(item.timestamp)}</th>
                    <td class="px-6 py-3">${item.pet.name}</td>
                    <td class="px-6 py-3">${item.pet.species}</td>
                    <td class="px-6 py-3">$ ${item.pet.price}</td>
                    <td class="px-6 py-3">$ ${item.balance_after_transaction}</td>
                `;
                
                parent.appendChild(tr);
            }
        }); 
        count.textContent = `(${adoptionCount})`;
    } else {
        noHistory.style.display = "block";
        const table = document.getElementById("history-table");
        table.style.display = "none";        
    }
}

const showUserMenuOrLogin = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const getStarted = document.getElementById("get-started-btn");
    const userMenu = document.getElementById("user-profile-btn");

    if (token && userId) {
        getStarted.classList.add("hidden");
    } else {
        userMenu.classList.add("hidden")
    }
}

const togglePasswordVisibility = () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordField1 = document.getElementById('current_password');
    const passwordField2 = document.getElementById('new_password');
    const passwordField3 = document.getElementById('confirm_new_password');

    const type1 = passwordField1.getAttribute("type") === "password" ? "text" : "password";
    const type2 = passwordField2.getAttribute("type") === "password" ? "text" : "password";
    const type3 = passwordField3.getAttribute("type") === "password" ? "text" : "password";

    passwordField1.setAttribute("type", type1);    
    passwordField2.setAttribute("type", type2);
    passwordField3.setAttribute("type", type3);

    togglePassword.textContent = type1 === "password" && type2 === "password" && type3 === "password" ? "Show Password" : "Hide Password";
}

const handleUpdatePassword = (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('user_id');
    const form = document.getElementById('update-password-form');
    const formData = new FormData(form);
    const modal = document.getElementById("static-modal");
    const alertElement = document.getElementById("alert");
    
    // formData.append('user_id', userId);
    document.getElementById("userID").value = userId;

    const currentPassword = formData.get("current_password");
    const newPassword = formData.get("new_password");
    const confirmNewPassword = formData.get("confirm_new_password");

    if (currentPassword === newPassword) {
        alertElement.innerText = "Your new password cannot be the same as your current password.";
    } else if (newPassword !== confirmNewPassword) {
        alertElement.innerText = "New password and confirm password do not match.";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPassword)) {
        alertElement.innerText = "Password must contain eight characters, at least one letter, one number and one special character.";
    } else {
        fetch(`${database}/user/update-password/`, {
            method: "POST",
            body: formData,
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                modal.setAttribute('data-modal-hide', 'true');
                alertElement.classList.remove("hidden", "bg-red-100", "text-red-700");
                alertElement.classList.add("bg-green-100", "text-green-700");
                alertElement.innerText = "Password updated successfully!";
            } else {
                alertElement.innerText = "Error updating password: " + data.error;
            }
        })
        .catch((error) => {
            console.error('Error updating password:', error);
            alertElement.innerText = "Error updating password. Please try again later.";
        });
    }
};

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

loadUser();  
loadAdoptionHistory();
showUserMenuOrLogin();