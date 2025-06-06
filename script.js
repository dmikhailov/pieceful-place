document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    video.play();
    const gridContainer = document.getElementById('gridContainer');
    const playBtn = document.getElementById('playBtn');
    const audioBtn = document.getElementById('audioBtn');
    const shoreAudio = document.getElementById('shoreAudio');
    const hoverTrigger = document.getElementById('hoverTrigger');

    let tileWidth, tileHeight, videoOffsetX, videoOffsetY;
    
    // Dynamic grid sizing based on screen resolution
    let gridSize = calculateOptimalGridSize();
    const canvases = [];
    const contexts = [];
    
    // Function to calculate optimal grid size based on screen dimensions
    function calculateOptimalGridSize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Target piece size constraints
        const minPieceSize = 200;
        const maxPieceSize = 300;
        
        // Calculate how many pieces can fit horizontally and vertically
        const maxCols = Math.floor(screenWidth / minPieceSize);
        const minCols = Math.ceil(screenWidth / maxPieceSize);
        const maxRows = Math.floor(screenHeight / minPieceSize);
        const minRows = Math.ceil(screenHeight / maxPieceSize);
        
        // Choose optimal number of columns and rows
        // Prefer more pieces for better gameplay, but within size constraints
        const cols = Math.max(3, Math.min(maxCols, Math.max(minCols, 5))); // Default to 5 cols if possible
        const rows = Math.max(2, Math.min(maxRows, Math.max(minRows, 3))); // Default to 3 rows if possible
        
        // Verify the actual piece sizes will be within range
        const actualPieceWidth = screenWidth / cols;
        const actualPieceHeight = screenHeight / rows;
        
        console.log(`Screen: ${screenWidth}x${screenHeight}, Grid: ${cols}x${rows}, Piece size: ${actualPieceWidth.toFixed(1)}x${actualPieceHeight.toFixed(1)}px`);
        
        return { rows, cols };
    }
    
    // Function to recreate the entire grid with new dimensions
    function recreateGrid() {
        // Clear existing canvases
        gridContainer.innerHTML = '';
        canvases.length = 0;
        contexts.length = 0;
        
        // Recalculate grid size
        gridSize = calculateOptimalGridSize();
        
        // Update CSS grid template
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${gridSize.rows}, 1fr)`;
        
        // Reset tile mapping for new grid size
        tileMapping = [];
        hasBeenShuffled = false;
        
        // Create new canvas elements
        for (let i = 0; i < gridSize.rows * gridSize.cols; i++) {
            const container = document.createElement('div');
            container.className = 'canvas-container';
            const canvas = document.createElement('canvas');
            container.appendChild(canvas);
            gridContainer.appendChild(container);
            
            canvases.push(canvas);
            contexts.push(canvas.getContext('2d'));
            tileMapping.push(i); // Initially, each canvas displays its corresponding grid position
            
            // Add drag and drop event listeners
            setupDragAndDrop(canvas, i);
        }
        
        // If video is ready, set canvas sizes
        if (video.videoWidth && video.videoHeight) {
            const srcWidth = video.videoWidth / gridSize.cols;
            const srcHeight = video.videoHeight / gridSize.rows;
            
            canvases.forEach(canvas => {
                canvas.width = srcWidth;
                canvas.height = srcHeight;
            });
        }
        
        // Remove solved state when recreating grid
        gridContainer.classList.remove('solved');
    }
    
    // Create mapping array for shuffle functionality
    // Each index represents a canvas, value represents which grid position it displays
    let tileMapping = [];
    
    // Track whether the puzzle has been shuffled (to enable solved state detection)
    let hasBeenShuffled = false;
    
    // Track if this is the first play or subsequent shuffles
    let isFirstPlay = true;
    
    // Drag and drop state
    let dragState = {
        isDragging: false,
        draggedCanvasIndex: -1,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    };

    // Initialize grid with dynamic sizing
    recreateGrid();
    
    // Global mouse and touch event handlers for drag and drop
    document.addEventListener('mousemove', (e) => handleDrag(e));
    document.addEventListener('mouseup', (e) => endDrag(e));
    
    document.addEventListener('touchmove', (e) => {
        if (dragState.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            handleDrag(touch);
        }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
        if (dragState.isDragging) {
            e.preventDefault();
            // Use changedTouches for touchend event
            const touch = e.changedTouches[0];
            endDrag(touch);
        }
    }, { passive: false });
    
    // Handle window resize to recalculate grid size
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize events to avoid excessive recalculations
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newGridSize = calculateOptimalGridSize();
            // Only recreate grid if dimensions actually changed
            if (newGridSize.rows !== gridSize.rows || newGridSize.cols !== gridSize.cols) {
                recreateGrid();
            }
        }, 250);
    });

    // Setup drag and drop for a canvas
    function setupDragAndDrop(canvas, canvasIndex) {
        // Mouse events
        canvas.addEventListener('mousedown', (e) => startDrag(e, canvasIndex));
        
        // Touch events for mobile - only on the canvas itself
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            startDrag(touch, canvasIndex);
        }, { passive: false });
        
        // Improve touch handling for tablets
        canvas.style.touchAction = 'none';
    }

    // Start dragging
    function startDrag(event, canvasIndex) {
        dragState.isDragging = true;
        dragState.draggedCanvasIndex = canvasIndex;
        
        const rect = canvases[canvasIndex].getBoundingClientRect();
        dragState.startX = event.clientX;
        dragState.startY = event.clientY;
        dragState.offsetX = event.clientX - rect.left;
        dragState.offsetY = event.clientY - rect.top;
        
        // Add dragging class for visual feedback
        canvases[canvasIndex].classList.add('dragging');
        
        // Add haptic feedback for mobile devices
        if (navigator.vibrate && isTabletDevice()) {
            navigator.vibrate(50);
        }
    }

    // Handle dragging
    function handleDrag(event) {
        if (!dragState.isDragging) return;
        
        const canvas = canvases[dragState.draggedCanvasIndex];
        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        
        // Move the canvas using translate only
        canvas.style.transform = `scale(1.05) translate(${deltaX}px, ${deltaY}px)`;
    }

    // End dragging
    function endDrag(event) {
        if (!dragState.isDragging) return;
        
        const draggedCanvas = canvases[dragState.draggedCanvasIndex];
        
        // Remove dragging class and reset transform
        draggedCanvas.classList.remove('dragging');
        draggedCanvas.style.transform = '';
        
        // Find drop target
        const dropTarget = findDropTarget(event.clientX, event.clientY);
        
        if (dropTarget !== -1 && dropTarget !== dragState.draggedCanvasIndex) {
            // Swap tiles
            swapTiles(dragState.draggedCanvasIndex, dropTarget);
            console.log(`Swapped tiles ${dragState.draggedCanvasIndex} and ${dropTarget}`);
        } else {
            console.log(`No valid drop target found at ${event.clientX}, ${event.clientY}`);
        }
        
        // Reset drag state
        dragState.isDragging = false;
        dragState.draggedCanvasIndex = -1;
    }

    // Find which canvas is under the cursor
    function findDropTarget(x, y) {
        for (let i = 0; i < canvases.length; i++) {
            if (i === dragState.draggedCanvasIndex) continue;
            
            const rect = canvases[i].getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return i;
            }
        }
        return -1;
    }

    // Swap two tiles
    function swapTiles(index1, index2) {
        const temp = tileMapping[index1];
        tileMapping[index1] = tileMapping[index2];
        tileMapping[index2] = temp;
        
        // Add haptic feedback for successful swap on mobile devices
        if (navigator.vibrate && isTabletDevice()) {
            navigator.vibrate([30, 50, 30]);
        }
        
        // Check if puzzle is solved after swap
        checkPuzzleSolved();
    }

    // Shuffle function
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Function to check if puzzle is solved
    function checkPuzzleSolved() {
        const isSolved = tileMapping.every((value, index) => value === index);
        
        // Only apply solved state if the puzzle has been shuffled first
        if (hasBeenShuffled && isSolved) {
            gridContainer.classList.add('solved');
        } else {
            gridContainer.classList.remove('solved');
        }
        
        return isSolved;
    }

    // Play/Shuffle button event listener
    playBtn.addEventListener('click', () => {
        if (isFirstPlay) {
            // First click: shuffle tiles and go fullscreen
            tileMapping = shuffleArray(tileMapping);
            hasBeenShuffled = true; // Mark that puzzle has been shuffled
            checkPuzzleSolved();
            
            // Switch to fullscreen
            if (!isFullscreen()) {
                requestFullscreen(document.documentElement).catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                    // Fallback for Android - try viewport meta manipulation
                    if (/Android/i.test(navigator.userAgent)) {
                        console.log('Trying Android fallback fullscreen method...');
                        const viewport = document.querySelector('meta[name=viewport]');
                        if (viewport) {
                            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, minimal-ui');
                        }
                        // Simulate fullscreen mode
                        document.body.classList.add('fullscreen-mode');
                        setupFullscreenHover();
                        optimizeForAndroid();
                        if (audioMuted) {
                            initializeAudioContext();
                            setTimeout(() => toggleAudio(), 100); // Small delay for Android tablet compatibility
                        }
                    }
                });
            }
            
            // Change button text and mark as no longer first play
            playBtn.textContent = 'Shuffle';
            isFirstPlay = false;
        } else {
            // Subsequent clicks: just shuffle tiles
            tileMapping = shuffleArray(tileMapping);
            hasBeenShuffled = true;
            checkPuzzleSolved();
        }
    });

    // Cross-browser fullscreen functionality with Android tablet support
    function isFullscreen() {
        return !!(document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement ||
                  document.msFullscreenElement);
    }

    function requestFullscreen(element) {
        if (element.requestFullscreen) {
            return element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            return element.webkitRequestFullscreen();
        } else if (element.webkitRequestFullScreen) {
            return element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
            return element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            return element.msRequestFullscreen();
        } else {
            return Promise.reject(new Error('Fullscreen API not supported'));
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            return document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            return document.webkitExitFullscreen();
        } else if (document.webkitCancelFullScreen) {
            return document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            return document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            return document.msExitFullscreen();
        } else {
            return Promise.reject(new Error('Exit fullscreen API not supported'));
        }
    }

    function handleFullscreenChange() {
        const isInFullscreen = isFullscreen();
        
        // Add or remove fullscreen mode class
        if (isInFullscreen) {
            document.body.classList.add('fullscreen-mode');
            setupFullscreenHover();
            // Auto-enable audio when entering fullscreen (with tablet support)
            if (audioMuted) {
                initializeAudioContext();
                setTimeout(() => toggleAudio(), 100); // Small delay for tablet compatibility
            }
        } else {
            document.body.classList.remove('fullscreen-mode', 'show-controls');
            cleanupFullscreenHover();
            // Auto-disable audio when exiting fullscreen
            if (!audioMuted) {
                toggleAudio();
            }
            // Reset play button when exiting fullscreen
            if (!isFirstPlay) {
                playBtn.textContent = 'Play';
                isFirstPlay = true;
            }
        }
    }

    // Listen for all possible fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Additional Android tablet optimizations
    function optimizeForAndroid() {
        // Request orientation lock for tablets if supported
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => {
                console.log('Orientation lock not supported or denied:', err);
            });
        }
        
        // Hide system UI on Android when in fullscreen
        if (window.navigator.standalone === false && /Android/i.test(navigator.userAgent)) {
            // Try to hide status bar and navigation bar
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        }
    }

    // Detect when device orientation changes and handle fullscreen
    window.addEventListener('orientationchange', () => {
        if (isFullscreen() || document.body.classList.contains('fullscreen-mode')) {
            setTimeout(() => {
                optimizeForAndroid();
                // Recalculate grid if needed
                const newGridSize = calculateOptimalGridSize();
                if (newGridSize.rows !== gridSize.rows || newGridSize.cols !== gridSize.cols) {
                    recreateGrid();
                }
            }, 500); // Delay to allow orientation change to complete
        }
    });

    // Prevent zoom on double tap for Android tablets (only on canvas elements, not buttons)
    // This is now handled by touch-action: none on canvas elements
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        // Only prevent double-tap zoom on canvas elements, not on buttons
        // Skip if this is part of a drag operation
        if (event.target.tagName === 'CANVAS' && !dragState.isDragging) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }
    }, false);

    // Shore audio control functionality
    let audioMuted = true; // Start muted by default
    let audioVolume = 0.5; // Increased volume for tablets
    let audioStarted = false;
    let audioContext = null;
    
    // Set initial volume and muted state
    shoreAudio.volume = audioVolume;
    shoreAudio.muted = true;
    
    // Function to initialize audio context for better tablet support
    function initializeAudioContext() {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume audio context if suspended (common on mobile)
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('Audio context resumed');
                }).catch(err => {
                    console.log('Failed to resume audio context:', err);
                });
            }
        } catch (err) {
            console.log('Audio context initialization failed:', err);
        }
    }
    
    // Enhanced function to start audio (needed for browser autoplay policy)
    function startAudio() {
        if (!audioStarted) {
            initializeAudioContext();
            
            // Try multiple approaches for tablet compatibility
            const playPromise = shoreAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Audio playback started successfully');
                    audioStarted = true;
                }).catch(err => {
                    console.log('Audio autoplay prevented, will try on next user interaction:', err);
                    // Don't mark as started if it failed
                });
            } else {
                // Fallback for older browsers
                audioStarted = true;
            }
        }
    }
    
    // Enhanced user interaction handling for tablets
    function handleUserInteraction() {
        initializeAudioContext();
        startAudio();
    }
    
    // Start audio on various user interactions (tablets may need different events)
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('touchend', handleUserInteraction, { once: true });
    
    // Also try to initialize on page load for tablets
    window.addEventListener('load', () => {
        // Try to prepare audio without playing
        shoreAudio.load();
        
        // Detect if we're on a tablet and pre-initialize some audio features
        if (isTabletDevice()) {
            console.log('Tablet detected, optimizing audio...');
            // Preload audio for better tablet performance
            shoreAudio.preload = 'auto';
            // Set additional tablet-friendly audio properties
            shoreAudio.volume = audioVolume;
        }
    });
    
    // Function to detect tablet devices
    function isTabletDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = userAgent.indexOf('android') > -1;
        const isIPad = userAgent.indexOf('ipad') > -1;
        const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent) || 
                        (isAndroid && userAgent.indexOf('mobile') === -1);
        return isTablet || isIPad;
    }
    
    // Function to toggle audio state with enhanced tablet support
    function toggleAudio() {
        if (audioMuted) {
            // Unmute with enhanced error handling
            initializeAudioContext();
            
            // Ensure audio is properly started before unmuting
            if (!audioStarted) {
                const playPromise = shoreAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        audioStarted = true;
                        shoreAudio.volume = audioVolume;
                        shoreAudio.muted = false;
                        audioBtn.innerHTML = '🔊 Shore Audio';
                        audioBtn.style.backgroundColor = '#17a2b8';
                        audioMuted = false;
                        console.log('Audio unmuted successfully');
                    }).catch(err => {
                        console.error('Failed to start audio:', err);
                        // Show error to user
                        audioBtn.innerHTML = '❌ Audio Error';
                        audioBtn.style.backgroundColor = '#dc3545';
                        setTimeout(() => {
                            audioBtn.innerHTML = '🔇 Shore Audio';
                            audioBtn.style.backgroundColor = '#6c757d';
                        }, 2000);
                    });
                } else {
                    // Fallback
                    audioStarted = true;
                    shoreAudio.volume = audioVolume;
                    shoreAudio.muted = false;
                    audioBtn.innerHTML = '🔊 Shore Audio';
                    audioBtn.style.backgroundColor = '#17a2b8';
                    audioMuted = false;
                }
            } else {
                // Audio already started, just unmute
                shoreAudio.volume = audioVolume;
                shoreAudio.muted = false;
                audioBtn.innerHTML = '🔊 Shore Audio';
                audioBtn.style.backgroundColor = '#17a2b8';
                audioMuted = false;
            }
        } else {
            // Mute
            shoreAudio.muted = true;
            audioBtn.innerHTML = '🔇 Shore Audio';
            audioBtn.style.backgroundColor = '#6c757d';
            audioMuted = true;
        }
    }
    
    // Enhanced audio button click handler with tablet support
    audioBtn.addEventListener('click', (e) => {
        // Ensure user interaction is captured for tablets
        initializeAudioContext();
        toggleAudio();
    });
    
    // Also handle touch events specifically for tablets
    audioBtn.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent double-firing with click
        initializeAudioContext();
        toggleAudio();
    });

    // Keyboard shortcut for audio toggle (spacebar)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('button, input, textarea')) {
            e.preventDefault();
            audioBtn.click();
        }
    });
    
    // Additional tablet-specific audio handling
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && audioStarted && !audioMuted) {
            // Resume audio when page becomes visible (tablets might suspend audio)
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('Audio context resumed after visibility change');
                    if (shoreAudio.paused) {
                        shoreAudio.play().catch(err => {
                            console.log('Failed to resume audio playback:', err);
                        });
                    }
                });
            }
        }
    });

    // Fullscreen hover functionality
    let hoverTimeout;
    
    function setupFullscreenHover() {
        // Show controls when hovering over the top area
        hoverTrigger.addEventListener('mouseenter', showControls);
        hoverTrigger.addEventListener('mouseleave', hideControlsWithDelay);
        
        // Also show controls when hovering over the button container itself
        const buttonContainer = document.querySelector('.button-container');
        buttonContainer.addEventListener('mouseenter', showControls);
        buttonContainer.addEventListener('mouseleave', hideControlsWithDelay);
    }
    
    function cleanupFullscreenHover() {
        // Remove event listeners when exiting fullscreen
        hoverTrigger.removeEventListener('mouseenter', showControls);
        hoverTrigger.removeEventListener('mouseleave', hideControlsWithDelay);
        
        const buttonContainer = document.querySelector('.button-container');
        buttonContainer.removeEventListener('mouseenter', showControls);
        buttonContainer.removeEventListener('mouseleave', hideControlsWithDelay);
        
        // Clear any pending timeouts
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
    }
    
    function showControls() {
        // Clear any pending hide timeout
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        document.body.classList.add('show-controls');
    }
    
    function hideControlsWithDelay() {
        // Hide controls after a short delay
        hoverTimeout = setTimeout(() => {
            document.body.classList.remove('show-controls');
        }, 1000); // 1 second delay before hiding
    }

    // Wait for video to be ready
    video.addEventListener('loadedmetadata', () => {
        // Check if video dimensions actually changed before calculating
        if (video.videoWidth !== prevVideoWidth || video.videoHeight !== prevVideoHeight) {
            prevVideoWidth = video.videoWidth;
            prevVideoHeight = video.videoHeight;
            calculateDimensions();
        }
        
        // Set canvas sizes
        const srcWidth = video.videoWidth / gridSize.cols;
        const srcHeight = video.videoHeight / gridSize.rows;
        
        canvases.forEach(canvas => {
            canvas.width = srcWidth;
            canvas.height = srcHeight;
        });

        // Don't check initial puzzle state since it starts solved
        // checkPuzzleSolved();

        // Start animation
        requestAnimationFrame(draw);
    });

    // Track previous dimensions to detect changes
    let prevVideoWidth = 0;
    let prevVideoHeight = 0;
    let prevWindowWidth = window.innerWidth;
    let prevWindowHeight = window.innerHeight;

    // Handle window resize
    let dimensionResizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize events
        clearTimeout(dimensionResizeTimeout);
        dimensionResizeTimeout = setTimeout(() => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            if (newWidth !== prevWindowWidth || newHeight !== prevWindowHeight) {
                prevWindowWidth = newWidth;
                prevWindowHeight = newHeight;
                calculateDimensions();
            }
        }, 250);
    });

    function calculateDimensions() {
         // Get current page dimensions
         const pageWidth = window.innerWidth;
         const pageHeight = window.innerHeight;
         const pageAspectRatio = pageWidth / pageHeight;
         
         // Get video dimensions
         const videoWidth = video.videoWidth;
         const videoHeight = video.videoHeight;
         
         // Skip calculation if video dimensions are not available yet
         if (!videoWidth || !videoHeight) {
             return;
         }
         
         const videoAspectRatio = videoWidth / videoHeight;
         
         // Calculate which part of the video is visible for this page resolution
         let visibleVideoWidth, visibleVideoHeight;
         
         if (videoAspectRatio > pageAspectRatio) {
             // Video is wider than page - crop the sides of the video
             visibleVideoHeight = videoHeight;
             visibleVideoWidth = videoHeight * pageAspectRatio;
             videoOffsetX = (videoWidth - visibleVideoWidth) / 2;
             videoOffsetY = 0;
         } else {
             // Video is taller than page - crop the top/bottom of the video
             visibleVideoWidth = videoWidth;
             visibleVideoHeight = videoWidth / pageAspectRatio;
             videoOffsetX = 0;
             videoOffsetY = (videoHeight - visibleVideoHeight) / 2;
         }
         
         // Calculate tile dimensions from the visible portion
        tileWidth = visibleVideoWidth / gridSize.cols;
        tileHeight = visibleVideoHeight / gridSize.rows;
        
        console.log(`Dimensions calculated: ${pageWidth}x${pageHeight}, video: ${videoWidth}x${videoHeight}, tiles: ${tileWidth.toFixed(1)}x${tileHeight.toFixed(1)}`);
    }


    function draw() {
        if (video.paused || video.ended) return;

        // const startTime = performance.now();

        // Draw each canvas based on the tile mapping
        for (let canvasIndex = 0; canvasIndex < canvases.length; canvasIndex++) {
            const ctx = contexts[canvasIndex];
            const canvas = canvases[canvasIndex];
            const gridPosition = tileMapping[canvasIndex];
            
            // Calculate row and column from grid position
            const row = Math.floor(gridPosition / gridSize.cols);
            const col = gridPosition % gridSize.cols;
            
            // Calculate source coordinates within the visible video area
            const srcX = videoOffsetX + col * tileWidth;
            const srcY = videoOffsetY + row * tileHeight;
            
            // Draw the tile from the visible portion of the video
            ctx.drawImage(
                video,
                srcX, srcY, tileWidth, tileHeight, // Source rectangle from visible area
                0, 0, canvas.width, canvas.height  // Fill entire canvas
            );
        }
        // const endTime = performance.now();
        // console.log(`${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.${new Date().getMilliseconds().toString().padStart(3, '0')}: Dimension calculation block took: ${endTime - startTime} milliseconds`);

        requestAnimationFrame(draw);
    }
}); 