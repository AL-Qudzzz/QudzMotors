// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqNqNlE0uiScnpTt3XZAe9xQhNux0Hook",
  authDomain: "qudzmotors.firebaseapp.com",
  projectId: "qudzmotors",
  storageBucket: "qudzmotors.appspot.com",
  messagingSenderId: "147983922560",
  appId: "1:147983922560:web:1bd4d2332800c057133d65",
  measurementId: "G-WSZBV51DH5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Car Management Functions
async function getCars() {
  try {
    const snapshot = await db.collection('cars').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting cars:", error);
    return [];
  }
}

// Check for duplicate car
async function checkDuplicateCar(carData) {
  try {
    const snapshot = await db.collection('cars')
      .where('brand', '==', carData.brand)
      .where('name', '==', carData.name)
      .where('year', '==', carData.year)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking duplicate car:", error);
    throw error;
  }
}

async function addCar(carData) {
  try {
    // Check for duplicates first
    const isDuplicate = await checkDuplicateCar(carData);
    if (isDuplicate) {
      throw new Error("A car with the same brand, name, and year already exists");
    }

    const docRef = await db.collection('cars').add(carData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding car:", error);
    throw error;
  }
}

async function updateCar(carId, carData) {
  try {
    await db.collection('cars').doc(carId).update(carData);
  } catch (error) {
    console.error("Error updating car:", error);
    throw error;
  }
}

async function deleteCar(carId) {
  try {
    await db.collection('cars').doc(carId).delete();
  } catch (error) {
    console.error("Error deleting car:", error);
    throw error;
  }
}

// News Management Functions
async function getNews() {
  try {
    const snapshot = await db.collection('news').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting news:", error);
    return [];
  }
}

// Check for duplicate news
async function checkDuplicateNews(newsData) {
  try {
    const snapshot = await db.collection('news')
      .where('title', '==', newsData.title)
      .where('source', '==', newsData.source)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking duplicate news:", error);
    throw error;
  }
}

async function addNews(newsData) {
  try {
    // Check for duplicates first
    const isDuplicate = await checkDuplicateNews(newsData);
    if (isDuplicate) {
      throw new Error("A news article with the same title and source already exists");
    }

    const docRef = await db.collection('news').add(newsData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding news:", error);
    throw error;
  }
}

async function updateNews(newsId, newsData) {
  try {
    await db.collection('news').doc(newsId).update(newsData);
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
}

async function deleteNews(newsId) {
  try {
    await db.collection('news').doc(newsId).delete();
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
}

// Clean up duplicate cars
async function cleanupDuplicateCars() {
  try {
    const cars = await getCars();
    const uniqueCars = new Map();
    const duplicates = [];

    // Group cars by unique identifier (brand + name + year)
    for (const car of cars) {
      const key = `${car.brand.toLowerCase()}-${car.name.toLowerCase()}-${car.year}`;
      if (uniqueCars.has(key)) {
        duplicates.push(car);
      } else {
        uniqueCars.set(key, car);
      }
    }

    // Delete duplicate cars
    for (const duplicate of duplicates) {
      console.log(`Deleting duplicate car: ${duplicate.brand} ${duplicate.name} (${duplicate.year})`);
      await deleteCar(duplicate.id);
    }

    return {
      totalCars: cars.length,
      uniqueCars: uniqueCars.size,
      deletedDuplicates: duplicates.length
    };
  } catch (error) {
    console.error("Error cleaning up duplicate cars:", error);
    throw error;
  }
}

// Clean up duplicate news
async function cleanupDuplicateNews() {
  try {
    const news = await getNews();
    const uniqueNews = new Map();
    const duplicates = [];

    // Group news by unique identifier (title + source)
    for (const item of news) {
      const key = `${item.title.toLowerCase()}-${item.source.toLowerCase()}`;
      if (uniqueNews.has(key)) {
        // Keep the newer version if dates are different
        const existing = uniqueNews.get(key);
        if (new Date(item.publishedAt) > new Date(existing.publishedAt)) {
          duplicates.push(existing);
          uniqueNews.set(key, item);
        } else {
          duplicates.push(item);
        }
      } else {
        uniqueNews.set(key, item);
      }
    }

    // Delete duplicate news
    for (const duplicate of duplicates) {
      console.log(`Deleting duplicate news: ${duplicate.title} (${duplicate.source})`);
      await deleteNews(duplicate.id);
    }

    return {
      totalNews: news.length,
      uniqueNews: uniqueNews.size,
      deletedDuplicates: duplicates.length
    };
  } catch (error) {
    console.error("Error cleaning up duplicate news:", error);
    throw error;
  }
}

// Export functions
window.firebaseDB = {
  getCars,
  addCar,
  updateCar,
  deleteCar,
  getNews,
  addNews,
  updateNews,
  deleteNews,
  checkDuplicateCar,
  checkDuplicateNews,
  cleanupDuplicateCars,
  cleanupDuplicateNews
}; 