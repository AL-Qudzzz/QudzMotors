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

async function addCar(carData) {
  try {
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

async function addNews(newsData) {
  try {
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

// Export functions
window.firebaseDB = {
  getCars,
  addCar,
  updateCar,
  deleteCar,
  getNews,
  addNews,
  updateNews,
  deleteNews
}; 