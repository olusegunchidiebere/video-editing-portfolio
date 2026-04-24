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

    // ====== VIDEO MODAL SYSTEM ======
    // Helper: Convert various video URLs to embeddable format
    function getEmbedUrl(url) {
        if (!url) return null;
        url = url.trim();

        // YouTube: standard watch URLs
        let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;

        // YouTube: already an embed URL
        if (url.includes('youtube.com/embed/')) {
            return url.includes('autoplay') ? url : url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
        }

        // Vimeo
        match = url.match(/vimeo\.com\/(\d+)/);
        if (match) return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;

        // Google Drive
        match = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
        if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;

        // If it's a direct video file (mp4, webm, etc.)
        if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) return url;

        // Fallback: return as-is (user may have pasted an embed URL directly)
        return url;
    }

    // Create and inject the video modal into the page
    function createVideoModal() {
        const modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-backdrop"></div>
            <div class="video-modal-content">
                <button class="video-modal-close" aria-label="Close video"><i class="fas fa-times"></i></button>
                <div class="video-modal-player" id="video-modal-player"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on backdrop click
        modal.querySelector('.video-modal-backdrop').addEventListener('click', closeVideoModal);
        // Close on X button
        modal.querySelector('.video-modal-close').addEventListener('click', closeVideoModal);
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeVideoModal();
        });

        return modal;
    }

    function openVideoModal(videoUrl) {
        if (!videoUrl || videoUrl === '#' || videoUrl.trim() === '') return;

        let modal = document.getElementById('video-modal');
        if (!modal) modal = createVideoModal();

        const player = document.getElementById('video-modal-player');
        const embedUrl = getEmbedUrl(videoUrl);

        if (!embedUrl) return;

        // Check if it's a direct video file
        if (embedUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            player.innerHTML = `<video controls autoplay style="width:100%;height:100%;border-radius:12px;"><source src="${embedUrl}">Your browser does not support the video tag.</video>`;
        } else {
            player.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>`;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        const modal = document.getElementById('video-modal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Stop video playback
        const player = document.getElementById('video-modal-player');
        if (player) player.innerHTML = '';
    }

    // ====== LOAD SHOWREEL FROM JSON ======
    async function loadShowreel() {
        const showreelContainer = document.querySelector('.showreel-container');
        if (!showreelContainer) return;

        try {
            const response = await fetch('data/showreel.json');
            if (!response.ok) throw new Error('Could not load showreel data');
            const data = await response.json();

            // Update the showreel title
            const titleEl = showreelContainer.querySelector('h3');
            if (titleEl && data.title) titleEl.textContent = data.title;

            // Update the thumbnail
            const thumbnailImg = showreelContainer.querySelector('.video-placeholder');
            if (thumbnailImg && data.thumbnail) thumbnailImg.src = data.thumbnail;

            // Wire up play button to open video modal
            const playBtn = showreelContainer.querySelector('.play-btn');
            const videoWrapper = showreelContainer.querySelector('.video-wrapper');

            const handleShowreelClick = () => {
                if (data.videoLink && data.videoLink.trim() !== '') {
                    openVideoModal(data.videoLink);
                }
            };

            if (playBtn) playBtn.addEventListener('click', handleShowreelClick);
            if (videoWrapper) videoWrapper.addEventListener('click', (e) => {
                // Avoid double-triggering from the play button
                if (!e.target.closest('.play-btn')) handleShowreelClick();
            });
        } catch (err) {
            console.warn('Showreel data not available, using defaults.', err);
        }
    }

    loadShowreel();

    // ====== LOAD PORTFOLIO PROJECTS FROM JSON ======
    async function loadPortfolioProjects() {
        const portfolioGrid = document.getElementById('portfolio-grid');
        if (!portfolioGrid) return;

        let projects;

        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) throw new Error('Could not load projects data');
            const data = await response.json();
            projects = data.projects;
        } catch (err) {
            console.warn('Projects JSON not available, using inline fallback.', err);
            // Inline fallback so the site still works without the JSON file
            projects = [
                {
                    title: "Neon Nights Campaign",
                    category: "Commercial",
                    description: "Fast-paced editing & color grading for a streetwear brand.",
                    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop",
                    link: "#",
                    videoLink: ""
                },
                {
                    title: "Urban Origins",
                    category: "Documentary",
                    description: "Emotion-driven narrative editing for a local documentary short.",
                    thumbnail: "https://images.unsplash.com/photo-1616262373466-da4257dbda8d?q=80&w=800&auto=format&fit=crop",
                    link: "#",
                    videoLink: ""
                },
                {
                    title: "TikTok / Reels Optimization",
                    category: "Social Media",
                    description: "High-retention short form content with dynamic subtitles.",
                    thumbnail: "https://images.unsplash.com/photo-1626307416562-ee839676f5fc?q=80&w=800&auto=format&fit=crop",
                    link: "#",
                    videoLink: ""
                }
            ];
        }

        portfolioGrid.innerHTML = '';
        projects.forEach((item, index) => {
            const delayClass = (index % 3) === 1 ? 'delay-2' : '';
            const hasVideo = item.videoLink && item.videoLink.trim() !== '';

            const html = `
                <div class="portfolio-item reveal-up ${delayClass}" ${hasVideo ? `data-video-link="${item.videoLink}"` : ''}>
                    <div class="item-image">
                        <img src="${item.thumbnail}" alt="${item.title}">
                        <div class="overlay">
                            ${hasVideo
                                ? `<button class="view-btn video-play-trigger" aria-label="Play video for ${item.title}"><i class="fas fa-play"></i></button>`
                                : `<a href="${item.link || '#'}" class="view-btn" target="_blank"><i class="fas fa-eye"></i></a>`
                            }
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

        // Wire up video play triggers on portfolio items
        portfolioGrid.querySelectorAll('.video-play-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = btn.closest('.portfolio-item');
                const videoLink = card.getAttribute('data-video-link');
                openVideoModal(videoLink);
            });
        });

        // Also allow clicking anywhere on the card if it has a video
        portfolioGrid.querySelectorAll('.portfolio-item[data-video-link]').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.closest('.video-play-trigger')) return; // Already handled
                const videoLink = card.getAttribute('data-video-link');
                openVideoModal(videoLink);
            });
        });

        // Observe newly added items for scroll animations
        portfolioGrid.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    }

    loadPortfolioProjects();

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
