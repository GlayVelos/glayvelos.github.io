// Portfolio Website JavaScript
// Author: Glay Velos

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSmoothScrolling();
    // initLavaLampBackgrounds(); // Disabled - using elegant gradient hero backgrounds
    initFadeInAnimations();
    initLazyVideoLoading();
    initBeforeAfterSliders();
});

// Navigation functionality (Tailwind responsive)
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');

    // Hamburger menu toggle for mobile
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
            }
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    if (mobileMenu) {
        const mobileMenuLinks = mobileMenu.querySelectorAll('a:not(.services-dropdown-menu a)'); // Exclude services dropdown links
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
                if (hamburger) {
                    hamburger.classList.remove('active');
                }
            });
        });
    }

    // Navbar scroll effect with dynamic brightness calculation
    const navbarScrollHandler = function() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const navBrand = navbar.querySelector('.font-bold');
        const navLinks = navbar.querySelectorAll('#nav-links > li > a, #nav-links .services-dropdown-toggle'); // Only desktop nav links
        const hamburgerSpans = navbar.querySelectorAll('#hamburger span');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu) return;
        
        const mobileMenuLinks = mobileMenu.querySelectorAll('a:not(.services-dropdown-menu a)');
        
        // Calculate navbar background effective brightness using sample points
        const navbarRect = navbar.getBoundingClientRect();
        
        // Get navbar text elements for brightness sampling (desktop only)
        const textElements = [
            navBrand,
            ...Array.from(navLinks),
            ...Array.from(hamburgerSpans)
        ].filter(element => element && element.offsetParent !== null);
        
        // If mobile menu is open, exclude it from dynamic color sampling
        const isMobileMenuVisible = !mobileMenu.classList.contains('hidden');
        if (isMobileMenuVisible) {
            // Mobile menu has white background cards and should maintain static colors
            // No sampling needed for mobile menu elements
        }
        
        // Calculate effective brightness for each sample point
        const navbarOpacity = 0.2;
        const blurEffect = 0.05;
        const whiteBrightness = 255;
        
        const darkPoints = [];
        let totalBrightness = 0;
        const sampleCount = textElements.length;
        
        textElements.forEach(textElement => {
            const textRect = textElement.getBoundingClientRect();
            const sampleX = textRect.left + textRect.width / 2; // Center of text element
            const sampleY = textRect.top + textRect.height / 2;
            
            // Get the element behind each text element
            navbar.style.pointerEvents = 'none';
            const elementBehind = document.elementFromPoint(sampleX, sampleY);
            navbar.style.pointerEvents = '';
            
            let backgroundBrightness = 255; // Default to light
            
            if (elementBehind) {
                // Calculate brightness for this sample point
                const computedStyle = window.getComputedStyle(elementBehind);
                const backgroundColor = computedStyle.backgroundColor;
                
                // Check for specific dark backgrounds
                const isDarkRoseBackground = (
                    elementBehind.classList.contains('bg-rose-700') ||
                    elementBehind.closest('.bg-rose-700') ||
                    elementBehind.classList.contains('bg-rose-800') ||
                    elementBehind.closest('.bg-rose-800')
                );
                
                const isVideo = (
                    elementBehind.tagName === 'IFRAME' ||
                    elementBehind.closest('iframe') ||
                    elementBehind.classList.contains('aspect-video') ||
                    elementBehind.closest('.aspect-video')
                );
                
                const isWhiteBackground = (
                    elementBehind.classList.contains('bg-white') ||
                    elementBehind.closest('.bg-white') ||
                    elementBehind.classList.contains('bg-gray-50') ||
                    elementBehind.closest('.bg-gray-50')
                );
                
                // Prioritize specific background types
                if (isDarkRoseBackground) {
                    backgroundBrightness = 20; // Dark rose backgrounds
                } else if (isVideo) {
                    backgroundBrightness = 25; // Dark videos/video containers
                } else if (isWhiteBackground) {
                    backgroundBrightness = 255; // Explicitly white backgrounds
                } else {
                    // Extract RGB values from computed background color
                    const rgb = backgroundColor.match(/\d+/g);
                    if (rgb && rgb.length >= 3) {
                        const r = parseInt(rgb[0]);
                        const g = parseInt(rgb[1]);
                        const b = parseInt(rgb[2]);
                        backgroundBrightness = (0.299 * r + 0.587 * g + 0.114 * b);
                    } else {
                        // If no background color detected, assume it's light
                        backgroundBrightness = 240;
                    }
                }
            }
            
            // Calculate effective brightness for this point
            const effectiveBrightness = (navbarOpacity * whiteBrightness) + 
                                       ((1 - navbarOpacity) * backgroundBrightness * (1 - blurEffect)) +
                                       (blurEffect * whiteBrightness * 0.95);
            
            totalBrightness += effectiveBrightness;
            
            // Consider this point "dark" if effective brightness is below threshold
            if (effectiveBrightness < 90) {
                darkPoints.push(true);
            } else {
                darkPoints.push(false);
            }
        });
        
        // Calculate the percentage of dark points
        const darkPercentage = (darkPoints.filter(isDark => isDark).length / sampleCount) * 100;
        const averageBrightness = totalBrightness / sampleCount;
        
        // Determine if navbar should use white text
        // Use white text if 65% or more of the navbar is over dark content, OR if average brightness is very low
        const shouldUseWhiteText = (darkPercentage >= 65) || (averageBrightness < 60);
        
        // Apply text colors based on calculated brightness
        if (shouldUseWhiteText) {
            // Light text for dark effective background
            navBrand.classList.remove('text-rose-800');
            navBrand.classList.add('text-white');
            
            navLinks.forEach(link => {
                link.classList.remove('text-gray-800');
                link.classList.add('text-white');
                link.classList.remove('hover:text-rose-600');
                link.classList.add('hover:text-rose-200');
            });
            
            hamburgerSpans.forEach(span => {
                span.classList.remove('bg-rose-800');
                span.classList.add('bg-white');
            });
            
            // Mobile menu maintains static white background with dark text
        } else {
            // Dark text for light effective background
            navBrand.classList.remove('text-white');
            navBrand.classList.add('text-rose-800');
            
            navLinks.forEach(link => {
                link.classList.remove('text-white');
                link.classList.add('text-gray-800');
                link.classList.remove('hover:text-rose-200');
                link.classList.add('hover:text-rose-600');
            });
            
            hamburgerSpans.forEach(span => {
                span.classList.remove('bg-white');
                span.classList.add('bg-rose-800');
            });
            
            // Mobile menu maintains static white background with dark text
        }
    };
    
    if (navbar) {
        window.addEventListener('scroll', navbarScrollHandler);
        
        // Trigger initial navbar styling on page load
        navbarScrollHandler();
    }

    // Services Dropdown Toggle - Desktop & Mobile: Toggle dropdown on click
    const servicesDropdownToggles = document.querySelectorAll('.services-dropdown-toggle');
    const servicesDropdownMenus = document.querySelectorAll('.services-dropdown-menu');

    servicesDropdownToggles.forEach((toggle, idx) => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            servicesDropdownMenus.forEach((menu, i) => {
                if (i === idx) {
                    menu.classList.toggle('hidden');
                } else {
                    menu.classList.add('hidden');
                }
            });
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        let clickedDropdown = false;
        servicesDropdownToggles.forEach(toggle => {
            if (toggle.contains(e.target)) clickedDropdown = true;
        });
        servicesDropdownMenus.forEach(menu => {
            if (menu.contains(e.target)) clickedDropdown = true;
        });
        if (!clickedDropdown) {
            servicesDropdownMenus.forEach(menu => menu.classList.add('hidden'));
        }
    });
    
    // Close dropdown on link click
    servicesDropdownMenus.forEach(menu => {
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                menu.classList.add('hidden');
            });
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                const hamburger = document.getElementById('hamburger');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                    if (hamburger) {
                        hamburger.classList.remove('active');
                    }
                }
            }
        });
    });
}

// Lava Lamp Animated Background
function initLavaLampBackgrounds() {
    const canvases = document.querySelectorAll('.lava-lamp-bg');
    if (!canvases.length) return;

    // Brand color palettes per page
    const pageColors = {
        'video-editing': ['#f97316', '#f43f5e', '#8b5cf6'],   // orange, rose, purple
        'photo-editing': ['#f43f5e', '#ec4899', '#f59e0b'],   // rose, pink, amber
        'web-development': ['#f43f5e', '#f97316', '#e11d48'], // rose, pink, orange
        'digital-marketing': ['#f43f5e', '#e11d48', '#f97316'], // rose, dark rose, orange
        'index': ['#f43f5e', '#e11d48', '#f97316']            // rose, dark rose, orange
    };

    // Determine page key from URL
    let pageKey = 'index';
    const path = window.location.pathname;
    if (path.includes('video-editing')) pageKey = 'video-editing';
    else if (path.includes('photo-editing')) pageKey = 'photo-editing';
    else if (path.includes('web-development')) pageKey = 'web-development';
    else if (path.includes('digital-marketing')) pageKey = 'digital-marketing';

    const colors = pageColors[pageKey] || pageColors['index'];

    canvases.forEach(canvas => {
        let dpr = window.devicePixelRatio || 1;
        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Blob parameters
        const blobCount = 2;
        const blobs = Array.from({length: blobCount}).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            return {
                baseR: Math.max(width, height) * (0.25 + Math.random() * 0.15),
                orbitR: Math.min(width, height) * (0.18 + Math.random() * 0.18),
                speed: 0.008 + Math.random() * 0.006 * (i % 2 === 0 ? 1 : -1),
                phase: angle,
                color: colors[i % colors.length]
            };
        });
        let t = 0;

        function animate() {
            ctx.clearRect(0, 0, width, height);
            t += 1;
            blobs.forEach((blob, i) => {
                // Organic movement: add a little wobble
                const angle = blob.phase + t * blob.speed + Math.sin(t * 0.002 + i) * 0.5;
                const cx = width / 2 + Math.cos(angle) * blob.orbitR;
                const cy = height / 2 + Math.sin(angle) * blob.orbitR;
                const grad = ctx.createRadialGradient(cx, cy, blob.baseR * 0.2, cx, cy, blob.baseR);
                grad.addColorStop(0, hexToRgba(blob.color, 0.7));
                grad.addColorStop(1, hexToRgba(blob.color, 0.0));
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
            });
            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        }

        animate();

        // Responsive resize
        window.addEventListener('resize', () => {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        });
    });

    // Helper: convert hex to rgba
    function hexToRgba(hex, alpha) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }
}

// Initialize fade-in animations with Intersection Observer
function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Lazy video loading functionality
function initLazyVideoLoading() {
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    
    videoPlaceholders.forEach(placeholder => {
        const vimeoId = placeholder.getAttribute('data-vimeo-id');
        if (!vimeoId) return;
        
        loadVimeoThumbnail(vimeoId, placeholder);
        
        placeholder.addEventListener('click', function() {
            const vimeoId = this.getAttribute('data-vimeo-id');
            if (!vimeoId) return;
            
            const iframe = document.createElement('iframe');
            iframe.src = `https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&autoplay=1&player_id=0&app_id=58479`;
            iframe.frameBorder = '0';
            iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
            iframe.className = 'absolute inset-0 w-full h-full object-contain';
            iframe.style.background = '#000';
            iframe.title = `Video ${vimeoId}`;
            
            this.innerHTML = '';
            this.appendChild(iframe);
            this.removeEventListener('click', arguments.callee);
            this.classList.remove('cursor-pointer', 'group');
        });
    });
}

// Load Vimeo thumbnail
function loadVimeoThumbnail(vimeoId, placeholder) {
    const thumbnailUrl = `https://vumbnail.com/${vimeoId}.jpg`;
    const testImg = new Image();
    
    testImg.onload = function() {
        placeholder.innerHTML = `
            <img src="${thumbnailUrl}" alt="Video thumbnail" class="w-full h-full object-cover">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-6 group-hover:bg-opacity-70 transition-all duration-300">
                <svg class="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
        `;
        placeholder.classList.add('group');
    };
    
    testImg.onerror = function() {
        updatePlaceholderText(placeholder);
    };
    
    testImg.src = thumbnailUrl;
}

// Update placeholder text from "Loading..." to "Click to Play"
function updatePlaceholderText(placeholder) {
    const loadingText = placeholder.querySelector('.loading-placeholder p');
    if (loadingText) {
        loadingText.textContent = 'Click to Play';
    }
}

// Before/After Slider functionality for photo editing portfolio
function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');
    
    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImage = slider.querySelector('.after-image');
        
        if (!handle || !afterImage) return;
        
        let isDragging = false;
        
        // Mouse events
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        // Touch events for mobile
        handle.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', stopDrag);
        
        function startDrag(e) {
            isDragging = true;
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const sliderRect = slider.getBoundingClientRect();
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const x = clientX - sliderRect.left;
            const percentage = Math.max(0, Math.min(100, (x / sliderRect.width) * 100));
            
            // Update handle position
            handle.style.left = percentage + '%';
            
            // Update after image clip-path
            afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            
            e.preventDefault();
        }
        
        function stopDrag() {
            isDragging = false;
            handle.style.cursor = 'ew-resize';
        }
        
        // Click to move slider
        slider.addEventListener('click', function(e) {
            if (e.target === handle) return;
            
            const sliderRect = slider.getBoundingClientRect();
            const x = e.clientX - sliderRect.left;
            const percentage = Math.max(0, Math.min(100, (x / sliderRect.width) * 100));
            
            // Animate to new position
            handle.style.transition = 'left 0.3s ease';
            afterImage.style.transition = 'clip-path 0.3s ease';
            
            handle.style.left = percentage + '%';
            afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            
            // Remove transition after animation
            setTimeout(() => {
                handle.style.transition = '';
                afterImage.style.transition = '';
            }, 300);
        });
    });
}
