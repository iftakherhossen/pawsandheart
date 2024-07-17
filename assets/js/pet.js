const database = "http://127.0.0.1:8000"
// const database = "https://pawsandheart-db.onrender.com"

const param = new URLSearchParams(window.location.search).get("petId")

const getParams = () => {
    document.getElementById("spinner").style.display = "block";   

    fetch(`${database}/pets/list/${param}`)
        .then((res) => res.json())
        .then((data) => {
            if(data) {
                document.getElementById("spinner").style.display = "none";
                document.getElementById("nodata").style.display = "none";
                displaySinglePet(data)
            }
            else {
                document.getElementById("nodata").style.display = "block";
            }
        })
        .catch((error) => console.error('Error fetching single pet:', error));

    fetch(`${database}/pets/reviews/?pet=${param}`)
        .then((res) => res.json())
        .then((data) => {
            document.getElementById("spinner").style.display = "none";
            petReview(data);
        })
        .catch((error) => console.error('Error fetching single pet reviews:', error));
}

const getDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

const handlePurchase = (pet) => {
    const userId = localStorage.getItem("user_id");
    const alert = document.getElementById("alert");

    fetch(`${database}/user/list/${userId}/`, {
        method: "GET",
        headers: {
            "content-type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((userData) => {
        const userBalance = userData.balance;

        if (userBalance < pet.price) {
            alert.classList.remove("hidden");
            alert.classList.add("block", "bg-red-100", "text-red-700");
            alert.innerHTML = `
                <p>Insufficient balance. Deposit some money first!</p>
            `;
        } else {
            fetch(`${database}/transactions/purchase/`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    pet: parseInt(pet.id),
                    amount: parseFloat(pet.price),             
                    transaction_type: 'Purchase',
                    account: parseInt(userId),
                }),
            })
            .then((res) => res.json())
            .then((data) => {
                if(data.message) {
                    alert.classList.remove("hidden");
                    alert.classList.add("block", "bg-green-100", "text-green-700");
                    alert.innerHTML = `
                        <p>Congratulations! This pet is yours now, we will deliver it soon.</p>
                    `;
                }
                console.log(data);
            })
            .catch((error) => {               
                alert.classList.remove("hidden");
                alert.classList.add("block", "bg-red-100", "text-red-700");
                alert.innerHTML = `
                    <p>An error occurred. Please try again later. ${error}</p>
                `;
            });
        }
    })
    .catch((error) => {
        console.error("Error fetching user balance:", error);
        alert.classList.remove("hidden");
        alert.classList.add("block", "bg-red-100", "text-red-700");
        alert.innerHTML = `<p>An error occurred while fetching user balance.</p>`;
    });
};

const displaySinglePet = (pet) => {
    const userId = localStorage.getItem("user_id");
    const parent = document.getElementById("pet-wrapper");    
    const div = document.createElement("div");
    div.classList.add("flex", "gap-6", "mt-6");
    petAdoptedAlert(pet.adopted, pet.name);
    
    div.innerHTML = `
        <div>
            <img src="${pet.image}" alt="${pet.name}" class="rounded-lg h-auto w-full" />
        </div>
        <div class="w-full">
            <div>
                <h2 class="flex items-center justify-between w-full p-5 font-semibold text-xl bg-[#1F2937] text-white border border-b-0 border-gray-200 gap-3 rounded-t-lg">Pet Details</h2>
                <div class="p-5 border border-gray-200 text-lg font-normal flex flex-col gap-3 rounded-b-lg">
                    <p><span class="font-bold">Name:</span> ${pet.name}</p>
                    <p><span class="font-bold">Species:</span> ${pet.species}</p>
                    <p><span class="font-bold capitalize">Age:</span> ${pet.age}</p>
                    <p><span class="font-bold">Gender:</span> ${pet.gender}</p>
                    <p><span class="font-bold">Health:</span> ${pet.health}</p>
                    <p><span class="font-bold">Description:</span> ${pet.description}</p>
                    <p><span class="font-bold">Enlisted on:</span> ${getDate(pet?.created_on)}</p>
                </div>
            </div>
            <div class="flex justify-between items-center gap-3 mt-5">
                <div class="text-xl font-bold bg-[#1F2937] text-white w-44 py-3 flex justify-center rounded-lg">Price: ${pet?.price===0 ? 'Free' : `$ ${pet?.price}`}</div>
                ${userId ? pet.adopted ? '<div class="text-xl font-bold bg-pink-100 text-pink-600 w-44 py-3 flex justify-center rounded-lg">Adopted</div>' : '<button type="button" id="adopt-btn" class="text-xl font-bold bg-[#1F2937] text-white hover:bg-pink-100 hover:text-pink-600 cursor-pointer w-44 py-3 flex justify-center rounded-lg">Adopt</button>': ''}
            </div>
        </div>
    `;

    parent.appendChild(div);
    const adoptBtn = document.getElementById("adopt-btn");
    adoptBtn.onclick = () => {
        handlePurchase(pet);
    };
};

const petAdoptedAlert = (adopted, name) => {
    const parent = document.getElementById("pet-alert-wrapper");
    const div = document.createElement("div");

    if (adopted===true) {
        div.innerHTML = `
            <div class="p-4 mb-4 text-red-800 rounded-lg bg-red-200 text-lg font-medium text-center" role="alert">
                <b>${name}</b> is already Adopted!
            </div>
        `
    }
    else {
        div.innerHTML = `
            <div class="p-4 mb-4 text-green-800 rounded-lg bg-green-200 text-lg font-medium text-center" role="alert">
                <b>${name}</b> is available for adoption!
            </div>
        `
    }

    parent.appendChild(div);
}

const handlePostReview = (event, petId) => {
    event.preventDefault();
    const userId = localStorage.getItem("user_id");
    const alert = document.getElementById("alert");
    let review = document.getElementById("review").value;
    let rating = document.getElementById("rating").value;
    
    fetch(`${database}/pets/reviews/`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({            
            reviewer: parseInt(userId),
            pet: parseInt(petId),        
            review: review,
            rating: rating,
        }),
    })
    .then((res) => res.json())
    .then((data) => {
        if(data.message) {
            review = '';
            rating = '';
            alert.classList.remove("hidden");
            alert.classList.add("block", "bg-green-100", "text-green-700");
            alert.innerHTML = `
                <p>Thank you for your valuable review!</p>
            `;
        }
    })
    .catch((error) => {  
        review = '';
        rating = '';             
        alert.classList.remove("hidden");
        alert.classList.add("block", "bg-red-100", "text-red-700");
        alert.innerHTML = `
            <p>An error occurred. Please try again later. ${error}</p>
        `;
    });
}

const loadAdoptionHistory = () => {
    fetch(`${database}/transactions/list/?transaction_type=purchase`)
        .then((res) => res.json())
        .then((data) => {
            showReviewForm(data.results);
        });
}

const showReviewForm = (data) => {
    const reviewFromWrapper = document.getElementById("review-form-wrapper");
    const username = document.getElementById("username");
    const userId = localStorage.getItem("user_id")

    fetch(`${database}/user/list/${userId}/`, {
        method: "GET",
        headers: {
            "content-type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((userData) => {
        data.forEach((item) => {
            if (item.pet.id==param) {
                reviewFromWrapper.classList.remove("hidden");
                username.value = userData.user.username;
                username.placeholder = userData.user.username;
                const reviewFormSubmit = document.getElementById("review-form");
                reviewFormSubmit.onsubmit = (event) => {
                    handlePostReview(event, item.pet.id);
                };
            };
        });
    })
}

const petReview = (reviews) => {
    const userId = localStorage.getItem("user_id");
    const parent = document.getElementById("pet-reviews");
   
    if (reviews.length > 0) {
        const div = document.createElement("div");
        div.innerHTML = `
            <h2 class="text-2xl font-semibold bg-pink-100 py-4 px-5 rounded-xl text-pink-800">User Review</h2>
        `;
        parent.appendChild(div);
    }
    reviews.forEach((review) => { 
        fetch(`${database}/user/list/${review.reviewer}`)
            .then((res) => res.json())
            .then((data) => {        
                const div = document.createElement("div");

                div.innerHTML = `
                    <div class="p-4 bg-pink-50 rounded-t-lg">
                        <h4 class="text-lg font-bold mb-1" id="user-name">${data.user.first_name} ${data.user.last_name}</h4>
                        <p class="text-sm font-medium">Published on: ${getDate(review.created_on)}</p>
                    </div>
                    <div class="p-5 text-left border-2 border-pink-50 rounded-b-lg">
                        <p class="font-medium tracking-wide leading-relaxed">${review.review}</p>
                    </div>
                `; 
                parent.appendChild(div)
            });
        })
        .catch((error) => console.error('Error fetching user data', error));
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

getParams();
loadAdoptionHistory();
showUserMenuOrLogin();