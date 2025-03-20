let slideIndex = 0;
const slides = document.getElementsByClassName("slide");
const dots = document.getElementsByClassName("dot");

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

// Fungsi untuk menampilkan pop-up
function showPopup(car) {
  const popup = document.getElementById("carPopup");
  const title = document.getElementById("popupTitle");
  const image = document.getElementById("popupImage");
  const engine = document.getElementById("popupEngine");
  const horsepower = document.getElementById("popupHorsepower");
  const topSpeed = document.getElementById("popupTopSpeed");
  const acceleration = document.getElementById("popupAcceleration");

  // Ambil data dari car-card
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

// Tambahkan event listener untuk setiap car-card
document.querySelectorAll(".car-card").forEach((card) => {
  card.addEventListener("click", function () {
    // Hanya buka pop-up jika card tidak dalam mode enlarged
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

// Fungsi filter dan interaktivitas lainnya
function filterCars() {
  const brand = document.getElementById("brands").value;
  const year = document.getElementById("years").value;
  const price = document.getElementById("price").value;
  const bodyType = document.getElementById("bodyType").value;
  const driveType = document.getElementById("driveType").value;
  const specs = document.getElementById("specs").value;

  const cards = document.getElementsByClassName("car-card");
  for (let card of cards) {
    let show = true;
    if (brand !== "all" && card.getAttribute("data-brand") !== brand)
      show = false;
    if (year !== "all" && card.getAttribute("data-year") !== year) show = false;
    if (price !== "all") {
      const cardPrice = parseInt(card.getAttribute("data-price"));
      const [min, max] = price.split("-").map(Number);
      if (max ? cardPrice < min || cardPrice > max : cardPrice > min)
        show = false;
    }
    if (bodyType !== "all" && card.getAttribute("data-body") !== bodyType)
      show = false;

    card.style.display = show ? "inline-block" : "none";
  }
}

function showAvailable() {
  document
    .querySelectorAll(".status-tabs button")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
}

function showSold() {
  document
    .querySelectorAll(".status-tabs button")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
}

function toggleComparison() {
  alert("Comparison view toggled!");
}
