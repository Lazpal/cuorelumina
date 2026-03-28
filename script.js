document.addEventListener("DOMContentLoaded", () => {
    
    // AOS init moved to HTML body end to ensure loading

    // 1. Footer Year
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }
    const yearLoader = document.getElementById("year-loader");
    if (yearLoader) {
        yearLoader.textContent = String(new Date().getFullYear());
    }

    // 2. Hide Loader on Load
    const loader = document.getElementById("loader");
    if (loader) {
        window.addEventListener("load", () => {
            // Check if page fully loaded, then hide
            setTimeout(() => {
                loader.classList.add("hidden");
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500); // Wait for transition
            }, 500);
        });
    }

    // 3. Share Modal Logic
    const shareBtn = document.getElementById("shareBtn");
    const shareModal = document.getElementById("shareModal");
    const closeModal = document.getElementById("closeModal");
    const qrImage = document.getElementById("qrCode"); // Renamed variable to avoid conflict
    const copyLinkBtn = document.getElementById("copyLink");
    const nativeShareBtn = document.getElementById("nativeShare");

    // Dynamic Data
    const currentUrl = window.location.href; // Get current page URL
    const pageTitle = document.title;

    // Set Up QR Code
    if (qrImage) {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;
        qrImage.src = qrApiUrl;
    }

    // Native Share Functionality
    if (nativeShareBtn) {
        nativeShareBtn.addEventListener("click", async () => {
            const shareData = {
                title: document.title,
                text: 'Check out PalPrint Studio links:',
                url: window.location.href
            };

            // Helper function for Copy fallback
            const copyToClipboard = () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareData.url)
                        .then(() => alert('Link copied!'))
                        .catch((err) => console.error('Copy failed', err));
                } else {
                    // Legacy fallback
                    const textArea = document.createElement("textarea");
                    textArea.value = shareData.url;
                    textArea.style.position = "fixed"; 
                    textArea.style.opacity = "0";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        alert('Link copied!');
                    } catch (err) {
                        console.error('Legacy copy failed', err);
                    }
                    document.body.removeChild(textArea);
                }
            };

            // Try Native Share
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    // If user canceled, do nothing. If error, fallback to copy then hide button.
                    if (err.name !== 'AbortError') {
                        copyToClipboard();
                        nativeShareBtn.style.display = 'none';
                    }
                }
            } else {
                // If not supported, just copy then hide button
                copyToClipboard();
                nativeShareBtn.style.display = 'none';
            }
        });
    }

    // Open Modal
    if (shareBtn && shareModal) {
        shareBtn.addEventListener("click", () => {
            shareModal.style.display = "grid";
            shareModal.showModal();
        });
    }

    // Close Modal Function
    const closeDialog = () => {
        if (shareModal) {
            shareModal.close();
            shareModal.style.display = "none";
        }
    };

    // Close Button Event
    if (closeModal) {
        closeModal.addEventListener("click", closeDialog);
    }

    // Click Outside to Close
    if (shareModal) {
        shareModal.addEventListener("click", (e) => {
            const rect = shareModal.getBoundingClientRect();
            // Check if click is outside the dialog content box
            // Note: native dialog ::backdrop is considered part of the element for click events in some browsers/implementations, 
            // but standard way is often just checking target.
            if (e.target === shareModal) {
                closeDialog();
            }
        });
    }

    // Copy Link Logic
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", () => {
             navigator.clipboard.writeText(currentUrl).then(() => {
                const originalHtml = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalHtml;
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy!", err);
            });
        });
    }

    // 4. Carousel Logic
    const initCarousel = () => {
        const track = document.querySelector('.carousel-track');
        if (!track) return;
        
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-btn.next-btn');
        const prevButton = document.querySelector('.carousel-btn.prev-btn');
        const dotsNav = document.querySelector('.carousel-dots');
        
        if (slides.length === 0) return;

        let currentIndex = 0;
        let slideInterval;

        // Function to go to a specific slide
        const goToSlide = (index) => {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            currentIndex = index;
            const amountToMove = -currentIndex * 100;
            track.style.transform = `translateX(${amountToMove}%)`;
            updateDots(currentIndex);
        };

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetInterval();
            });
            dotsNav.appendChild(dot);
        });

        const dots = Array.from(dotsNav.children);

        const updateDots = (index) => {
            dots.forEach(dot => dot.classList.remove('active'));
            if(dots[index]) dots[index].classList.add('active');
        };

        const showNextSlide = () => {
             goToSlide(currentIndex + 1);
        };

        const showPrevSlide = () => {
            goToSlide(currentIndex - 1);
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                showNextSlide();
                resetInterval();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                showPrevSlide();
                resetInterval();
            });
        }
        
        // Auto slide
        const startInterval = () => {
            clearInterval(slideInterval); // Clear existing to specify
            slideInterval = setInterval(showNextSlide, 3500); // 3.5s
        };

        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };

        // Start Auto Slide
        startInterval();

        // Pause on hover
        const container = document.querySelector('.carousel-container');
        if(container){
            container.addEventListener('mouseenter', () => clearInterval(slideInterval));
            container.addEventListener('mouseleave', startInterval);
        }
        
        // Touch Support (Swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) showNextSlide();
            if (touchEndX > touchStartX + 50) showPrevSlide();
            resetInterval();
        }
    };

    initCarousel();

console.log("Designed & Developed by Lazaros Pal");
console.log("....................................");
console.info("Do not copy or steal this code.");

// Disable Right Click & Key Shortcuts for Protection
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (event) => {
    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (event.code === 'F12' || 
        (event.ctrlKey && event.shiftKey && event.code === 'KeyI') || 
        (event.ctrlKey && event.shiftKey && event.code === 'KeyJ') || 
        (event.ctrlKey && event.code === 'KeyU')) {
        event.preventDefault();
    }
});

});
