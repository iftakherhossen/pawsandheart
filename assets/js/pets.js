// const database = "http://127.0.0.1:8000"
const database = "https://pawsandheart-db.onrender.com" 
let currentPage = 1;
let count;

const loadSpecies = () => {
    fetch(`${database}/pets/species/`)
        .then((res) => res.json())
        .then((data) => {
            data.forEach((item) => {
                const parent = document.getElementById("species-list");
                const li = document.createElement("li");
                li.classList.add("list-none")
                li.innerHTML = `
                    <button type="button" onclick="loadPets('${item.name}')" class="inline-flex w-full px-4 py-2 hover:bg-pink-100 font-medium">${item.name}</button>
                `
                parent.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error fetching species:', error);
        });
};

document.getElementById("search-text").style.display = "none";

const handleSearch = (event) => {
    event.preventDefault();
    const value = document.getElementById("search").value;
    loadPets(value);
    document.getElementById("search-text").style.display = "block";
    document.getElementById("search-text").textContent = `Searched with the keyword: ${value}`
};

const loadPets = (search) => {
    document.getElementById("pets").innerHTML = "";
    document.getElementById("spinner").style.display = "block";
    let url;
    search ? url = `${database}/pets/list/?search=${search}`: url =`${database}/pets/list/?page=${currentPage}`;

    fetch(`${url}`)
        .then((res) => res.json())
        .then((data) => {
            document.getElementById("spinner").style.display = "none";
            if (data?.results?.length > 0) {
                displayPets(data.results);
                controlPagination()
                document.getElementById("nodata").style.display = "none";
                count = data.count;
            } else {
                document.getElementById("pets").innerHTML = "";                
                document.getElementById("nodata").style.display = "block";
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

const displayPets = (pets) => {
    pets?.forEach((pet) => {
        const parent = document.getElementById("pets");
        const div = document.createElement("div");
        const adoptedBadge = pet.adopted ? `<span class="bg-red-100 text-red-800 font-medium px-3 py-0.5 tracking-wide rounded">Adopted</span>` : '';
        
        div.innerHTML = `
            <a href="pet.html?petId=${pet.id}" class="cursor-pointer hover:shadow-xl">
                <div class="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-2xl hover:bg-gray-100">
                    <img class="object-cover w-full rounded-t-lg h-80 md:h-fixed md:w-60 md:rounded-none md:rounded-s-lg" src="${pet.image}" alt="${pet.name}">
                    <div class="flex flex-col justify-between p-4 leading-normal">
                        <div class="flex items-center gap-4 mb-3">
                            <h5 class="text-2xl font-bold tracking-tight text-gray-900">${pet.name}</h5>
                            ${adoptedBadge}
                        </div>
                        <p class="mb-4 font-medium text-gray-700">${pet.description}</p>
                        <ul class="px-9 font-medium list-disc text-gray-800">
                            <li>Enlisted on: <b>${getDate(pet.created_on)}</b></li>
                            <li>Species: <b>${pet.species}</b></li>
                            <li>Age: <b>${pet?.age}</b></li>
                        </ul>                        
                        <h6 class="font-bold text-[22px] mt-5 text-pink-700">Price: ${pet?.price===0 ? 'Free' : `$ ${pet?.price}`}</h6>
                    </div>
                </div>
            </a>
        `;
    
        parent.appendChild(div);
    });
};

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
    let totalPage = Math.ceil(count / 6);

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

loadSpecies();
loadPets();
showUserMenuOrLogin();