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

// Load custom news from localStorage
function loadCustomNews() {
    const customNews = JSON.parse(localStorage.getItem('customNews')) || [];
    newsData.custom = customNews.map(news => ({
        ...news,
        type: 'custom'
    }));
    displayNews();
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
    card.innerHTML = `
        <div class="news-image">
            <img src="${news.imageUrl || 'default-news-image.jpg'}" alt="${news.title}">
        </div>
        <div class="news-info">
            <h3>${news.title}</h3>
            <p class="news-desc">${news.description || news.content}</p>
            <div class="news-meta">
                <span>${formatDate(news.publishedAt)}</span>
                <span>${news.source}</span>
            </div>
            <button onclick="showNewsPopup(${JSON.stringify(news).replace(/"/g, '&quot;')})" class="read-more">
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
    document.getElementById('popupImage').src = news.imageUrl || 'default-news-image.jpg';
    document.getElementById('popupContent').textContent = news.content || news.description;
    document.getElementById('popupLink').href = news.url;
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