let slideIndex = 0;
const slides = document.getElementsByClassName("slide");
const dots = document.getElementsByClassName("dot");
let carsData = []; // Untuk menyimpan data mobil dari JSON

// Fungsi untuk hamburger menu
function toggleMenu() {
  const nav = document.getElementById("navMenu");
  nav.classList.toggle("active");
}

// Fungsi untuk toggle filter menu
function toggleFilters() {
  const filterSection = document.getElementById("filterSection");
  const filterToggle = document.querySelector(".filter-toggle");
  filterSection.classList.toggle("active");
  filterToggle.classList.toggle("active");
}

// Fungsi untuk menampilkan slide
function showSlides(n) {
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;

  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
    dots[i].classList.remove("active");
  }

  slides[slideIndex].classList.add("active");
  dots[slideIndex].classList.add("active");
}

// Pergantian slide otomatis setiap 5 detik
setInterval(() => {
  slideIndex++;
  showSlides(slideIndex);
}, 5000);

// Fungsi untuk tombol prev/next
function changeSlide(n) {
  slideIndex += n;
  showSlides(slideIndex);
}

// Fungsi untuk dots
function currentSlide(n) {
  slideIndex = n;
  showSlides(slideIndex);
}

// Inisialisasi slideshow
showSlides(slideIndex);

// Fungsi untuk memuat data mobil dari JSON
async function loadCars() {
  try {
    carsData = await dataSync.syncCarsData();
    displayCars(carsData);
  } catch (error) {
    console.error("Error loading cars:", error);
  }
}

// Fungsi untuk menampilkan mobil ke dalam HTML
function displayCars(cars) {
  const carGrid = document.getElementById("carGrid");
  carGrid.innerHTML = ""; // Kosongkan grid sebelum menambahkan elemen baru

  cars.forEach((car) => {
    const carCard = document.createElement("div");
    carCard.classList.add("car-card");
    carCard.setAttribute("data-brand", car.brand);
    carCard.setAttribute("data-year", car.year);
    carCard.setAttribute("data-price", car.price);
    carCard.setAttribute("data-body", car.body);
    carCard.setAttribute("data-drivetrain", car.drivetrain); // Tambahkan data-drivetrain
    carCard.setAttribute("data-tooltip", car.tooltip);
    carCard.setAttribute("data-specs", JSON.stringify(car.specs));
    carCard.setAttribute("data-name", car.name.toLowerCase()); // Untuk pencarian

    // Update image path to use assets folder
    const imagePath = car.image.startsWith('http') ? car.image : `../assets/${car.image}`;
    
    carCard.innerHTML = `
            <img src="${imagePath}" alt="${car.name}">
            <h3>${car.name}</h3>
            <p>Price: $ ${car.price.toLocaleString()}</p>
            <p>Year: ${car.year} | 0 km</p>
        `;

    carGrid.appendChild(carCard);
  });

  // Tambahkan event listener untuk setiap car-card setelah dimuat
  addCarCardListeners();
}

// Fungsi untuk menambahkan event listener ke car-card
function addCarCardListeners() {
  document.querySelectorAll(".car-card").forEach((card) => {
    card.addEventListener("click", function (event) {
      if (!this.classList.contains("enlarged")) {
        showPopup(this);
      } else {
        this.classList.remove("enlarged");
        this.style.transform = "translateY(-5px)";
        this.style.zIndex = "auto";
        this.style.position = "relative";
        this.style.left = "auto";
        this.style.top = "auto";
        this.style.transformOrigin = "center";
      }
    });

    card.addEventListener("mouseleave", function () {
      if (this.classList.contains("enlarged")) {
        this.classList.remove("enlarged");
        this.style.transform = "translateY(-5px)";
        this.style.zIndex = "auto";
        this.style.position = "relative";
        this.style.left = "auto";
        this.style.top = "auto";
        this.style.transformOrigin = "center";
      }
    });
  });
}

// Fungsi untuk menampilkan pop-up
function showPopup(car) {
  const popup = document.getElementById("carPopup");
  const title = document.getElementById("popupTitle");
  const image = document.getElementById("popupImage");
  const engine = document.getElementById("popupEngine");
  const horsepower = document.getElementById("popupHorsepower");
  const topSpeed = document.getElementById("popupTopSpeed");
  const acceleration = document.getElementById("popupAcceleration");

  const specs = JSON.parse(car.getAttribute("data-specs"));
  title.textContent = car.querySelector("h3").textContent;
  image.src = car.querySelector("img").src;
  engine.textContent = specs.engine;
  horsepower.textContent = specs.horsepower;
  topSpeed.textContent = specs.topSpeed;
  acceleration.textContent = specs.acceleration;

  popup.style.display = "flex";
}

// Fungsi untuk menutup pop-up
function closePopup() {
  const popup = document.getElementById("carPopup");
  popup.style.display = "none";
}

// Fungsi untuk fitur pencarian
function searchCars() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredCars = carsData.filter((car) =>
    car.name.toLowerCase().includes(searchTerm)
  );
  displayCars(filteredCars);
}

// Fungsi untuk filter
function filterCars() {
  const brand = document.getElementById("brands").value;
  const year = document.getElementById("years").value;
  const price = document.getElementById("price").value;
  const bodyType = document.getElementById("bodyType").value;
  const driveType = document.getElementById("driveType").value;
  const specs = document.getElementById("specs").value;

  let filteredCars = carsData.filter((car) => {
    let show = true;
    if (brand !== "all" && car.brand !== brand) show = false;
    if (year !== "all" && car.year !== parseInt(year)) show = false;
    if (price !== "all") {
      const carPrice = car.price;
      const [min, max] = price.split("-").map(Number);
      if (max ? carPrice < min || carPrice > max : carPrice > min) show = false;
    }
    if (bodyType !== "all" && car.body !== bodyType) show = false;
    if (driveType !== "all" && car.drivetrain.toLowerCase() !== driveType)
      show = false; // Filter drivetrain
    // Tambahkan logika filter untuk specs jika diperlukan
    return show;
  });

  // Terapkan pencarian juga setelah filter
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  if (searchTerm) {
    filteredCars = filteredCars.filter((car) =>
      car.name.toLowerCase().includes(searchTerm)
    );
  }

  displayCars(filteredCars);
}

// Muat data mobil saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadCars);
