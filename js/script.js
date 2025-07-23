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

    // --- STATIC PROPERTY FILTERING LOGIC ---
    const filterForm = document.getElementById('js-property-filters');
    if (filterForm) {
        const searchInput = document.getElementById('js-filter-search');
        const priceInput = document.getElementById('js-filter-price');
        const locationInput = document.getElementById('js-filter-location');
        const statusInput = document.getElementById('js-filter-status');
        const propertyGrid = document.getElementById('js-property-grid');
        const allProperties = Array.from(propertyGrid.children);
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

    // --- LOGIC FOR PROPERTY DETAIL PAGE GALLERY ---
    const galleryThumbnails = document.querySelectorAll('.property-gallery-thumbnails img');
    const mainGalleryImage = document.querySelector('#main-gallery-image img');
    
    if (galleryThumbnails.length > 0 && mainGalleryImage) {
        galleryThumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                mainGalleryImage.src = thumb.src;
                galleryThumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }
});