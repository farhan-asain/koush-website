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
            
            // Allow property detail links to navigate normally
            if (href && href.includes('property-details.html')) {
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

    // --- MASTER FUNCTION TO INITIALIZE PAGE-SPECIFIC LOGIC ---
    function initPageSpecificLogic() {
        const pathname = window.location.pathname;

        if (pathname.includes('/buy.html')) {
            initBuyPageFilters();
        } else if (pathname.includes('/property-details.html')) {
            initPropertyDetailPage();
        }
    }

    // --- BUY PAGE: FILTER LOGIC ---
    function initBuyPageFilters() {
        const filterForm = document.getElementById('js-property-filters');
        if (!filterForm) return;

        const searchInput = document.getElementById('js-filter-search');
        const priceInput = document.getElementById('js-filter-price');
        const locationInput = document.getElementById('js-filter-location');
        const statusInput = document.getElementById('js-filter-status');
        const propertyGrid = document.getElementById('js-property-grid');
        const allProperties = Array.from(propertyGrid.querySelectorAll('.property-grid-card'));
        const noResultsMessage = document.getElementById('js-no-results-message');

        function filterProperties() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const priceValue = priceInput.value;
            const locationValue = locationInput.value;
            const statusValue = statusInput.value;

            let [minPrice, maxPrice] = [0, Infinity];
            if (priceValue) {
                [minPrice, maxPrice] = priceValue.split('-').map(Number);
            }

            let visibleCount = 0;
            allProperties.forEach(prop => {
                const propData = prop.dataset;
                const propPrice = Number(propData.price);

                const searchMatch = !searchTerm || propData.name.includes(searchTerm);
                const priceMatch = !priceValue || (propPrice >= minPrice && propPrice <= maxPrice);
                const locationMatch = !locationValue || propData.location === locationValue;
                const statusMatch = !statusValue || propData.status === statusValue;

                if (searchMatch && priceMatch && locationMatch && statusMatch) {
                    prop.style.display = 'block';
                    visibleCount++;
                } else {
                    prop.style.display = 'none';
                }
            });

            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            filterProperties();
        });
        
        searchInput.addEventListener('input', filterProperties);
        priceInput.addEventListener('change', filterProperties);
        locationInput.addEventListener('change', filterProperties);
        statusInput.addEventListener('change', filterProperties);
    }

    // --- PROPERTY DETAIL PAGE: DYNAMIC CONTENT LOGIC ---
    function initPropertyDetailPage() {
        const container = document.getElementById('property-detail-container');
        if (!container) return;
        
        const propertyDatabase = {
            'the-one': { title: 'THE ONE', location: 'Bel Air, LA', status: 'For Investment', price: 690000, image: 'assets/images/waterfront_villa.jpg', gallery: ['assets/images/detail-thumb1.jpg', 'assets/images/detail-thumb2.jpg'], beds: 6, baths: 4, area: 2780, overview: `Introducing The One, a striking 6-bedroom residence designed for both luxury living and smart investment. Located in the prestigious neighborhood of Bel Air, Los Angeles, this 2,780 sqft home features bold modern architecture, open-plan interiors, and refined finishes. With 4 bathrooms, spacious living areas, and curated landscaping, it's a statement of comfort, style, and long-term value.`, features: ['6 Bedrooms & 4 Bathrooms', 'Bold Contemporary Design', 'Professionally Landscaped Garden', 'Spacious Driveway & Garage', 'Investment-Ready Property'], amenities: ['Air Conditioner', 'Washing Machine', 'Internet', 'Water Heater'] },
            'billionaire-mansion': { title: 'Billionaire Mansion', location: 'Bel Air, LA', status: 'For Sale', price: 500000, image: 'assets/images/downtown_apartment.jpg', gallery: [], beds: 5, baths: 4, area: 3800, overview: 'A magnificent estate that defines modern luxury, offering panoramic city views and unparalleled privacy.', features: ['Infinity Pool', 'Home Theater', '12-Car Garage'], amenities: ['Security System', 'Private Gym'] },
            'beverly-house': { title: 'The Beverly House', location: 'Beverly Hills, CA', status: 'For Rent', price: 290000, image: 'assets/images/coastal_tower.jpg', gallery: [], beds: 3, baths: 2, area: 1500, overview: 'Historic and iconic, The Beverly House offers a unique blend of classic architecture and modern amenities in the heart of Beverly Hills.', features: ['Grand Ballroom', 'Two-Story Library', 'Tennis Court'], amenities: ['Swimming Pool', 'Manicured Gardens'] },
            'palazzo-di-amore': { title: 'Palazzo di Amore', location: 'Beverly Hills, CA', status: 'For Rent', price: 490000, image: 'assets/images/modern_villa_construction.jpg', gallery: [], beds: 4, baths: 2, area: 2100, overview: 'A stunning Tuscan-style villa that embodies the essence of romance and luxury, featuring vineyards and breathtaking city-to-ocean views.', features: ['Private Vineyard', 'Entertainment Complex', 'Waterfall'], amenities: ['Spa Facility', 'Bowling Alley'] },
            'the-manor': { title: 'The Manor', location: 'Holmby Hills, LA', status: 'For Investment', price: 482000, image: 'assets/images/luxury_apartment_complex.jpg', gallery: [], beds: 7, baths: 5, area: 3100, overview: 'An opulent French chateau-style mansion, The Manor is a landmark of luxury and elegance in the exclusive Holmby Hills.', features: ['Formal Gardens', 'Beauty Salon', 'Screening Room'], amenities: ['Swimming Pool', 'Tennis Court'] },
            'the-penthouse': { title: 'The Penthouse', location: 'Upper East Side, NY', status: 'For Sale', price: 298000, image: 'assets/images/corporate_office_interior.jpg', gallery: [], beds: 2, baths: 2, area: 2200, overview: 'A sophisticated penthouse offering unparalleled views of Central Park and the Manhattan skyline, with bespoke interiors and state-of-the-art facilities.', features: ['360-Degree Views', 'Private Elevator', 'Rooftop Terrace'], amenities: ['Concierge Service', 'Fitness Center'] }
        };

        const params = new URLSearchParams(window.location.search);
        const propertySlug = params.get('property');
        const property = propertyDatabase[propertySlug];

        if (property) {
            document.title = `${property.title} | Koush Real Estate`;
            const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price);
            
            container.innerHTML = `
            <section class="property-detail-gallery section">
                <div class="container property-gallery">
                    <div class="main-image" id="main-gallery-image"><img src="${property.image}" alt="${property.title}"></div>
                    <div class="property-gallery-thumbnails">
                        <img src="${property.image}" alt="Thumbnail 1" class="active">
                        ${property.gallery.map(img => `<img src="${img}" alt="Thumbnail">`).join('')}
                    </div>
                </div>
            </section>
            <section class="section" style="padding-top: 0;">
                <div class="container property-detail-layout">
                    <div class="property-detail-main">
                        <h1>${property.title.toUpperCase()}</h1>
                        <p class="location-spec"><ion-icon name="location-outline"></ion-icon> ${property.location}</p>
                        <ul class="property-stats grid-card-stats">
                            <li><ion-icon name="bed-outline"></ion-icon> ${property.beds} Beds</li>
                            <li><ion-icon name="water-outline"></ion-icon> ${property.baths} Baths</li>
                            <li><ion-icon name="cube-outline"></ion-icon> ${property.area} sqft</li>
                        </ul>
                        <div class="detail-section">
                            <h2>Overview</h2>
                            <div class="property-description"><p>${property.overview}</p></div>
                        </div>
                        <div class="detail-section">
                            <h2>Features</h2>
                            <ul class="features-list">
                                ${property.features.map(f => `<li><ion-icon name="checkmark-circle-outline"></ion-icon> ${f}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="detail-section">
                            <h2>Amenities</h2>
                            <div class="amenities-list">
                                ${property.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
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
            container.innerHTML = `<div class="container section"><h1 class="page-title">Property Not Found</h1><p class="page-subtitle">The property you are looking for does not exist.</p></div>`;
        }
    }

    initPageSpecificLogic();
});