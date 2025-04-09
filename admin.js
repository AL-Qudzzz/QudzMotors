const adminPassword = "admin123"; // Simple password (replace with secure auth in production)
let carsData = JSON.parse(localStorage.getItem("carsData")) || [];

function login() {
  const password = document.getElementById("adminPassword").value;
  if (password === adminPassword) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
    loadCarTable();
  } else {
    alert("Incorrect password!");
  }
}

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
  clearForm();
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

  deleteCar(index); // Remove the old version, then add the updated one after editing
}

function deleteCar(index) {
  carsData.splice(index, 1);
  localStorage.setItem("carsData", JSON.stringify(carsData));
  loadCarTable();
}

function clearForm() {
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

// Load initial data from cars.json if localStorage is empty
if (!localStorage.getItem("carsData")) {
  fetch("cars.json")
    .then((response) => response.json())
    .then((data) => {
      carsData = data;
      localStorage.setItem("carsData", JSON.stringify(carsData));
    });
}
