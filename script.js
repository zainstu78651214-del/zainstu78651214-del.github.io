// ============================================================
// 0. Wait for DOM to be ready
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 1. AOS Init
    // ============================================================
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 700,
            easing: 'ease-out-cubic',
        });
    }

    // ============================================================
    // 2. Theme Toggle
    // ============================================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    let currentTheme = localStorage.getItem('theme') || 'light';

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    setTheme(currentTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // ============================================================
    // 3. Navbar Active Link + Scroll Shadow
    // ============================================================
    const navLinks = document.querySelectorAll('.navbar-custom .nav-link');
    const sections = document.querySelectorAll('section[id]');
    const navbar = document.querySelector('.navbar-custom');

    function updateActiveLink() {
        let current = '';
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    }
    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);

    // ============================================================
    // 4. Scroll Progress Bar
    // ============================================================
    const progressBar = document.getElementById('scrollProgressBar');

    function updateScrollProgress() {
        if (!progressBar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    }
    window.addEventListener('scroll', updateScrollProgress);
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();

    // ============================================================
    // 5. Back to Top + Progress Ring
    // ============================================================
    const backToTop = document.getElementById('backToTop');
    const circle = document.getElementById('backToTopCircle');
    const circumference = 2 * Math.PI * 25;

    function updateBackToTop() {
        if (!backToTop) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) : 0;

        if (scrollTop > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        if (circle) {
            const offset = circumference - progress * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    window.addEventListener('scroll', updateBackToTop);
    window.addEventListener('resize', updateBackToTop);
    updateBackToTop();

    // ============================================================
    // 6. Particle System
    // ============================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = -9999,
            mouseY = -9999;
        let isDark = currentTheme === 'dark';

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.radius = Math.random() * 2.5 + 1.2;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                const dist = Math.hypot(this.x - mouseX, this.y - mouseY);
                let scale = 1;
                if (dist < 150) {
                    scale = 1 + (1 - dist / 150) * 0.8;
                }
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
                const color = isDark ? '180, 190, 220' : '50, 60, 90';
                ctx.fillStyle = `rgba(${color}, ${this.opacity * (scale > 1 ? 1.5 : 1)})`;
                ctx.fill();
            }
        }

        const numParticles = Math.min(80, Math.floor(window.innerWidth / 12));
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 150) {
                        const opacity = (1 - dist / 150) * 0.2;
                        const color = isDark ? '148, 163, 184' : '100, 116, 139';
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update();
                p.draw(); });
            drawLines();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        document.addEventListener('mouseleave', () => {
            mouseX = -9999;
            mouseY = -9999;
        });

        // Update particle colours on theme change
        const origSetTheme = setTheme;
        setTheme = function(theme) {
            origSetTheme(theme);
            isDark = theme === 'dark';
        };
    }

    // ============================================================
    // 7. Mouse Glow
    // ============================================================
    const mouseGlow = document.getElementById('mouseGlow');
    let glowActive = false;
    if (mouseGlow) {
        document.addEventListener('mousemove', (e) => {
            mouseGlow.style.left = e.clientX + 'px';
            mouseGlow.style.top = e.clientY + 'px';
            if (!glowActive) {
                mouseGlow.classList.add('active');
                glowActive = true;
            }
        });
        document.addEventListener('mouseleave', () => {
            mouseGlow.classList.remove('active');
            glowActive = false;
        });
    }

    // ============================================================
    // 8. Typing Animation
    // ============================================================
    const typingText = document.getElementById('typingText');
    if (typingText) {
        const roles = [
            'Software Developer',
            'Full-Stack Developer',
            'MERN Stack Developer',
            'React Native Developer',
            'AI/ML Enthusiast',
            'Human Resource Manager(HRM)',
            'Customer Relationship Manager(CRM)',
            'Finance Accountant',
            'Educator'

        ];
        let roleIndex = 0,
            charIndex = 0,
            isDeleting = false;
        let typingDelay = 100;

        function typeEffect() {
            const currentRole = roles[roleIndex];
            if (isDeleting) {
                typingText.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingDelay = 40;
            } else {
                typingText.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingDelay = 90;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                typingDelay = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingDelay = 300;
            }
            setTimeout(typeEffect, typingDelay);
        }
        setTimeout(typeEffect, 500);
    }

    // ============================================================
    // 9. Project Filter
    // ============================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            projectItems.forEach(item => {
                const cat = item.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // ============================================================
    // 10. Counter Animation
    // ============================================================
    const counters = document.querySelectorAll('.stat-number');
    let countersAnimated = false;
    const aboutSection = document.getElementById('about');

    function animateCounters() {
        if (countersAnimated) return;
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                counter.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(updateCounter);
        });
        countersAnimated = true;
    }

    function checkCounters() {
        if (!countersAnimated && aboutSection) {
            const rect = aboutSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateCounters();
            }
        }
    }
    // Throttle scroll events
    let tickingCounters = false;
    window.addEventListener('scroll', () => {
        if (!tickingCounters) {
            requestAnimationFrame(() => {
                checkCounters();
                tickingCounters = false;
            });
            tickingCounters = true;
        }
    });
    window.addEventListener('load', () => setTimeout(checkCounters, 400));

    // ============================================================
    // 11. Skill Progress Bars
    // ============================================================
    let skillBarsAnimated = false;
    const skillsSection = document.getElementById('skills');

    function animateSkillBars() {
        if (skillBarsAnimated) return;
        const fills = document.querySelectorAll('.progress-fill');
        fills.forEach(fill => {
            const width = parseInt(fill.getAttribute('data-width'));
            fill.style.width = width + '%';
        });
        skillBarsAnimated = true;
    }

    function checkSkillBars() {
        if (!skillBarsAnimated && skillsSection) {
            const rect = skillsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                animateSkillBars();
            }
        }
    }
    let tickingBars = false;
    window.addEventListener('scroll', () => {
        if (!tickingBars) {
            requestAnimationFrame(() => {
                checkSkillBars();
                tickingBars = false;
            });
            tickingBars = true;
        }
    });
    window.addEventListener('load', () => setTimeout(checkSkillBars, 500));

    // ============================================================
    // 12. Testimonials Swiper
    // ============================================================
    // Only initialize Swiper if the library is loaded and the element exists
    if (typeof Swiper !== 'undefined') {
        const swiperEl = document.querySelector('.testimonialSwiper');
        if (swiperEl) {
            new Swiper('.testimonialSwiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: true,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    992: { slidesPerView: 3 },
                },
            });
        }
    } else {
        console.warn('Swiper library not loaded. Testimonials carousel disabled.');
    }

    // ============================================================
    // 13. Contact Form
    // ============================================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('.form-control');
            let valid = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    valid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            const email = document.getElementById('emailAddress');
            if (email && email.value.trim() && !email.value.includes('@')) {
                email.classList.add('is-invalid');
                valid = false;
            }
            if (!valid) {
                if (formStatus) {
                    formStatus.innerHTML = '<span style="color: #ef4444;">Please fill in all fields correctly.</span>';
                }
                return;
            }
            if (formStatus) {
                formStatus.innerHTML = '<span style="color: #34d399;"><i class="fas fa-spinner fa-spin"></i> Sending...</span>';
            }
            setTimeout(() => {
                if (formStatus) {
                    formStatus.innerHTML = '<span style="color: #34d399;"><i class="fas fa-check-circle"></i> Message sent! I\'ll get back to you soon.</span>';
                }
                contactForm.reset();
                document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            }, 1500);
        });

        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                if (formStatus) formStatus.innerHTML = '';
            });
        });
    }

    // ============================================================
    // 14. Smooth scroll for nav links
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                const navCollapse = document.getElementById('navMenu');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });

    // ============================================================
    // 15. Handle prefers-reduced-motion
    // ============================================================
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (typeof AOS !== 'undefined') {
            AOS.init({ disable: true });
        }
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.removeAttribute('data-aos');
        });
    }

    console.log('🚀 Zain Abbas | Software Developer Portfolio');
    console.log('📧 zainstu78651214@gmail.com');
    console.log('🔗 https://github.com/zainabbas');

}); // end DOMContentLoaded