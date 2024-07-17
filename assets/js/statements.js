// const database = "http://127.0.0.1:8000"
const database = "https://pawsandheart-db.onrender.com"
let currentPage = 1;
let count;

const loadStatements = () => {
    const userId = localStorage.getItem("user_id");
    
    fetch(`${database}/transactions/list/?account=${userId}&page=${currentPage}`)
        .then((res) => res.json())
        .then((data) => {
            showTransactions(data.results);
            controlPagination();
            count = data.count;
        });
}

const getDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} - ${day}-${month}-${year}`;
}

const showTransactions = (data) => {
    const parent = document.getElementById("table-body");
    parent.innerHTML = "";

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.classList.add("bg-white", "border-b", "border-pink-200", "font-medium", "text-pink-900");

        tr.innerHTML = `
            <th scope="row" class="px-6 py-4 whitespace-nowrap">${getDateTime(item.timestamp)}</th>
            <td class="px-6 py-3">${item.transaction_type}</td>
            <td class="px-6 py-3">$ ${item.amount}</td>
            <td class="px-6 py-3">$ ${item.balance_after_transaction}</td>
        `;
        
        parent.appendChild(tr);
    });    
}

const pagination = document.getElementById("pagination-wrapper");

if(count > 10) {
    pagination.classList.remove("hidden")
    pagination.classList.add("block")
}

const controlPagination = () => {   
    const pageNo = document.getElementById("pageNo");    
    pageNo.textContent = `Page ${currentPage}`;
} 

const goPrev = () => {
    if (currentPage > 1) {
        currentPage--;
        loadPets();
    }
}

const goNext = () => {
    let totalPage = Math.ceil(count / 10);

    if (currentPage < totalPage) {
        currentPage++;
        loadPets();
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


loadStatements();
showUserMenuOrLogin();