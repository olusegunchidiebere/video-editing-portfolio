document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation on Scroll
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuIcon = menuBtn.querySelector('i');

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-times');
        } else {
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        });
    });

    // 3. Scroll Reveal Animations & Progress Bars
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // If it's the about section with progress bars, animate them
                if (entry.target.classList.contains('about-text')) {
                    const progressBars = document.querySelectorAll('.progress');
                    progressBars.forEach(bar => {
                        bar.style.width = bar.getAttribute('style').match(/--target: (\d+%)/)[1];
                    });
                }

                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Initial Hero Animation Trigger
    setTimeout(() => {
        document.querySelectorAll('.hero-content .reveal-text').forEach(el => {
            el.classList.add('active');
        });
    }, 100);

    // 6. Load Portfolio Dynamics (inline data — no server/fetch required)
    const portfolioProjects = [
        {
            title: "Neon Nights Campaign",
            category: "Commercial",
            description: "Fast-paced editing & color grading for a streetwear brand.",
            thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop",
            link: "#"
        },
        {
            title: "Urban Origins",
            category: "Documentary",
            description: "Emotion-driven narrative editing for a local documentary short.",
            thumbnail: "https://images.unsplash.com/photo-1616262373466-da4257dbda8d?q=80&w=800&auto=format&fit=crop",
            link: "#"
        },
        {
            title: "TikTok / Reels Optimization",
            category: "Social Media",
            description: "High-retention short form content with dynamic subtitles.",
            thumbnail: "https://images.unsplash.com/photo-1626307416562-ee839676f5fc?q=80&w=800&auto=format&fit=crop",
            link: "#"
        }
    ];

    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
        portfolioGrid.innerHTML = '';
        portfolioProjects.forEach((item, index) => {
            const delayClass = (index % 3) === 1 ? 'delay-2' : '';
            const html = `
                <div class="portfolio-item reveal-up ${delayClass}">
                    <div class="item-image">
                        <img src="${item.thumbnail}" alt="${item.title}">
                        <div class="overlay">
                            <a href="${item.link || '#'}" class="view-btn" target="_blank"><i class="fas fa-eye"></i></a>
                        </div>
                    </div>
                    <div class="item-info">
                        <span class="category">${item.category}</span>
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                    </div>
                </div>
            `;
            portfolioGrid.insertAdjacentHTML('beforeend', html);
        });

        // Observe newly added items for scroll animations
        portfolioGrid.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    }

    // 7. Contact Form — Netlify Forms compatible
    // On Netlify: submits natively (data-netlify="true" handles it server-side).
    // Locally / preview: intercepts and shows a polite in-browser confirmation.
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    const submitBtn = form ? form.querySelector('.submit-btn') : null;
    const btnSpan = submitBtn ? submitBtn.querySelector('span') : null;

    function showStatus(message, isSuccess) {
        if (!statusDiv) return;
        statusDiv.textContent = message;
        statusDiv.style.backgroundColor = isSuccess ? '#1a3a24' : '#3a1a1a';
        statusDiv.style.color = isSuccess ? '#a8e6bf' : '#f5b8b8';
        statusDiv.style.border = '1px solid ' + (isSuccess ? '#2d6a4f' : '#a83232');
        statusDiv.style.display = 'block';
        setTimeout(() => { statusDiv.style.display = 'none'; }, 6000);
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            // Detect Netlify environment: the host will NOT be 'localhost' or '127.0.0.1'
            const isNetlify = !['localhost', '127.0.0.1', ''].includes(window.location.hostname);

            if (isNetlify) {
                // Let Netlify handle the native POST — do NOT prevent default.
                // Disable button & show sending state.
                if (btnSpan) btnSpan.textContent = 'Sending…';
                if (submitBtn) submitBtn.disabled = true;
                // Netlify will redirect to a success page unless action attribute is set;
                // we keep default behavior so the form actually works on deploy.
                return;
            }

            // Local / file:// preview — prevent default and show success UI.
            e.preventDefault();
            if (btnSpan) btnSpan.textContent = 'Sending…';
            if (submitBtn) submitBtn.disabled = true;
            if (statusDiv) statusDiv.style.display = 'none';

            setTimeout(() => {
                showStatus('✔ Message received! (Live form submissions work once deployed to Netlify.)', true);
                form.reset();
                if (btnSpan) btnSpan.textContent = 'Send Message';
                if (submitBtn) submitBtn.disabled = false;
            }, 800);
        });
    }
});
