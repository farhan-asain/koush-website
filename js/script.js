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
                // ... logic for same-page links ...
                return;
            }
            // Let property detail links navigate without a fade transition
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

    // --- All other original functions (Header, Scroller, etc.) ---
    // ... (These are unchanged)

    // --- NEW: PROPERTY DATABASE AND DYNAMIC PAGE LOGIC ---
    const propertyDatabase = {
        'the-one': {
            title: 'THE ONE',
            location: 'Bel Air, LA',
            status: 'For Investment',
            price: 690000,
            image: 'assets/images/waterfront_villa.jpg',
            gallery: ['assets/images/detail-thumb1.jpg', 'assets/images/detail-thumb2.jpg'],
            beds: 6,
            baths: 4,
            area: 2780,
            overview: `Introducing The One, a striking 6-bedroom residence designed for both luxury living and smart investment. Located in the prestigious neighborhood of Bel Air, Los Angeles, this 2,780 sqft home features bold modern architecture, open-plan interiors, and refined finishes. With 4 bathrooms, spacious living areas, and curated landscaping, it's a statement of comfort, style, and long-term value.`,
            features: ['6 Bedrooms & 4 Bathrooms', 'Bold Contemporary Design', 'Professionally Landscaped Garden', 'Spacious Driveway & Garage', 'Investment-Ready Property'],
            amenities: ['Air Conditioner', 'Washing Machine', 'Internet', 'Water Heater']
        },
        'billionaire-mansion': {
            title: 'Billionaire Mansion',
            location: 'Bel Air, LA',
            status: 'For Sale',
            price: 500000,
            image: 'assets/images/downtown_apartment.jpg',
            gallery: [],
            beds: 5,
            baths: 4,
            area: 3800,
            overview: 'A magnificent estate that defines modern luxury, offering panoramic city views and unparalleled privacy.',
            features: ['Infinity Pool', 'Home Theater', '12-Car Garage'],
            amenities: ['Security System', 'Private Gym']
        },
        'beverly-house': {
            title: 'The Beverly House',
            location: 'Beverly Hills, CA',
            status: 'For Rent',
            price: 290000,
            image: 'assets/images/coastal_tower.jpg',
            gallery: [],
            beds: 3,
            baths: 2,
            area: 1500,
            overview: 'Historic and iconic, The Beverly House offers a unique blend of classic architecture and modern amenities in the heart of Beverly Hills.',
            features: ['Grand Ballroom', 'Two-Story Library', 'Tennis Court'],
            amenities: ['Swimming Pool', 'Manicured Gardens']
        },
        'palazzo-di-amore': {
            title: 'Palazzo di Amore',
            location: 'Beverly Hills, CA',
            status: 'For Rent',
            price: 490000,
            image: 'assets/images/modern_villa_construction.jpg',
            gallery: [],
            beds: 4,
            baths: 2,
            area: 2100,
            overview: 'A stunning Tuscan-style villa that embodies the essence of romance and luxury, featuring vineyards and breathtaking city-to-ocean views.',
            features: ['Private Vineyard', 'Entertainment Complex', 'Waterfall'],
            amenities: ['Spa Facility', 'Bowling Alley']
        },
        'the-manor': {
            title: 'The Manor',
            location: 'Holmby Hills, LA',
            status: 'For Investment',
            price: 482000,
            image: 'assets/images/luxury_apartment_complex.jpg',
            gallery: [],
            beds: 7,
            baths: 5,
            area: 3100,
            overview: 'An opulent French chateau-style mansion, The Manor is a landmark of luxury and elegance in the exclusive Holmby Hills.',
            features: ['Formal Gardens', 'Beauty Salon', 'Screening Room'],
            amenities: ['Swimming Pool', 'Tennis Court']
        },
        'the-penthouse': {
            title: 'The Penthouse',
            location: 'Upper East Side, NY',
            status: 'For Sale',
            price: 298000,
            image: 'assets/images/corporate_office_interior.jpg',
            gallery: [],
            beds: 2,
            baths: 2,
            area: 2200,
            overview: 'A sophisticated penthouse offering unparalleled views of Central Park and the Manhattan skyline, with bespoke interiors and state-of-the-art facilities.',
            features: ['360-Degree Views', 'Private Elevator', 'Rooftop Terrace'],
            amenities: ['Concierge Service', 'Fitness Center']
        }
    };

    function initDynamicPages() {
        const pathname = window.location.pathname;

        if (pathname.includes('/buy.html')) {
            const filterForm = document.getElementById('js-property-filters');
            if (filterForm) {
                // ... (Static filtering logic from the previous correct version)
            }
        } else if (pathname.includes('/property-details.html')) {
            const container = document.getElementById('property-detail-container');
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

                const thumbnails = container.querySelectorAll('.property-gallery-thumbnails img');
                const mainImage = container.querySelector('#main-gallery-image img');
                thumbnails.forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        mainImage.src = thumb.src;
                        thumbnails.forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    });
                });
            } else {
                container.innerHTML = `<div class="container section"><h1 class="page-title">Property Not Found</h1><p class="page-subtitle">The property you are looking for does not exist.</p></div>`;
            }
        }
    }

    initDynamicPages();
});