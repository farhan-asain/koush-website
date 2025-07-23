document.addEventListener('DOMContentLoaded', () => {

    // --- All Original, Working Functions (Transitions, Scrollers, etc.) ---
    // ... (This part is unchanged) ...

    // --- DYNAMIC CONTENT LOADER & FILTERING ---
    // New combined function to handle all dynamic content
    function initDynamicContent() {
        const pathname = window.location.pathname;

        if (pathname.includes('/buy.html')) {
            loadAndFilterProperties();
        } else if (pathname.includes('/property-details.html')) {
            loadPropertyDetails();
        }
    }

    async function fetchAllProperties() {
        try {
            const response = await fetch('/_data/properties.json');
            if (!response.ok) throw new Error('Could not fetch properties.json');
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching properties:', error);
            return []; // Return empty array on error
        }
    }

    // --- Logic for buy.html ---
    async function loadAndFilterProperties() {
        const gridContainer = document.getElementById('js-property-grid');
        if (!gridContainer) return;

        const allProperties = await fetchAllProperties();

        if (allProperties.length === 0) {
            gridContainer.innerHTML = '<p>No properties have been published yet. Please add one in the admin panel.</p>';
            return;
        }

        gridContainer.innerHTML = ''; // Clear loading message
        allProperties.forEach(prop => {
            const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(prop.price);
            const cardLink = document.createElement('a');
            cardLink.href = `/property-details.html?slug=${prop.slug}`;
            cardLink.className = 'property-grid-card';
            cardLink.innerHTML = `
                <div class="grid-card-image">
                    <img src="${prop.image}" alt="${prop.title}">
                    <span class="status-badge">${prop.status}</span>
                </div>
                <div class="grid-card-info">
                    <p class="location-spec"><ion-icon name="location-outline"></ion-icon> ${prop.location_name}</p>
                    <h3>${prop.title}</h3>
                    <ul class="grid-card-stats">
                        <li><ion-icon name="bed-outline"></ion-icon> ${prop.beds}</li>
                        <li><ion-icon name="water-outline"></ion-icon> ${prop.baths}</li>
                        <li><ion-icon name="cube-outline"></ion-icon> ${prop.area} sqft</li>
                    </ul>
                    <div class="grid-card-price">${priceFormatted}</div>
                </div>
            `;
            gridContainer.appendChild(cardLink);
        });
    }

    // --- Logic for property-details.html ---
    async function loadPropertyDetails() {
        const container = document.getElementById('property-detail-container');
        if (!container) return;
        
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        if (!slug) {
            container.innerHTML = '<div class="container"><p>Property not found. Please check the URL.</p></div>';
            return;
        }

        const allProperties = await fetchAllProperties();
        const property = allProperties.find(p => p.slug === slug);

        if (!property) {
            container.innerHTML = '<div class="container"><p>Property not found. Please check the URL.</p></div>';
            return;
        }
        
        document.title = `${property.title} | Koush`;
        container.classList.remove('property-detail-loading');
        
        const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price);

        container.innerHTML = `
            <section class="property-detail-gallery section">
                <div class="container property-gallery">
                    <div class="main-image" id="main-gallery-image">
                        <img src="${property.image}" alt="${property.title}">
                    </div>
                    <div class="property-gallery-thumbnails">
                        <img src="${property.image}" alt="Thumbnail 1" class="active">
                        ${(property.gallery || []).map(item => `<img src="${item.image}" alt="Thumbnail">`).join('')}
                    </div>
                </div>
            </section>
            <section class="section">
                <div class="container property-detail-layout">
                    <div class="property-detail-main">
                        <h1>${property.title}</h1>
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
                                ${(property.features || []).map(item => `<li><ion-icon name="checkmark-circle-outline"></ion-icon> ${item.feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="detail-section">
                            <h2>Amenities</h2>
                            <div class="amenities-list">
                                ${(property.amenities || []).map(item => `<span class="amenity-tag">${item.amenity}</span>`).join('')}
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
                                    <!-- Add your agent photos here or leave as placeholders -->
                                    <img src="assets/images/agent1.jpg" alt="Agent 1">
                                    <img src="assets/images/agent2.jpg" alt="Agent 2">
                                    <img src="assets/images/agent3.jpg" alt="Agent 3">
                                </div>
                                <div class="agent-info">
                                    10+ Featured Agents
                                    <span>⭐⭐⭐⭐⭐ 5/5</span>
                                </div>
                            </div>
                            <a href="contact.html" class="btn">Request Info</a>
                        </div>
                    </aside>
                </div>
            </section>
        `;
        
        // Add click event for gallery thumbnails
        const thumbnails = container.querySelectorAll('.property-gallery-thumbnails img');
        const mainImage = container.querySelector('#main-gallery-image img');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                mainImage.src = thumb.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }

    // Run the master function on page load
    initDynamicContent();
});