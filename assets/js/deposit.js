// const database = "http://127.0.0.1:8000"
const database = "https://pawsandheart-db.onrender.com"

const handleDepositMoney = (event) => {
    event.preventDefault();
    const amount = document.getElementById("amount").value;
    const userId = localStorage.getItem("user_id");
    const alert = document.getElementById("alert");

    if (!amount || isNaN(amount) || amount <= 99) {
        alert.classList.remove("hidden");
        alert.classList.add("block", "bg-red-100", "text-red-700");
        alert.innerHTML = `<p>Please enter a valid amount!</p>`;
        document.getElementById("amount").value = '';
        return;
    } else {
        fetch(`${database}/transactions/deposit/`, {
            method: "POST",
            headers: { 
                "content-type": "application/json"
            },
            body: JSON.stringify({
                pet: null,
                amount: parseFloat(amount),             
                transaction_type: 'Deposit',
                account: parseInt(userId),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                alert.classList.remove("hidden");
                alert.classList.add("block", "bg-green-100", "text-green-700");
                alert.innerHTML = `
                    <p>$ ${amount} has been deposited successfully!</p>
                `;
                document.getElementById("amount").value = '';
            })
            .catch((error) => {               
                alert.classList.remove("hidden");
                alert.classList.add("block", "bg-red-100", "text-red-700");
                alert.innerHTML = `
                    <p>An error occurred. Please try again later.</p>
                `;
                document.getElementById("amount").value = '';
            });
    }   
};


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

showUserMenuOrLogin();