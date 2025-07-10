document.addEventListener('DOMContentLoaded', () => {

    // --- Page Transition Logic & Smooth Scroll Fix ---
    const overlay = document.createElement('div');
    overlay.classList.add('page-transition-overlay');
    document.body.appendChild(overlay);
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const hamburger = document.querySelector('.hamburger');
                const navMenu = document.querySelector('.nav-menu');
                if (hamburger && hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
                return;
            }
            const isExternal = link.hostname !== window.location.hostname && link.hostname !== "";
            const opensInNewTab = link.target === '_blank';
            const isPdf = href && href.endsWith('.pdf');
            const isSpecialProtocol = href && (href.startsWith('mailto:') || href.startsWith('tel:'));
            if (!href || isExternal || opensInNewTab || isPdf || isSpecialProtocol) {
                return;
            }
            e.preventDefault();
            const destination = href;
            overlay.classList.add('is-active');
            setTimeout(() => {
                window.location.href = destination;
            }, 500);
        });
    });

    // --- Transparent Header on Scroll Logic ---
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero');
    if (header && heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { header.classList.add('header-scrolled'); } 
            else { header.classList.remove('header-scrolled'); }
        });
    }

    // --- Mobile Menu (Hamburger) Logic ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // --- Infinite Project Scroller Logic ---
    const scrollers = document.querySelectorAll('.project-scroller');
    if (scrollers.length > 0) {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            scrollers.forEach(scroller => addAnimation(scroller));
        }
    }
    function addAnimation(scroller) {
        if (scroller.getAttribute('data-animated')) {
            const scrollerContent = Array.from(scroller.children);
            scrollerContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute('aria-hidden', true);
                scroller.appendChild(duplicatedItem);
            });
        }
    }

    // --- Hero Slideshow Logic ---
    const slideshow = document.querySelector('.hero-slideshow');
    if (slideshow) {
        const slides = slideshow.querySelectorAll('li');
        if (slides.length > 0) {
            let currentSlide = 0;
            slides[0].classList.add('active');
            setInterval(() => {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 5000);
        }
    }

    // --- Typewriter Effect Logic ---
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const words = ["Residential.", "Commercial.", "Industrial.", "Renovations."];
        let wordIndex = 0, charIndex = 0, isDeleting = false;
        function typeEffect() {
            const currentWord = words[wordIndex];
            const currentChar = isDeleting ? currentWord.substring(0, charIndex - 1) : currentWord.substring(0, charIndex + 1);
            typingText.textContent = currentChar;
            if (!isDeleting && charIndex < currentWord.length) { charIndex++; setTimeout(typeEffect, 120); } 
            else if (isDeleting && charIndex > 0) { charIndex--; setTimeout(typeEffect, 80); } 
            else { isDeleting = !isDeleting; if (!isDeleting) { wordIndex = (wordIndex + 1) % words.length; } setTimeout(typeEffect, 1200); }
        }
        typeEffect();
    }
    
    // --- Dynamic Copyright Year ---
    const yearSpan = document.getElementById('year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- DYNAMIC CONTENT LOADER ---
    async function loadHomepageContent() {
        if (document.getElementById('welcome-title')) {
            try {
                const response = await fetch('/content/homepage.json');
                const data = await response.json();
                document.getElementById('welcome-title').textContent = data.welcome_title;
                document.getElementById('welcome-subheading').textContent = data.welcome_subheading;
                document.getElementById('welcome-text').innerHTML = marked.parse(data.welcome_text);
            } catch (error) {
                console.error("Could not load homepage content:", error);
            }
        }
    }
    
    async function loadAndFilterProperties() {
        const listingsContainer = document.getElementById('listings-container');
        const filterForm = document.getElementById('property-filters');
        if (!listingsContainer || !filterForm) return;

        function createPropertyCard(prop) {
            const priceFormatted = new Intl.NumberFormat('en-US', { style: 'decimal' }).format(prop.price);
            const statusClass = prop.status.toLowerCase().replace(/\s+/g, '-');
            const card = document.createElement('div');
            card.className = 'property-card';
            card.dataset.name = prop.title.toLowerCase();
            card.dataset.price = prop.price;
            card.dataset.location = prop.location_slug;
            card.dataset.delivery = statusClass === 'ready-to-move' ? 'ready' : 'off-plan';
            card.innerHTML = `<div class="property-card-image"><img src="${prop.image}" alt="${prop.title}"><span class="status-badge ${statusClass}">${prop.status}</span></div><div class="property-card-details"><h3>${prop.title}</h3><p class="location-spec"><ion-icon name="location-outline"></ion-icon> ${prop.location_name}</p><ul class="property-stats"><li><ion-icon name="bed-outline"></ion-icon> ${prop.beds} Beds</li><li><ion-icon name="water-outline"></ion-icon> ${prop.baths} Baths</li><li><ion-icon name="cube-outline"></ion-icon> ${prop.area} sqft</li></ul><p class="property-description">${marked.parse(prop.description || '')}</p><div class="price-and-cta"><div class="price">AED ${priceFormatted}</div><a href="#" class="btn property-btn">View Details</a></div></div>`;
            return card;
        }

        async function fetchProperties() {
            try {
                const response = await fetch('/content/properties.json');
                if (!response.ok) throw new Error('Network response failed');
                const allProperties = await response.json();
                
                listingsContainer.innerHTML = ''; 
                allProperties.forEach(prop => {
                    listingsContainer.appendChild(createPropertyCard(prop));
                });
            } catch (error) {
                listingsContainer.innerHTML = '<p>Error loading properties. Please check the content folder or try again later.</p>';
                console.error('Error fetching properties:', error);
            }
        }

        function filterProperties() {
            const searchInput = document.getElementById('filter-search');
            const priceInput = document.getElementById('filter-price');
            const locationInput = document.getElementById('filter-location');
            const deliveryInput = document.getElementById('filter-delivery');
            const propertyCards = listingsContainer.querySelectorAll('.property-card');
            const noResultsMessage = document.getElementById('no-results-message');
            
            const searchTerm = searchInput.value.toLowerCase().trim();
            const priceValue = priceInput.value;
            const locationValue = locationInput.value;
            const deliveryValue = deliveryInput.value;
            let [minPrice, maxPrice] = [0, Infinity];
            if (priceValue) { [minPrice, maxPrice] = priceValue.split('-').map(Number); }
            let visibleCount = 0;

            propertyCards.forEach(prop => {
                const propData = prop.dataset;
                const propPrice = Number(propData.price);
                const searchMatch = !searchTerm || propData.name.includes(searchTerm);
                const priceMatch = !priceValue || (propPrice >= minPrice && propPrice <= maxPrice);
                const locationMatch = !locationValue || propData.location === locationValue;
                const deliveryMatch = !deliveryValue || propData.delivery === deliveryValue;

                if (searchMatch && priceMatch && locationMatch && deliveryMatch) {
                    prop.style.display = 'flex';
                    visibleCount++;
                } else {
                    prop.style.display = 'none';
                }
            });
            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        filterForm.addEventListener('submit', (e) => { e.preventDefault(); filterProperties(); });
        filterForm.addEventListener('input', filterProperties);
        
        fetchProperties();
    }

    loadHomepageContent();
    loadAndFilterProperties();
});