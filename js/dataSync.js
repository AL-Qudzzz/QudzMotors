// Data Synchronization Functions
const LOCAL_STORAGE_KEYS = {
    CARS: 'qudzmotors_cars_data',
    NEWS: 'qudzmotors_news_data',
    LAST_SYNC: 'qudzmotors_last_sync'
};

// Function to save data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        console.log(`Data saved to localStorage: ${key}`);
    } catch (error) {
        console.error(`Error saving to localStorage: ${error}`);
    }
}

// Function to get data from localStorage
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error reading from localStorage: ${error}`);
        return null;
    }
}

// Function to check if data needs sync (24 hours)
function needsSync() {
    const lastSync = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
    if (!lastSync) return true;
    
    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceLastSync = (now - lastSyncDate) / (1000 * 60 * 60);
    
    return hoursSinceLastSync >= 24;
}

// Function to sync cars data
async function syncCarsData() {
    try {
        // Always try to get fresh data from Firebase first
        console.log('Fetching cars data from Firebase...');
        const cars = await firebaseDB.getCars();
        
        // Save to localStorage for offline use
        saveToLocalStorage(LOCAL_STORAGE_KEYS.CARS, cars);
        return cars;
    } catch (error) {
        console.error('Error fetching cars from Firebase:', error);
        // Only use cached data if Firebase fetch fails
        const cachedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.CARS);
        if (cachedData) {
            console.log('Using cached cars data due to Firebase error');
            return cachedData;
        }
        return [];
    }
}

// Function to sync news data
async function syncNewsData() {
    try {
        // Always try to get fresh data from Firebase first
        console.log('Fetching news data from Firebase...');
        const news = await firebaseDB.getNews();
        
        // Save to localStorage for offline use
        saveToLocalStorage(LOCAL_STORAGE_KEYS.NEWS, news);
        return news;
    } catch (error) {
        console.error('Error fetching news from Firebase:', error);
        // Only use cached data if Firebase fetch fails
        const cachedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.NEWS);
        if (cachedData) {
            console.log('Using cached news data due to Firebase error');
            return cachedData;
        }
        return [];
    }
}

// Export functions
window.dataSync = {
    syncCarsData,
    syncNewsData,
    getFromLocalStorage,
    saveToLocalStorage,
    needsSync
}; 