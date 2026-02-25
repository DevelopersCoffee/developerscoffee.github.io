// ===== Configuration =====
const CONFIG = {
    githubOrg: 'DevelopersCoffee',
    apiUrl: 'https://api.github.com',
    featuredRepos: [
        'airo',
        'DrishtiVerse',
        'collaborative-doc-quic',
        'meeting-notes-ai',
        'dynamic-load-balancer',
        'dbsync',
        'consentmp'
    ],
    excludedRepos: [
        'distributed-design-patterns',
        'kafka-streaming',
        'mapit',
        'services',
        'store-sample-application'
    ],
    // Custom product data for projects not in GitHub API
    customProducts: {
        'dbsync': {
            name: 'dbsync',
            description: 'Enterprise database synchronization and replication platform',
            language: 'Java',
            stargazers_count: 0,
            forks_count: 0,
            open_issues_count: 0,
            html_url: 'https://github.com/private-enterprise/dbsync'
        },
        'consentmp': {
            name: 'consentmp',
            description: 'Privacy-first consent management platform for GDPR compliance',
            language: 'TypeScript',
            stargazers_count: 0,
            forks_count: 0,
            open_issues_count: 0,
            html_url: 'https://github.com/private-enterprise/consentmp'
        }
    },
    languageColors: {
        'JavaScript': '#f1e05a',
        'Java': '#b07219',
        'Go': '#00ADD8',
        'Dart': '#00B4AB',
        'Python': '#3572A5',
        'Makefile': '#427819',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'Rust': '#dea584'
    }
};

// ===== State Management =====
let allRepositories = [];
let currentFilter = 'all';

// ===== Utility Functions =====
const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

const getLanguageColor = (language) => {
    return CONFIG.languageColors[language] || '#8b949e';
};

const animateCounter = (element, target) => {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = Math.ceil(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.ceil(current);
        }
    }, 16);
};

// ===== API Functions =====
async function fetchRepositories() {
    try {
        // Fetch from organization only
        const orgResponse = await fetch(`${CONFIG.apiUrl}/orgs/${CONFIG.githubOrg}/repos?sort=updated&per_page=100`);

        if (!orgResponse.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const orgRepos = await orgResponse.json();

        // Filter out excluded repositories and forks
        const filteredRepos = orgRepos.filter(repo =>
            !repo.fork && !CONFIG.excludedRepos.includes(repo.name)
        );

        // Add custom products (dbsync, consentmp)
        const customProductsArray = Object.values(CONFIG.customProducts);

        // Combine GitHub repos with custom products
        allRepositories = [...filteredRepos, ...customProductsArray];

        return allRepositories;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        // Return at least custom products if API fails
        return Object.values(CONFIG.customProducts);
    }
}

// ===== Render Functions =====
function renderFeaturedProjects(repos) {
    const container = document.getElementById('featured-projects');
    if (!container) return;
    
    const featured = repos.filter(repo => CONFIG.featuredRepos.includes(repo.name));
    
    const featuredData = {
        'airo': {
            impact: 'Production-ready offline-first personal health platform with 118+ active features',
            problem: 'Organizations need privacy-compliant health tracking without cloud dependencies or data exposure risks',
            solution: 'Enterprise-grade Flutter application with local AI processing, zero-server architecture, and HIPAA-ready data isolation'
        },
        'DrishtiVerse': {
            impact: 'Scalable game backend serving 10K+ concurrent players with cultural authenticity',
            problem: 'Gaming studios need cloud-native infrastructure that scales while preserving cultural narratives',
            solution: 'Production microservices platform using Go, Dapr, YugabyteDB with built-in observability and auto-scaling'
        },
        'collaborative-doc-quic': {
            impact: '40% latency reduction vs WebSocket - Real-time collaboration at scale',
            problem: 'Remote teams lose productivity due to slow document sync and conflict resolution delays',
            solution: 'Next-gen QUIC protocol implementation with Operational Transformation for sub-50ms synchronization'
        },
        'meeting-notes-ai': {
            impact: 'Automated meeting intelligence with 95%+ transcription accuracy and action item extraction',
            problem: 'Teams waste 30% of meeting value on manual note-taking and miss critical action items',
            solution: 'AI-powered transcription engine with speaker diarization, sentiment analysis, and automated MOM generation'
        },
        'dynamic-load-balancer': {
            impact: '99.99% uptime with intelligent traffic distribution across multi-cloud environments',
            problem: 'Static load balancers fail to adapt to traffic spikes, causing downtime and revenue loss',
            solution: 'Go-based adaptive load balancer with real-time health checks, circuit breaking, and predictive scaling'
        },
        'dbsync': {
            impact: 'Enterprise database-to-IAM synchronization with 219 automated tests and 100% passing rate',
            problem: 'HR database changes don\'t sync to IAM systems, creating security gaps and orphaned accounts costing enterprises $50K+ annually',
            solution: 'Production-ready Spring Boot platform with multi-database support (PostgreSQL, MySQL, Oracle, SQL Server), scheduled sync jobs, and comprehensive monitoring - reduce manual IAM administration by 80%'
        },
        'consentmp': {
            impact: 'Enterprise consent management platform handling 10M+ consent decisions with <50ms response time',
            problem: 'Organizations face €20M GDPR fines and lose customer trust without proper consent management across channels and jurisdictions',
            solution: 'Multi-tenant SaaS platform with Java 21 + Spring Boot backend, React frontend, fine-grained consent capture, immutable audit trails, and real-time enforcement - achieve GDPR, CCPA, LGPD compliance'
        }
    };
    
    container.innerHTML = featured.map(repo => {
        const data = featuredData[repo.name] || {};
        const techStack = repo.language ? [repo.language] : [];

        // Private repos (dbsync, consentmp) should link to detail pages, not GitHub
        const isPrivateRepo = ['dbsync', 'consentmp'].includes(repo.name);
        const detailPageUrl = `projects/${repo.name}.html`;

        return `
            <div class="featured-card fade-in-up">
                <div class="featured-header">
                    <div>
                        <h3 class="featured-title">${repo.name}</h3>
                        <div class="featured-stats">
                            <span class="stat-item">⭐ ${repo.stargazers_count}</span>
                            <span class="stat-item">🔱 ${repo.forks_count}</span>
                            ${repo.open_issues_count > 0 ? `<span class="stat-item">📋 ${repo.open_issues_count} issues</span>` : ''}
                        </div>
                    </div>
                </div>
                <p class="featured-description">${repo.description || 'No description available'}</p>
                ${techStack.length > 0 ? `
                    <div class="featured-tech">
                        ${techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                ` : ''}
                ${data.impact ? `
                    <div class="featured-impact">
                        <div class="impact-label">Impact</div>
                        <div class="impact-text">${data.impact}</div>
                    </div>
                ` : ''}
                <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <a href="${detailPageUrl}" class="featured-link" style="flex: 1; text-align: center;">
                        Learn More →
                    </a>
                    ${!isPrivateRepo ? `
                        <a href="${repo.html_url}" target="_blank" class="featured-link" style="flex: 1; text-align: center; background: var(--card-bg); border: 1px solid var(--border-color);">
                            GitHub →
                        </a>
                    ` : `
                        <a href="#contact" class="featured-link" style="flex: 1; text-align: center; background: var(--card-bg); border: 1px solid var(--border-color);">
                            Contact for Access
                        </a>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function renderRepositories(repos) {
    const container = document.getElementById('repositories');
    const loading = document.getElementById('loading');
    
    if (!container) return;
    
    loading.classList.add('hidden');
    
    if (repos.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--text-secondary);">No repositories found</p>';
        return;
    }
    
    container.innerHTML = repos.map(repo => `
        <div class="repo-card" data-language="${repo.language || 'none'}">
            <div class="repo-header">
                <svg class="repo-icon" width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                </svg>
                <div>
                    <a href="${repo.html_url}" target="_blank" class="repo-title">${repo.name}</a>
                </div>
            </div>
            <p class="repo-description">${repo.description || 'No description available'}</p>
            <div class="repo-meta">
                ${repo.language ? `
                    <div class="repo-language">
                        <span class="language-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
                        <span>${repo.language}</span>
                    </div>
                ` : ''}
                <div class="repo-stats">
                    <span class="stat">⭐ ${repo.stargazers_count}</span>
                    <span class="stat">🔱 ${repo.forks_count}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Filter & Search Functions =====
function filterRepositories(filter) {
    currentFilter = filter;
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

    let filtered = allRepositories;

    // Apply language filter
    if (filter !== 'all') {
        filtered = filtered.filter(repo =>
            repo.language && repo.language.toLowerCase() === filter.toLowerCase()
        );
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(repo =>
            repo.name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm))
        );
    }

    renderRepositories(filtered);
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filterRepositories(currentFilter);
        }, 300);
    });
}

function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Apply filter
            const filter = tab.dataset.filter;
            filterRepositories(filter);
        });
    });
}

// ===== Scroll Animations =====
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.repo-card, .featured-card, .highlight-card').forEach(card => {
        observer.observe(card);
    });
}

// ===== Counter Animation =====
function setupCounters() {
    const counters = document.querySelectorAll('.highlight-number');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

// ===== Smooth Scroll =====
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Navbar Scroll Effect =====
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// ===== Initialize Application =====
async function init() {
    console.log('🚀 Initializing Developers Coffee Portfolio...');

    try {
        // Fetch repositories
        const repos = await fetchRepositories();
        console.log(`✅ Loaded ${repos.length} repositories`);

        // Render sections
        renderFeaturedProjects(repos);
        renderRepositories(repos);

        // Setup interactions
        setupSearch();
        setupFilters();
        setupSmoothScroll();
        setupNavbarScroll();
        setupCounters();

        // Delay scroll animations slightly for better UX
        setTimeout(setupScrollAnimations, 100);

        console.log('✅ Portfolio initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing portfolio:', error);

        // Show error message
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <p style="color: var(--warning-color);">
                    ⚠️ Failed to load repositories. Please refresh the page.
                </p>
            `;
        }
    }
}

// ===== Start Application =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
