// const database = "http://127.0.0.1:8000"
const database = "https://pawsandheart-db.onrender.com"

const loadPets = () => {
    document.getElementById("pets-slider").innerHTML = "";

    fetch(`${database}/pets/random-pets/`)
        .then((res) => res.json())
        .then((data) => {
            if (data.length > 0) {
                displayPetsSlider(data);
            } else {
                document.getElementById("pets-slider").innerHTML = "";
            }
        })
        .catch(error => {
            console.error('Error fetching pets:', error);
            document.getElementById("spinner").style.display = "none";
            document.getElementById("nodata").style.display = "block";
        });    
}

const loadReviews = () => {
    document.getElementById("reviews-slider").innerHTML = "";

    fetch(`${database}/pets/reviews/`)
        .then((res) => res.json())
        .then((data) => {
            if (data?.length > 0) {
                displayReviewsSlider(data);
            } else {
                document.getElementById("reviews-slider").innerHTML = "";
            }
        })
        .catch(error => {
            console.error('Error fetching pets:', error);
            document.getElementById("spinner").style.display = "none";
            document.getElementById("nodata").style.display = "block";
        });    
}

const getDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

const displayPetsSlider = (pets) => {
    pets.forEach((pet) => {
        fetch(`${database}/user/list/${pet.user}`)
            .then((res) => res.json())
            .then((userData) => {            
                if(!pet.adopted) {
                    const parent = document.getElementById("pets-slider");
                    const li = document.createElement("li");

                    li.innerHTML = `
                        <a href="pet.html?petId=${pet.id}" target="_blank" class="cursor-pointer hover:shadow-xl">
                            <div class="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100">
                                <img class="object-cover w-full rounded-t-lg h-80 md:h-fixed md:w-60 md:rounded-none md:rounded-s-lg" src="${pet.image}" alt="${pet.name}">
                                <div class="flex flex-col justify-between p-4 leading-normal">
                                    <h3 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Name: ${pet.name}</h3>
                                    <p class="mb-3 font-medium text-gray-700">Description: ${pet.description}</p>
                                    <ul class="px-9 font-medium list-disc text-gray-800">
                                        <li>Enlisted on: ${getDate(pet?.created_on)}</li>
                                        <li>Species: ${pet?.species}</li>
                                        <li>Age: ${pet?.age}</li>
                                    </ul>                        
                                    <h6 class="font-semibold text-[22px] mt-5 text-pink-700">Price: <b>${pet?.price===0 ? 'Free' : `$ ${pet?.price}`}</b></h6>
                                </div>
                            </div>
                        </a>
                    `;
                
                    parent.appendChild(li); 
                }
            })
    });
};

const displayReviewsSlider = (reviews) => {
    reviews.forEach((review) => {
        fetch(`${database}/user/list/${review.reviewer}`)
            .then((res) => res.json())
            .then((reviewer) => {                
                const parent = document.getElementById("reviews-slider");
                const li = document.createElement("li");

                li.innerHTML = `
                    <figure class="bg-white border-2 border-gray-200 rounded-xl p-12 text-center review-bg-image">
                        <svg class="w-10 h-10 mx-auto mb-5 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
                            <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
                        </svg>
                        <blockquote>
                            <p class="text-[22px] italic font-semibold text-gray-900">"${review.review}"</p>
                        </blockquote>
                        <div class="text-2xl mx-auto py-4">${review.rating}</div>
                        <figcaption class="flex items-center justify-center mt-3">
                            <p class="font-bold text-xl text-gray-900">${reviewer.user.first_name} ${reviewer.user.last_name}</p>
                        </figcaption>
                    </figure>
                `;
            
                parent.appendChild(li);                
            });
    });
};

const contactForm = (event) => {
    event.preventDefault();
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    fetch('http://127.0.0.1:8000/contact/', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const showUserMenuOrLogin = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const getStarted = document.getElementById("get-started-btn");
    const userMenu = document.getElementById("user-profile-btn");

    if (token && userId) {
        getStarted.classList.add("hidden");
        userMenu.classList.add("block");
    }
    userMenu.classList.add("hidden");
    getStarted.classList.add("block");
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
loadPets();
loadReviews();
showUserMenuOrLogin();