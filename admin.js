const adminPassword = "admin123"; // Simple password (replace with secure auth in production)
let carsData = JSON.parse(localStorage.getItem("carsData")) || [];
let customNews = JSON.parse(localStorage.getItem("customNews")) || [];

function login() {
  const password = document.getElementById("adminPassword").value;
  if (password === adminPassword) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
    loadCarTable();
    loadNewsTable();
  } else {
    alert("Incorrect password!");
  }
}

function switchTab(tab) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab content
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  // Add active class to clicked tab button
  event.target.classList.add('active');
}

// Car Management Functions
function loadCarTable() {
  const tbody = document.getElementById("carTableBody");
  tbody.innerHTML = "";
  carsData.forEach((car, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${car.name}</td>
      <td>${car.brand}</td>
      <td>${car.year}</td>
      <td>${car.price.toLocaleString()}</td>
      <td>
        <button onclick="editCar(${index})">Edit</button>
        <button onclick="deleteCar(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addCar() {
  const car = {
    brand: document.getElementById("carBrand").value,
    name: document.getElementById("carName").value,
    year: parseInt(document.getElementById("carYear").value),
    price: parseInt(document.getElementById("carPrice").value),
    body: document.getElementById("carBody").value,
    image: document.getElementById("carImage").value,
    tooltip: document.getElementById("carTooltip").value,
    drivetrain: document.getElementById("carDrivetrain").value,
    specs: {
      engine: document.getElementById("carEngine").value,
      horsepower: document.getElementById("carHorsepower").value,
      topSpeed: document.getElementById("carTopSpeed").value,
      acceleration: document.getElementById("carAcceleration").value,
    },
  };

  carsData.push(car);
  localStorage.setItem("carsData", JSON.stringify(carsData));
  loadCarTable();
  clearCarForm();
}

function editCar(index) {
  const car = carsData[index];
  document.getElementById("carBrand").value = car.brand;
  document.getElementById("carName").value = car.name;
  document.getElementById("carYear").value = car.year;
  document.getElementById("carPrice").value = car.price;
  document.getElementById("carBody").value = car.body;
  document.getElementById("carImage").value = car.image;
  document.getElementById("carTooltip").value = car.tooltip;
  document.getElementById("carDrivetrain").value = car.drivetrain;
  document.getElementById("carEngine").value = car.specs.engine;
  document.getElementById("carHorsepower").value = car.specs.horsepower;
  document.getElementById("carTopSpeed").value = car.specs.topSpeed;
  document.getElementById("carAcceleration").value = car.specs.acceleration;

  deleteCar(index);
}

function deleteCar(index) {
  carsData.splice(index, 1);
  localStorage.setItem("carsData", JSON.stringify(carsData));
  loadCarTable();
}

function clearCarForm() {
  document.getElementById("carBrand").value = "";
  document.getElementById("carName").value = "";
  document.getElementById("carYear").value = "";
  document.getElementById("carPrice").value = "";
  document.getElementById("carBody").value = "";
  document.getElementById("carImage").value = "";
  document.getElementById("carTooltip").value = "";
  document.getElementById("carDrivetrain").value = "";
  document.getElementById("carEngine").value = "";
  document.getElementById("carHorsepower").value = "";
  document.getElementById("carTopSpeed").value = "";
  document.getElementById("carAcceleration").value = "";
}

// News Management Functions
function loadNewsTable() {
  const tbody = document.getElementById("newsTableBody");
  tbody.innerHTML = "";
  customNews.forEach((news, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${news.title}</td>
      <td>${new Date(news.publishedAt).toLocaleDateString()}</td>
      <td>${news.source}</td>
      <td>
        <button onclick="editNews(${index})">Edit</button>
        <button onclick="deleteNews(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addNews() {
  const news = {
    title: document.getElementById("newsTitle").value,
    content: document.getElementById("newsContent").value,
    imageUrl: document.getElementById("newsImage").value,
    source: document.getElementById("newsSource").value,
    publishedAt: new Date().toISOString(),
    url: "#" // Custom news doesn't have external URL
  };

  customNews.push(news);
  localStorage.setItem("customNews", JSON.stringify(customNews));
  loadNewsTable();
  clearNewsForm();
}

function editNews(index) {
  const news = customNews[index];
  document.getElementById("newsTitle").value = news.title;
  document.getElementById("newsContent").value = news.content;
  document.getElementById("newsImage").value = news.imageUrl;
  document.getElementById("newsSource").value = news.source;

  deleteNews(index);
}

function deleteNews(index) {
  customNews.splice(index, 1);
  localStorage.setItem("customNews", JSON.stringify(customNews));
  loadNewsTable();
}

function clearNewsForm() {
  document.getElementById("newsTitle").value = "";
  document.getElementById("newsContent").value = "";
  document.getElementById("newsImage").value = "";
  document.getElementById("newsSource").value = "";
}

// Load initial data from cars.json if localStorage is empty
if (!localStorage.getItem("carsData")) {
  fetch("cars.json")
    .then((response) => response.json())
    .then((data) => {
      carsData = data;
      localStorage.setItem("carsData", JSON.stringify(carsData));
    });
}
