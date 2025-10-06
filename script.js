document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.add('hidden');
            themeToggleDarkIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleDarkIcon.classList.add('hidden');
            themeToggleLightIcon.classList.remove('hidden');
        }
    };

    // Check for saved theme in localStorage and apply it
    const savedTheme = localStorage.getItem('color-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    // Event listener for the toggle button
    themeToggleBtn.addEventListener('click', function() {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('color-theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    // --- Header Style on Scroll ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('py-2', window.scrollY > 50);
        header.classList.toggle('py-4', window.scrollY <= 50);
    });

    // --- Email Copy to Clipboard ---
    const copyEmailButton = document.getElementById('copy-email');
    const notification = document.getElementById('copy-notification');
    copyEmailButton.addEventListener('click', () => {
        // Using document.execCommand as a fallback for iframe environments
        const email = 'kumar1909saurav@gmail.com';
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = email;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            notification.classList.remove('opacity-0', 'translate-y-2');
            setTimeout(() => notification.classList.add('opacity-0', 'translate-y-2'), 2000);
        } catch (err) {
            console.error('Failed to copy email: ', err);
        }
        document.body.removeChild(tempTextArea);
    });

    // --- GSAP Scroll-Triggered Animations ---
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-title, .card').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    // --- Hero: floating title + typewriter roles ---
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        gsap.to(heroTitle, { y: -6, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    const roleEl = document.getElementById('hero-role');
    if (roleEl) {
        const roles = ['Aspiring software developer', 'Frontend developer'];
        let idx = 0;
        let typing = false;

        function typeText(text, cb) {
            typing = true;
            roleEl.textContent = '';
            const chars = Array.from(text);
            let i = 0;
            const tick = () => {
                if (i < chars.length) {
                    roleEl.textContent += chars[i++];
                    setTimeout(tick, 40);
                } else {
                    typing = false; cb && setTimeout(cb, 1000);
                }
            };
            tick();
        }

        function eraseText(cb) {
            typing = true;
            const tick = () => {
                const current = roleEl.textContent;
                if (current.length > 0) {
                    roleEl.textContent = current.slice(0, -1);
                    setTimeout(tick, 25);
                } else { typing = false; cb && cb(); }
            };
            tick();
        }

        function loop() {
            const next = roles[idx % roles.length];
            typeText(next, () => eraseText(() => { idx++; loop(); }));
        }

        // start with current text then loop
        eraseText(() => loop());
    }

    // --- Interactive Background: Gooey Gradient Blobs ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    const state = {
        width: 0,
        height: 0,
        blobs: [],
        mouseX: null,
        mouseY: null,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    };

    const config = {
        blobCountBase: 10,
        moveSpeed: 0.2,
        mouseInfluence: 140,
    };

    function resizeCanvas() {
        state.width = canvas.clientWidth = window.innerWidth;
        state.height = canvas.clientHeight = window.innerHeight;
        canvas.width = Math.floor(state.width * dpr);
        canvas.height = Math.floor(state.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seedBlobs();
    }

    function random(min, max) { return Math.random() * (max - min) + min; }

    function seedBlobs() {
        const area = state.width * state.height;
        const density = config.blobCountBase / (1200 * 800);
        const targetCount = Math.max(6, Math.floor(area * density));
        const blobs = [];
        for (let i = 0; i < targetCount; i++) {
            blobs.push({
                x: random(0, state.width),
                y: random(0, state.height),
                vx: random(-config.moveSpeed, config.moveSpeed),
                vy: random(-config.moveSpeed, config.moveSpeed),
                r: random(60, 160),
                hueOffset: random(0, 360),
            });
        }
        state.blobs = blobs;
    }

    function getColors() {
        const dark = state.theme === 'dark';
        return {
            base: dark ? '#0f172a' : '#f8fafc',
            accent1: dark ? 175 : 190, // hue seeds
            accent2: dark ? 190 : 200,
            accent3: dark ? 160 : 170,
        };
    }

    function drawBackground() {
        const colors = getColors();
        ctx.fillStyle = colors.base;
        ctx.fillRect(0, 0, state.width, state.height);
    }

    function step() {
        drawBackground();

        const colors = getColors();
        const now = performance.now();

        // Composite for glow blending
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < state.blobs.length; i++) {
            const b = state.blobs[i];

            // gentle mouse attraction
            if (state.mouseX !== null) {
                const dx = state.mouseX - b.x;
                const dy = state.mouseY - b.y;
                const dist2 = dx*dx + dy*dy;
                const max2 = config.mouseInfluence * config.mouseInfluence;
                if (dist2 < max2) {
                    const f = (1 - dist2 / max2) * 0.008;
                    b.vx += dx * f;
                    b.vy += dy * f;
                }
            }

            // motion
            b.x += b.vx;
            b.y += b.vy;
            b.vx *= 0.995; b.vy *= 0.995;

            // soft wrap
            if (b.x < -200) b.x = state.width + 200;
            if (b.x > state.width + 200) b.x = -200;
            if (b.y < -200) b.y = state.height + 200;
            if (b.y > state.height + 200) b.y = -200;

            const hue = (colors.accent1 + b.hueOffset + now * 0.01) % 360;
            const hue2 = (hue + 30) % 360;

            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            const alphaCore = state.theme === 'dark' ? 0.45 : 0.28;
            const alphaEdge = state.theme === 'dark' ? 0.05 : 0.04;
            grad.addColorStop(0, `hsla(${Math.floor(hue)}, 85%, 60%, ${alphaCore})`);
            grad.addColorStop(0.6, `hsla(${Math.floor(hue2)}, 85%, 60%, ${alphaCore * 0.6})`);
            grad.addColorStop(1, `hsla(${Math.floor(hue)}, 85%, 60%, ${alphaEdge})`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        requestAnimationFrame(step);
    }

    // Input events
    window.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        state.mouseX = null; state.mouseY = null;
    });
    window.addEventListener('resize', resizeCanvas);

    // Observe theme changes to adjust colors live
    const themeObserver = new MutationObserver(() => {
        state.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Kick off
    resizeCanvas();
    requestAnimationFrame(step);

    // Education slider removed; restored static layout
});
