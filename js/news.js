// News API configuration
const NEWS_API_KEY = 'YOUR_NEWS_API_KEY'; // Replace with your News API key
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const ITEMS_PER_PAGE = 6;

let currentPage = 1;
let currentFilter = 'all';
let newsData = {
    api: [],
    custom: []
};

// Load news on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCustomNews();
    loadApiNews();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            displayNews();
        });
    });

    // Pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayNews();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredNews().length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            displayNews();
        }
    });
}

// Load news from API
async function loadApiNews() {
    try {
        const response = await fetch(`${NEWS_API_URL}?q=automotive+OR+cars&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            newsData.api = data.articles.map(article => ({
                title: article.title,
                description: article.description,
                content: article.content,
                url: article.url,
                imageUrl: article.urlToImage,
                publishedAt: new Date(article.publishedAt),
                source: article.source.name,
                type: 'api'
            }));
            displayNews();
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Load custom news from Firebase
async function loadCustomNews() {
    try {
        const customNews = await dataSync.syncNewsData();
        newsData.custom = customNews.map(news => ({
            ...news,
            type: 'custom'
        }));
        displayNews();
    } catch (error) {
        console.error("Error loading custom news:", error);
    }
}

// Get filtered news based on current filter
function getFilteredNews() {
    switch (currentFilter) {
        case 'api':
            return newsData.api;
        case 'custom':
            return newsData.custom;
        default:
            return [...newsData.api, ...newsData.custom].sort((a, b) => b.publishedAt - a.publishedAt);
    }
}

// Display news items
function displayNews() {
    const newsGrid = document.getElementById('newsGrid');
    const filteredNews = getFilteredNews();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newsToShow = filteredNews.slice(startIndex, endIndex);

    newsGrid.innerHTML = '';
    
    newsToShow.forEach(news => {
        const newsCard = createNewsCard(news);
        newsGrid.appendChild(newsCard);
    });

    updatePagination(filteredNews.length);
}

// Create news card element
function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.height = '100%';
    const defaultImage = '../assets/image/default-news-image.jpg';
    const imagePath = news.imageUrl.startsWith('http') ? news.imageUrl : `../assets/image/${news.imageUrl}`;
    card.innerHTML = `
        <div class="news-image">
            <img src="${imagePath}" alt="${news.title}">
        </div>
        <div class="news-info" style="display: flex; flex-direction: column; flex: 1;">
            <h3>${news.title}</h3>
            <p class="news-desc" style="flex:0 0 auto;">${news.description || news.content}</p>
            <div class="news-meta" style="flex:0 0 auto;">
                <span>${formatDate(news.publishedAt)}</span>
                <span>${news.source}</span>
            </div>
            <div style="flex:1 1 auto;"></div>
            <button onclick="showNewsPopup(${JSON.stringify(news).replace(/\"/g, '&quot;')})" class="read-more" style="margin-top:auto;align-self:flex-start;">
                Read More
            </button>
        </div>
    `;
    return card;
}

// Show news popup
function showNewsPopup(news) {
    const popup = document.getElementById('newsPopup');
    document.getElementById('popupTitle').textContent = news.title;
    document.getElementById('popupDate').textContent = formatDate(news.publishedAt);
    document.getElementById('popupSource').textContent = news.source;
    document.getElementById('popupImage').src = news.imageUrl || '../assets/image/default-news-image.jpg';
    document.getElementById('popupContent').textContent = news.content || news.description;
    document.getElementById('popupLink').href = news.url || '#';
    document.getElementById('popupLink').target = '_blank';
    popup.style.display = 'flex';
}

// Close news popup
function closeNewsPopup() {
    document.getElementById('newsPopup').style.display = 'none';
}

// Update pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    document.getElementById('currentPage').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
} 