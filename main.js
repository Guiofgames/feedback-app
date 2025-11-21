document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');
    const header = document.querySelector('.header');

    // Toggle mobile menu
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close menu when a link is clicked (mobile)
        navLinkItems.forEach(link => {
            link.addEventListener('click', function () {
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Helper: smooth scroll to element while subtracting header height so target isn't hidden
    function scrollToTargetWithHeaderOffset(target, extraOffset = 0) {
        if (!target) return;
        // Calculate current header height (accounts for scrolled/shrunken header)
        const headerHeight = header ? header.offsetHeight : 0;
        // Cap the header height used for the offset so large hero headers
        // don't push the target too far down the viewport.
        const usedHeader = Math.min(headerHeight, 140); // tweak this value if you want more/less offset
        const offset = usedHeader + extraOffset + 8; // small extra gap
        const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    // Smooth scroll for internal links (handles #sobre specially to open panel first)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = anchor.getAttribute('href');
            if (href.length > 1) { // ignore href="#"
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    if (href === '#sobre') {
                        const about = document.getElementById('sobre');
                        if (about && !about.classList.contains('open')) {
                            about.classList.add('open');
                            about.setAttribute('aria-hidden', 'false');
                            // Wait for the open transition to start so height/layout is updated
                            setTimeout(() => scrollToTargetWithHeaderOffset(target), 90);
                        } else {
                            scrollToTargetWithHeaderOffset(target);
                        }
                    } else {
                        scrollToTargetWithHeaderOffset(target);
                    }
                }
            }
        });
    });

    // About section open/close logic (close button)
    const about = document.getElementById('sobre');
    if (about) {
        about.addEventListener('click', function (e) {
            // close when clicking the close button
            if (e.target && e.target.classList.contains('about-close')) {
                about.classList.remove('open');
                about.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Shrink header on scroll
    const SCROLL_THRESHOLD = 60;
    function onScroll() {
        if (window.scrollY > SCROLL_THRESHOLD) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    if (header) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});
