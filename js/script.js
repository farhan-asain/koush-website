document.addEventListener('DOMContentLoaded', () => {

    // --- FIX FOR PASSWORD RESET & EMAIL CONFIRMATION ---
    if (window.location.hash.includes('invite_token=') || window.location.hash.includes('recovery_token=')) {
        if (window.netlifyIdentity) {
            window.netlifyIdentity.open();
        }
    }

    // --- All Original, Working Functions (Transitions, Scrollers, etc.) ---
    const overlay = document.createElement('div');
    overlay.classList.add('page-transition-overlay');
    document.body.appendChild(overlay);
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('#') || href.includes('property-details.html'))) {
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

    // --- MASTER FUNCTION TO INITIALIZE PAGE-SPECIFIC LOGIC ---
    function initDynamicContent() {
        const pathname = window.location.pathname;

        if (pathname.includes('/buy.html')) {
            loadAndFilterProperties();
        } else if (pathname.includes('/property-details.html')) {
            loadPropertyDetails();
        } else if (pathname === '/' || pathname.includes('/index.html')) {
            loadHomepageContent();
        }
    }

    // --- SHARED FUNCTION TO FETCH ALL PROPERTIES ---
    async function fetchAllProperties() {
        try {
            // This is the file that the admin panel will create and update
            const response = await fetch('/_data/properties.json');
            if (!response.ok) throw new Error('Could not fetch properties.json');
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching properties:', error);
            return [];
        }
    }

    // --- LOGIC FOR HOMEPAGE ---
    async function loadHomepageContent() {
        if (document.getElementById('welcome-title')) {
            try {
                const response = await fetch('/_data/homepage.json');
                if (!response.ok) return;
                const data = await response.json();
                if(data.welcome_title) document.getElementById('welcome-title').textContent = data.welcome_title;
                if(data.welcome_subheading) document.getElementById('welcome-subheading').textContent = data.welcome_subheading;
                if(data.welcome_text) document.getElementById('welcome-text').innerHTML = data.welcome_text;
            } catch (error) {
                console.log("Homepage content not found, using default text.");
            }
        }
    }

    // --- LOGIC FOR BUY PAGE ---
    async function loadAndFilterProperties() {
        const gridContainer = document.getElementById('js-property-grid');
        const filterForm = document.getElementById('js-property-filters');
        if (!gridContainer || !filterForm) return;

        const allProperties = await fetchAllProperties();

        function renderProperties(propertiesToRender) {
            const noResultsMessage = document.getElementById('js-no-results-message');
            gridContainer.innerHTML = ''; 

            if (propertiesToRender.length === 0) {
                 if (allProperties.length > 0) {
                     noResultsMessage.style.display = 'block';
                 } else {
                     gridContainer.innerHTML = '<p>No properties have been published yet. Please add one in the admin panel.</p>';
                 }
                 return;
            }
            noResultsMessage.style.display = 'none';

            propertiesToRender.forEach(prop => {
                const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(prop.price);
                const cardLink = document.createElement('a');
                cardLink.href = `/property-details.html?property=${prop.slug}`;
                cardLink.className = 'property-grid-card';
                cardLink.dataset.name = prop.title.toLowerCase();
                cardLink.dataset.price = prop.price;
                cardLink.dataset.location = prop.location_name;
                cardLink.dataset.status = prop.status;
                cardLink.innerHTML = `<div class="grid-card-image"><img src="${prop.image}" alt="${prop.title}"><span class="status-badge">${prop.status}</span></div><div class="grid-card-info"><p class="location-spec"><ion-icon name="location-outline"></ion-icon> ${prop.location_name}</p><h3>${prop.title}</h3><ul class="grid-card-stats"><li><ion-icon name="bed-outline"></ion-icon> ${prop.beds}</li><li><ion-icon name="water-outline"></ion-icon> ${prop.baths}</li><li><ion-icon name="cube-outline"></ion-icon> ${prop.area} sqft</li></ul><div class="grid-card-price">${priceFormatted}</div></div>`;
                gridContainer.appendChild(cardLink);
            });
        }

        function filterProperties() {
            const searchInput = document.getElementById('js-filter-search');
            const priceInput = document.getElementById('js-filter-price');
            const locationInput = document.getElementById('js-filter-location');
            const statusInput = document.getElementById('js-filter-status');

            const searchTerm = searchInput.value.toLowerCase().trim();
            const priceValue = priceInput.value;
            const locationValue = locationInput.value;
            const statusValue = statusInput.value;
            
            let [minPrice, maxPrice] = [0, Infinity];
            if (priceValue) { [minPrice, maxPrice] = priceValue.split('-').map(Number); }
            
            const filtered = allProperties.filter(prop => {
                const searchMatch = !searchTerm || prop.title.toLowerCase().includes(searchTerm);
                const priceMatch = !priceValue || (prop.price >= minPrice && prop.price <= maxPrice);
                const locationMatch = !locationValue || prop.location_name === locationValue;
                const statusMatch = !statusValue || prop.status === statusValue;

                return searchMatch && priceMatch && locationMatch && statusMatch;
            });

            renderProperties(filtered);
        }

        filterForm.addEventListener('input', filterProperties);
        renderProperties(allProperties);
    }

    // --- LOGIC FOR PROPERTY DETAIL PAGE ---
    async function loadPropertyDetails() {
        const container = document.getElementById('property-detail-container');
        if (!container) return;
        
        const params = new URLSearchParams(window.location.search);
        const propertySlug = params.get('property');
        
        if (!propertySlug) {
            container.innerHTML = `<div class="container section"><h1 class="page-title">Property Not Found</h1><p class="page-subtitle">No property specified in the URL.</p></div>`;
            return;
        }

        const allProperties = await fetchAllProperties();
        const property = allProperties.find(p => p.slug === propertySlug);

        if (property) {
            document.title = `${property.title} | Koush Real Estate`;
            const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price);
            
            container.innerHTML = `
            <section class="property-detail-gallery section">
                <div class="container property-gallery">
                    <div class="main-image" id="main-gallery-image"><img src="${property.image}" alt="${property.title}"></div>
                    <div class="property-gallery-thumbnails">
                        <img src="${property.image}" alt="Thumbnail 1" class="active">
                        ${(property.gallery || []).map(item => `<img src="${item.image}" alt="Thumbnail">`).join('')}
                    </div>
                </div>
            </section>
            <section class="section" style="padding-top: 0;">
                <div class="container property-detail-layout">
                    <div class="property-detail-main">
                        <h1>${property.title.toUpperCase()}</h1>
                        <p class="location-spec"><ion-icon name="location-outline"></ion-icon> ${property.location_name}</p>
                        <ul class="property-stats grid-card-stats">
                            <li><ion-icon name="bed-outline"></ion-icon> ${property.beds} Beds</li>
                            <li><ion-icon name="water-outline"></ion-icon> ${property.baths} Baths</li>
                            <li><ion-icon name="cube-outline"></ion-icon> ${property.area} sqft</li>
                        </ul>
                        <div class="detail-section">
                            <h2>Overview</h2>
                            <div class="property-description">${marked.parse(property.overview || '')}</div>
                        </div>
                        <div class="detail-section">
                            <h2>Features</h2>
                            <ul class="features-list">
                                ${(property.features || []).map(f => `<li><ion-icon name="checkmark-circle-outline"></ion-icon> ${f.feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="detail-section">
                            <h2>Amenities</h2>
                            <div class="amenities-list">
                                ${(property.amenities || []).map(a => `<span class="amenity-tag">${a.amenity}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <aside class="property-detail-sidebar">
                        <div class="sidebar-widget">
                            <h3 class="sidebar-widget-title">Property ${property.status}</h3>
                            <div class="sidebar-widget-price">${priceFormatted}</div>
                            <p class="sidebar-widget-info">Get in touch for more about this property.</p>
                            <div class="sidebar-agents">
                                <div class="agent-photos">
                                    <img src="assets/images/abubaker.webp" alt="Agent 1">
                                    <img src="assets/images/mohamed.webp" alt="Agent 2">
                                    <img src="assets/images/mubarak.webp" alt="Agent 3">
                                </div>
                                <div class="agent-info">10+ Featured Agents<span>⭐⭐⭐⭐⭐ 5/5</span></div>
                            </div>
                            <a href="contact.html" class="btn">Request Info</a>
                        </div>
                    </aside>
                </div>
            </section>
            `;

            const galleryThumbnails = container.querySelectorAll('.property-gallery-thumbnails img');
            const mainImage = container.querySelector('#main-gallery-image img');
            if (galleryThumbnails.length > 0 && mainImage) {
                galleryThumbnails.forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        mainImage.src = thumb.src;
                        galleryThumbnails.forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    });
                });
            }
        } else {
            container.innerHTML = `<div class="container section"><h1 class="page-title">Property Not Found</h1><p class="page-subtitle">The property you are looking for does not exist or may not be published yet.</p></div>`;
        }
    }

    // Run the master initializer function
    initDynamicContent();
});