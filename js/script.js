document.addEventListener('DOMContentLoaded', () => {

    // --- FIX FOR PASSWORD RESET & EMAIL CONFIRMATION ---
    // This looks for the special token in the URL and opens the login widget.
    if (window.location.hash.includes('invite_token=') || window.location.hash.includes('recovery_token=')) {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.open();
        }
    }

    // --- All other original functions (Page Transitions, Scrollers, etc.) ---
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

    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero');
    if (header && heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { header.classList.add('header-scrolled'); } 
            else { header.classList.remove('header-scrolled'); }
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

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
    
    const yearSpan = document.getElementById('year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- DYNAMIC CONTENT LOADER & FILTERING ---
    const listingsContainer = document.getElementById('js-listings-container');
    const filterForm = document.getElementById('js-property-filters');

    if (listingsContainer && filterForm) {
        let allPropertyData = [];

        function renderProperties(propertiesToRender) {
            const noResultsMessage = document.getElementById('js-no-results-message');
            listingsContainer.innerHTML = ''; // Clear previous listings or "loading" message

            if (propertiesToRender.length === 0) {
                noResultsMessage.style.display = 'block';
                return;
            }
            noResultsMessage.style.display = 'none';

            propertiesToRender.forEach(prop => {
                const priceFormatted = new Intl.NumberFormat('en-US', { style: 'decimal' }).format(prop.price);
                const statusClass = prop.status.toLowerCase().replace(/\s+/g, '-');
                const card = document.createElement('div');
                card.className = 'property-card';
                card.innerHTML = `<div class="property-card-image"><img src="${prop.image}" alt="${prop.title}"><span class="status-badge ${statusClass}">${prop.status}</span></div><div class="property-card-details"><h3>${prop.title}</h3><p class="location-spec"><ion-icon name="location-outline"></ion-icon> ${prop.location_name}</p><ul class="property-stats"><li><ion-icon name="bed-outline"></ion-icon> ${prop.beds} Beds</li><li><ion-icon name="water-outline"></ion-icon> ${prop.baths} Baths</li><li><ion-icon name="cube-outline"></ion-icon> ${prop.area} sqft</li></ul><p class="property-description">${marked.parse(prop.description || '')}</p><div class="price-and-cta"><div class="price">AED ${priceFormatted}</div><a href="#" class="btn property-btn">View Details</a></div></div>`;
                listingsContainer.appendChild(card);
            });
        }

        function filterProperties() {
            const searchInput = document.getElementById('js-filter-search');
            const priceInput = document.getElementById('js-filter-price');
            const locationInput = document.getElementById('js-filter-location');
            const deliveryInput = document.getElementById('js-filter-delivery');

            const searchTerm = searchInput.value.toLowerCase().trim();
            const priceValue = priceInput.value;
            const locationValue = locationInput.value;
            const deliveryValue = deliveryInput.value;
            
            let [minPrice, maxPrice] = [0, Infinity];
            if (priceValue) { [minPrice, maxPrice] = priceValue.split('-').map(Number); }
            
            const filtered = allPropertyData.filter(prop => {
                const searchMatch = !searchTerm || prop.title.toLowerCase().includes(searchTerm);
                const priceMatch = !priceValue || (prop.price >= minPrice && prop.price <= maxPrice);
                const locationMatch = !locationValue || prop.location_slug === locationValue;
                const deliveryMatch = !deliveryValue || (prop.status.toLowerCase().replace(/\s+/g, '-') === (deliveryValue === 'ready' ? 'ready-to-move' : 'off-plan'));

                return searchMatch && priceMatch && locationMatch && deliveryMatch;
            });

            renderProperties(filtered);
        }

        async function fetchProperties() {
            try {
                // Netlify CMS generates a single JSON file from the folder collection.
                // It's usually named after the collection.
                const response = await fetch('/content/properties.json');
                if (!response.ok) throw new Error(`Network response failed with status: ${response.status}`);
                allPropertyData = await response.json();
                renderProperties(allPropertyData);
            } catch (error) {
                listingsContainer.innerHTML = '<p>Error loading properties. Please go to the admin panel, create a property, and publish it.</p>';
                console.error('Error fetching properties:', error);
            }
        }

        filterForm.addEventListener('submit', (e) => { e.preventDefault(); filterProperties(); });
        filterForm.addEventListener('input', filterProperties);
        
        fetchProperties();
    }
});