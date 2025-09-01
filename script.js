// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .metric, .component');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Performance metrics animation
function animateMetrics() {
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach(metric => {
        const target = parseInt(metric.textContent.replace(/[^\d]/g, ''));
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            metric.textContent = Math.floor(current) + (metric.textContent.includes('%') ? '%' : metric.textContent.includes('x') ? 'x' : metric.textContent.includes('TB') ? 'TB+' : '');
        }, 20);
    });
}

// Trigger metrics animation when performance section is in view
const performanceSection = document.querySelector('.performance');
if (performanceSection) {
    const performanceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateMetrics();
                performanceObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    performanceObserver.observe(performanceSection);
}

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Cache diagram hover effects
document.addEventListener('DOMContentLoaded', () => {
    const diagramLayers = document.querySelectorAll('.cache-diagram > div');
    diagramLayers.forEach(layer => {
        layer.addEventListener('mouseenter', () => {
            layer.style.transform = 'scale(1.05)';
            layer.style.transition = 'transform 0.3s ease';
        });
        layer.addEventListener('mouseleave', () => {
            layer.style.transform = 'scale(1)';
        });
    });
});

// Contact button ripple effect
document.querySelectorAll('.contact-button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = (e.offsetX - 10) + 'px';
        ripple.style.top = (e.offsetY - 10) + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    .contact-button {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Load dynamic features from API
async function loadFeatures() {
    try {
        const response = await fetch('/api/features');
        const features = await response.json();

        const featuresGrid = document.querySelector('.features-grid');
        if (featuresGrid && features.length > 0) {
            featuresGrid.innerHTML = features.map(feature => `
                <div class="feature-card">
                    <div class="feature-icon">${feature.icon}</div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.log('Using static features (API not available)');
    }
}

// Load performance data from API
async function loadPerformanceData() {
    try {
        const response = await fetch('/api/performance');
        const data = await response.json();

        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length > 0) {
            metrics[0].textContent = data.query_response;
            metrics[1].textContent = data.cache_hit_rate;
            metrics[2].textContent = data.latency_reduction;
            metrics[3].textContent = data.data_processed;
        }
    } catch (error) {
        console.log('Using static performance data (API not available)');
    }
}

// Handle contact form submission
async function handleContactSubmission(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoading = submitButton.querySelector('.button-loading');
    const formMessage = document.getElementById('form-message');

    // Show loading state
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'inline';
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';

    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        message: formData.get('message')
    };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        const result = await response.json();

        // Hide loading state
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoading.style.display = 'none';

        // Show message
        formMessage.style.display = 'block';
        formMessage.textContent = result.message;

        if (result.success) {
            formMessage.classList.add('success');
            e.target.reset();
        } else {
            formMessage.classList.add('error');
        }

    } catch (error) {
        console.error('Contact form error:', error);

        // Hide loading state
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoading.style.display = 'none';

        // Show error message
        formMessage.style.display = 'block';
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Network error. Please check your connection and try again.';
    }
}

// Demo request modal (placeholder)
document.querySelector('a[href="#demo"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Demo request feature coming soon! Please contact us directly for now.');
});

// Handle newsletter subscription
async function handleNewsletterSubmission(e) {
    e.preventDefault();

    const newsletterBtn = e.target.querySelector('.newsletter-btn');
    const btnText = newsletterBtn.querySelector('.btn-text');
    const btnLoading = newsletterBtn.querySelector('.btn-loading');
    const newsletterMessage = document.getElementById('newsletter-message');
    const emailInput = document.getElementById('newsletter-email');
    const consentCheckbox = document.getElementById('consent');

    // Show loading state
    newsletterBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    newsletterMessage.style.display = 'none';
    newsletterMessage.className = 'newsletter-message';

    const email = emailInput.value.trim();

    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
        newsletterBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        newsletterMessage.style.display = 'block';
        newsletterMessage.className = 'newsletter-message error';
        newsletterMessage.textContent = 'Please enter a valid email address.';
        return;
    }

    // Check consent
    if (!consentCheckbox.checked) {
        newsletterBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        newsletterMessage.style.display = 'block';
        newsletterMessage.className = 'newsletter-message error';
        newsletterMessage.textContent = 'Please agree to receive updates.';
        return;
    }

    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();

        // Hide loading state
        newsletterBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';

        // Show message
        newsletterMessage.style.display = 'block';
        newsletterMessage.textContent = result.message;

        if (result.success) {
            newsletterMessage.className = 'newsletter-message success';
            e.target.reset();
        } else {
            newsletterMessage.className = 'newsletter-message error';
        }

    } catch (error) {
        console.error('Newsletter error:', error);

        // Hide loading state
        newsletterBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';

        // Show error message
        newsletterMessage.style.display = 'block';
        newsletterMessage.className = 'newsletter-message error';
        newsletterMessage.textContent = 'Network error. Please check your connection and try again.';
    }
}

// Dynamic spots counter with urgency
function updateSpotsCounter() {
    const spotsElement = document.getElementById('spots-left');
    if (!spotsElement) return;

    // Simulate decreasing spots (in real app, this would come from server)
    let currentSpots = parseInt(spotsElement.textContent) || 67;

    // Decrease spots occasionally to create urgency
    if (Math.random() < 0.3) { // 30% chance every few seconds
        currentSpots = Math.max(33, currentSpots - Math.floor(Math.random() * 3) - 1);
        spotsElement.textContent = currentSpots;
    }

    // Add urgency styling when spots are low
    if (currentSpots <= 50) {
        spotsElement.style.color = '#ff4757';
        spotsElement.style.fontWeight = '900';
        spotsElement.style.fontSize = '1.2rem';
    }
}

// Countdown timer for urgency
function startUrgencyTimer() {
    setInterval(updateSpotsCounter, 8000); // Update every 8 seconds
}

// Initialize dynamic content loading
document.addEventListener('DOMContentLoaded', () => {
    loadFeatures();
    loadPerformanceData();
    startUrgencyTimer();

    // Add contact form if it exists
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }

    // Add newsletter form if it exists
    const newsletterForm = document.querySelector('#newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }
});
