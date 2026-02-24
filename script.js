document.addEventListener('DOMContentLoaded', () => {
    // 1. Canvas Image Sequence Animation Setup
    const canvas = document.getElementById("hero-canvas");
    const context = canvas.getContext("2d");
    const container = document.getElementById("canvas-container");
    const overlayText = document.querySelector(".overlay-text");
    const scrollPrompt = document.querySelector(".scroll-prompt");

    // The frames extraction generated exactly 50 images named ezgif-frame-001.jpg up to 050.jpg
    const frameCount = 50; 
    
    // Function to construct image path
    const currentFrame = index => (
        `./AOT_VIDEO/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const aotState = { frame: 0 };
    let imagesLoaded = 0;

    // Fast image preloader
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            imagesLoaded++;
            // When first image is ready, draw it
            if (i === 0) render();
        };
        images.push(img);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render(); // Re-render the current frame on resize
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Set initial canvas dimensions

    function render() {
        // Guard if image isn't loaded yet
        if (!images[aotState.frame] || !images[aotState.frame].complete) return;
        
        const img = images[aotState.frame];
        
        // Calculate crop to cover screen
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image onto the canvas
        context.drawImage(
            img, 0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
    }

    // 2. Scroll Logic Handler
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        
        // Calculate max scroll for the canvas container before it un-sticks
        const maxCanvasScroll = container.scrollHeight - window.innerHeight;
        
        // Ensure scroll fraction is strictly between 0 and 1
        const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxCanvasScroll));
        
        // Map fraction to a frame index
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        if (aotState.frame !== frameIndex) {
            aotState.frame = frameIndex;
            requestAnimationFrame(render);
        }

        // Apply a gentle fade out to the heading text based on scroll position
        if (scrollTop > 50) {
            const opacity = Math.max(0, 1 - (scrollTop - 50) / 400);
            overlayText.style.opacity = opacity;
            scrollPrompt.style.opacity = opacity;
        } else {
            overlayText.style.opacity = 1;
            scrollPrompt.style.opacity = 1;
        }
    });

    // 3. Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3 // Trigger when 30% of element is visible
    };

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing if you only want the animation to happen once:
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealSections = document.querySelectorAll('.story-section, .final-quote');
    revealSections.forEach(section => {
        fadeInObserver.observe(section);
    });

    // 4. Background Audio Control
    const audio = document.getElementById('bg-music');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');
    
    // Low volume for ambient cinematic feel
    audio.volume = 0.3;
    let isPlaying = false;

    // SVG string for Play/Muted icon
    const iconMuted = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
    // SVG string for Playing icon
    const iconPlaying = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;

    audioToggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            audioToggle.classList.add('muted');
            audioIcon.innerHTML = iconMuted;
        } else {
            audio.play().catch(err => {
                console.warn("Audio playback was prevented. This requires user interaction.", err);
            });
            audioToggle.classList.remove('muted');
            audioIcon.innerHTML = iconPlaying;
        }
        isPlaying = !isPlaying;
    });
});
