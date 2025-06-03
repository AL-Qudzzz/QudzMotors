const adminPassword = "admin123"; // Simple password (replace with secure auth in production)
let carsData = [];
let customNews = [];

// Load initial data
async function loadInitialData() {
  try {
    carsData = await firebaseDB.getCars();
    customNews = await firebaseDB.getNews();
    loadCarTable();
    loadNewsTable();
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
}

// Load initial data from cars.json if Firebase is empty
async function loadInitialCars() {
  try {
    const cars = await firebaseDB.getCars();
    if (cars.length === 0) {
      const response = await fetch("../assets/cars.json");
      const data = await response.json();
      for (const car of data) {
        await firebaseDB.addCar(car);
      }
    }
  } catch (error) {
    console.error("Error loading initial cars:", error);
  }
}

// Load initial data from news.json if Firebase is empty
async function loadInitialNews() {
  try {
    const news = await firebaseDB.getNews();
    if (news.length === 0) {
      const response = await fetch("../assets/news.json");
      const data = await response.json();
      for (const item of data) {
        await firebaseDB.addNews(item);
      }
    }
  } catch (error) {
    console.error("Error loading initial news:", error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadInitialCars();
  loadInitialNews();
});

// --- SYNC FUNCTIONS ---
async function syncNewsWithJson() {
  try {
    const [jsonRes, firestoreNews] = await Promise.all([
      fetch("../assets/news.json").then(res => res.json()),
      firebaseDB.getNews()
    ]);
    const firestoreMap = new Map(firestoreNews.map(n => [`${n.title}|||${n.source}`, n]));
    const jsonMap = new Map(jsonRes.map(n => [`${n.title}|||${n.source}`, n]));
    // Add or update
    for (const item of jsonRes) {
      const key = `${item.title}|||${item.source}`;
      const firestoreItem = firestoreMap.get(key);
      if (!firestoreItem) {
        await firebaseDB.addNews(item);
      } else {
        const fields = ["content", "imageUrl", "publishedAt", "url"];
        const changed = fields.some(f => firestoreItem[f] !== item[f]);
        if (changed) {
          await firebaseDB.updateNews(firestoreItem.id, item);
        }
      }
    }
    // Delete
    for (const n of firestoreNews) {
      const key = `${n.title}|||${n.source}`;
      if (!jsonMap.has(key)) {
        await firebaseDB.deleteNews(n.id);
      }
    }
  } catch (error) {
    console.error("Error syncing news:", error);
  }
}

async function syncCarsWithJson() {
  try {
    const [jsonRes, firestoreCars] = await Promise.all([
      fetch("../assets/cars.json").then(res => res.json()),
      firebaseDB.getCars()
    ]);
    const firestoreMap = new Map(firestoreCars.map(c => [`${c.brand}|||${c.name}|||${c.year}`, c]));
    const jsonMap = new Map(jsonRes.map(c => [`${c.brand}|||${c.name}|||${c.year}`, c]));
    // Add or update
    for (const item of jsonRes) {
      const key = `${item.brand}|||${item.name}|||${item.year}`;
      const firestoreItem = firestoreMap.get(key);
      if (!firestoreItem) {
        await firebaseDB.addCar(item);
      } else {
        const fields = ["price", "body", "image", "tooltip", "drivetrain"];
        const specsChanged = JSON.stringify(firestoreItem.specs) !== JSON.stringify(item.specs);
        const changed = fields.some(f => firestoreItem[f] !== item[f]) || specsChanged;
        if (changed) {
          await firebaseDB.updateCar(firestoreItem.id, item);
        }
      }
    }
    // Delete
    for (const c of firestoreCars) {
      const key = `${c.brand}|||${c.name}|||${c.year}`;
      if (!jsonMap.has(key)) {
        await firebaseDB.deleteCar(c.id);
      }
    }
  } catch (error) {
    console.error("Error syncing cars:", error);
  }
}

// Change login to async and call sync functions before loadInitialData
async function login() {
  const password = document.getElementById("adminPassword").value;
  if (password === adminPassword) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";
    await syncNewsWithJson();
    await syncCarsWithJson();
    await loadInitialData();
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
  carsData.forEach((car) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${car.name}</td>
      <td>${car.brand}</td>
      <td>${car.year}</td>
      <td>${car.price.toLocaleString()}</td>
      <td>
        <button onclick="editCar('${car.id}')">Edit</button>
        <button onclick="deleteCar('${car.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function addCar() {
  try {
    const car = {
      brand: document.getElementById("carBrand").value.trim(),
      name: document.getElementById("carName").value.trim(),
      year: parseInt(document.getElementById("carYear").value),
      price: parseInt(document.getElementById("carPrice").value),
      body: document.getElementById("carBody").value.trim(),
      image: document.getElementById("carImage").value.trim(),
      tooltip: document.getElementById("carTooltip").value.trim(),
      drivetrain: document.getElementById("carDrivetrain").value.trim(),
      specs: {
        engine: document.getElementById("carEngine").value.trim(),
        horsepower: document.getElementById("carHorsepower").value.trim(),
        topSpeed: document.getElementById("carTopSpeed").value.trim(),
        acceleration: document.getElementById("carAcceleration").value.trim(),
      },
    };

    // Validate required fields
    if (!car.brand || !car.name || !car.year || !car.price) {
      alert("Please fill in all required fields (Brand, Name, Year, Price)");
      return;
    }

    const carId = await firebaseDB.addCar(car);
    car.id = carId;
    carsData.push(car);
    loadCarTable();
    clearCarForm();
    alert("Car added successfully!");
  } catch (error) {
    console.error("Error adding car:", error);
    if (error.message.includes("already exists")) {
      alert(error.message);
    } else {
      alert("Failed to add car. Please try again.");
    }
  }
}

async function editCar(carId) {
  const car = carsData.find(c => c.id === carId);
  if (!car) return;

  // Populate form with car data
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

  // Change add button to update button
  const addButton = document.querySelector('button[onclick="addCar()"]');
  addButton.textContent = "Update Car";
  addButton.onclick = () => updateCar(carId);
}

async function updateCar(carId) {
  try {
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

    await firebaseDB.updateCar(carId, car);
    const index = carsData.findIndex(c => c.id === carId);
    if (index !== -1) {
      carsData[index] = { ...car, id: carId };
    }
    loadCarTable();
    clearCarForm();

    // Reset add button
    const updateButton = document.querySelector('button[onclick="updateCar(\'' + carId + '\')"]');
    updateButton.textContent = "Add Car";
    updateButton.onclick = addCar;
  } catch (error) {
    console.error("Error updating car:", error);
    alert("Failed to update car. Please try again.");
  }
}

async function deleteCar(carId) {
  if (!confirm("Are you sure you want to delete this car?")) return;

  try {
    await firebaseDB.deleteCar(carId);
    carsData = carsData.filter(car => car.id !== carId);
    loadCarTable();
  } catch (error) {
    console.error("Error deleting car:", error);
    alert("Failed to delete car. Please try again.");
  }
}

// News Management Functions
function loadNewsTable() {
  const tbody = document.getElementById("newsTableBody");
  tbody.innerHTML = "";
  customNews.forEach((news) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${news.title}</td>
      <td>${new Date(news.publishedAt).toLocaleDateString()}</td>
      <td>${news.source}</td>
      <td>
        <button onclick="editNews('${news.id}')">Edit</button>
        <button onclick="deleteNews('${news.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function addNews() {
  try {
    const news = {
      title: document.getElementById("newsTitle").value.trim(),
      content: document.getElementById("newsContent").value.trim(),
      imageUrl: document.getElementById("newsImage").value.trim(),
      source: document.getElementById("newsSource").value.trim(),
      publishedAt: new Date().toISOString(),
      url: document.getElementById("newsUrl").value.trim()
    };

    // Validate required fields
    if (!news.title || !news.content || !news.source) {
      alert("Please fill in all required fields (Title, Content, Source)");
      return;
    }

    const newsId = await firebaseDB.addNews(news);
    news.id = newsId;
    customNews.push(news);
    loadNewsTable();
    clearNewsForm();
    alert("News added successfully!");
  } catch (error) {
    console.error("Error adding news:", error);
    if (error.message.includes("already exists")) {
      alert(error.message);
    } else {
      alert("Failed to add news. Please try again.");
    }
  }
}

async function editNews(newsId) {
  const news = customNews.find(n => n.id === newsId);
  if (!news) return;

  // Populate form with news data
  document.getElementById("newsTitle").value = news.title;
  document.getElementById("newsContent").value = news.content;
  document.getElementById("newsImage").value = news.imageUrl;
  document.getElementById("newsSource").value = news.source;

  // Change add button to update button
  const addButton = document.querySelector('button[onclick="addNews()"]');
  addButton.textContent = "Update News";
  addButton.onclick = () => updateNews(newsId);
}

async function updateNews(newsId) {
  try {
    const news = {
      title: document.getElementById("newsTitle").value,
      content: document.getElementById("newsContent").value,
      imageUrl: document.getElementById("newsImage").value,
      source: document.getElementById("newsSource").value,
      publishedAt: new Date().toISOString(),
      url: "#"
    };

    await firebaseDB.updateNews(newsId, news);
    const index = customNews.findIndex(n => n.id === newsId);
    if (index !== -1) {
      customNews[index] = { ...news, id: newsId };
    }
    loadNewsTable();
    clearNewsForm();

    // Reset add button
    const updateButton = document.querySelector('button[onclick="updateNews(\'' + newsId + '\')"]');
    updateButton.textContent = "Add News";
    updateButton.onclick = addNews;
  } catch (error) {
    console.error("Error updating news:", error);
    alert("Failed to update news. Please try again.");
  }
}

async function deleteNews(newsId) {
  if (!confirm("Are you sure you want to delete this news?")) return;

  try {
    await firebaseDB.deleteNews(newsId);
    customNews = customNews.filter(news => news.id !== newsId);
    loadNewsTable();
  } catch (error) {
    console.error("Error deleting news:", error);
    alert("Failed to delete news. Please try again.");
  }
}

// Helper Functions
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

function clearNewsForm() {
  document.getElementById("newsTitle").value = "";
  document.getElementById("newsContent").value = "";
  document.getElementById("newsImage").value = "";
  document.getElementById("newsSource").value = "";
}

// Cleanup Functions
async function cleanupCars() {
  if (!confirm("Are you sure you want to clean up duplicate cars? This action cannot be undone.")) {
    return;
  }

  try {
    const result = await firebaseDB.cleanupDuplicateCars();
    alert(`Cleanup completed!\nTotal cars: ${result.totalCars}\nUnique cars: ${result.uniqueCars}\nDeleted duplicates: ${result.deletedDuplicates}`);
    // Reload the data
    await loadInitialData();
  } catch (error) {
    console.error("Error cleaning up cars:", error);
    alert("Failed to clean up duplicate cars. Please try again.");
  }
}

async function cleanupNews() {
  if (!confirm("Are you sure you want to clean up duplicate news? This action cannot be undone.")) {
    return;
  }

  try {
    const result = await firebaseDB.cleanupDuplicateNews();
    alert(`Cleanup completed!\nTotal news: ${result.totalNews}\nUnique news: ${result.uniqueNews}\nDeleted duplicates: ${result.deletedDuplicates}`);
    // Reload the data
    await loadInitialData();
  } catch (error) {
    console.error("Error cleaning up news:", error);
    alert("Failed to clean up duplicate news. Please try again.");
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadInitialCars();
});
