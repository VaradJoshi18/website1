/**
 * PLEASURE GLOBAL - Shared Application Logic
 * Coordinates smooth scroll, GSAP animation states, shared navs, and interactive widgets.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Lenis Smooth Scroll
    // Driven by the GSAP ticker rather than its own rAF loop, so smooth
    // scrolling and ScrollTrigger stay on the same clock. Without this,
    // pinned sections drift and jitter.
    let lenis;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
        });

        window.lenisInstance = lenis;

        if (typeof gsap !== 'undefined') {
            if (typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
            }
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
    }

    // 3. Loader Controller
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
                initAnimations();
            }, 800);
        });
        
        // Fallback if window load event already fired
        if (document.readyState === 'complete') {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
                initAnimations();
            }, 800);
        }
    } else {
        initAnimations();
    }

    // 4. GSAP & ScrollTrigger Animations
    function initAnimations() {
        // Entrance animations use gsap.from(), so elements are already visible
        // in their final state. Skipping is safe and leaves nothing hidden.
        if (prefersReducedMotion) return;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // Hero Content Animations
            const tl = gsap.timeline();
            if (document.querySelector('.reveal-text')) {
                tl.from(".reveal-text", {
                    y: 40,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out"
                });
            }

            // Sticky Navbar configuration
            ScrollTrigger.create({
                start: "top -60",
                end: 99999,
                toggleClass: { className: "nav-scrolled", targets: "#navbar" }
            });

            // Count Up Counters
            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                gsap.to(counter, {
                    innerText: target,
                    duration: 2.2,
                    snap: { innerText: 1 },
                    scrollTrigger: {
                        trigger: counter,
                        start: "top 92%",
                        once: true
                    }
                });
            });

            // Card Reveal Staggers
            // The delay is indexed modulo 4 rather than by absolute position.
            // Using the raw index made the delay accumulate across the whole
            // page, so cards near the footer sat invisible for almost a second
            // after scrolling into view.
            if (document.querySelector('.reveal-card')) {
                gsap.utils.toArray('.reveal-card').forEach((card, i) => {
                    gsap.from(card, {
                        y: 45,
                        opacity: 0,
                        duration: 0.85,
                        delay: (i % 4) * 0.06,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 88%",
                            toggleActions: "play none none none"
                        }
                    });
                });
            }

            // Image Parallax Reveal
            const parallaxImages = document.querySelectorAll('.reveal-image');
            parallaxImages.forEach(img => {
                gsap.to(img, {
                    yPercent: -15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: img,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });

            // Service Track scroll animations
            const serviceCards = document.querySelectorAll('.service-card');
            if (serviceCards.length > 0) {
                gsap.fromTo(".service-card",
                    { x: 60, opacity: 0 },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: "#services",
                            start: "top 85%",
                            once: true,
                            onEnter: () => {
                                // Ensure cards become visible even if stagger is long
                                setTimeout(() => {
                                    serviceCards.forEach(card => {
                                        card.style.opacity = '';
                                        card.style.transform = '';
                                    });
                                }, 1500);
                            }
                        }
                    }
                );

                // Safety fallback: if GSAP ScrollTrigger never fires (e.g. section already in view),
                // force cards visible after a short delay
                setTimeout(() => {
                    serviceCards.forEach(card => {
                        const style = window.getComputedStyle(card);
                        if (parseFloat(style.opacity) < 0.1) {
                            card.style.opacity = '1';
                            card.style.transform = 'none';
                        }
                    });
                }, 2500);
            }

            // Form container entry animations
            if (document.querySelector('.reveal-form')) {
                gsap.from(".reveal-form", {
                    x: 40,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".reveal-form",
                        start: "top 85%"
                    }
                });
            }
        }
    }

    // 5. Mobile Navigation Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && mobileMenu) {
        function toggleMenu() {
            mobileMenu.classList.toggle('translate-x-full');
            if (lenis) {
                if (mobileMenu.classList.contains('translate-x-full')) {
                    lenis.start();
                } else {
                    lenis.stop();
                }
            }
        }

        menuBtn.addEventListener('click', toggleMenu);
        if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));
    }

    // 6. Testimonial Carousel logic
    const slides = document.querySelectorAll('.testimonial-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        const nextBtn = document.getElementById('next-testi');
        const prevBtn = document.getElementById('prev-testi');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });
        }

        function startInterval() {
            slideInterval = setInterval(nextSlide, 6000);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }

        startInterval();
    }
});
