document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    video.play();
    const gridContainer = document.getElementById('gridContainer');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const audioBtn = document.getElementById('audioBtn');
    const shoreAudio = document.getElementById('shoreAudio');
    const hoverTrigger = document.getElementById('hoverTrigger');
    const gridSize = { rows: 3, cols: 5 };
    const canvases = [];
    const contexts = [];
    
    // Create mapping array for shuffle functionality
    // Each index represents a canvas, value represents which grid position it displays
    let tileMapping = [];
    
    // Drag and drop state
    let dragState = {
        isDragging: false,
        draggedCanvasIndex: -1,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    };

    // Create canvas elements
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

    // Setup drag and drop for a canvas
    function setupDragAndDrop(canvas, canvasIndex) {
        // Mouse events
        canvas.addEventListener('mousedown', (e) => startDrag(e, canvasIndex));
        document.addEventListener('mousemove', (e) => handleDrag(e));
        document.addEventListener('mouseup', (e) => endDrag(e));
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDrag(touch, canvasIndex);
        });
        document.addEventListener('touchmove', (e) => {
            if (dragState.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                handleDrag(touch);
            }
        });
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            endDrag(e);
        });
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

    // Shuffle button event listener
    shuffleBtn.addEventListener('click', () => {
        tileMapping = shuffleArray(tileMapping);
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Update fullscreen button text when fullscreen state changes
    document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
        
        // Add or remove fullscreen mode class
        if (document.fullscreenElement) {
            document.body.classList.add('fullscreen-mode');
            setupFullscreenHover();
            // Auto-enable audio when entering fullscreen
            if (audioMuted) {
                toggleAudio();
            }
        } else {
            document.body.classList.remove('fullscreen-mode', 'show-controls');
            cleanupFullscreenHover();
            // Auto-disable audio when exiting fullscreen
            if (!audioMuted) {
                toggleAudio();
            }
        }
    });

    // Shore audio control functionality
    let audioMuted = true; // Start muted by default
    let audioVolume = 0.3; // Default volume
    let audioStarted = false;
    
    // Set initial volume and muted state
    shoreAudio.volume = audioVolume;
    shoreAudio.muted = true;
    
    // Function to start audio (needed for browser autoplay policy)
    function startAudio() {
        if (!audioStarted) {
            shoreAudio.play().catch(err => {
                console.log('Audio autoplay prevented:', err);
            });
            audioStarted = true;
        }
    }
    
    // Start audio on first user interaction
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
    
    // Function to toggle audio state
    function toggleAudio() {
        if (audioMuted) {
            // Unmute
            startAudio(); // Ensure audio is started
            shoreAudio.volume = audioVolume;
            shoreAudio.muted = false;
            audioBtn.innerHTML = '🔊 Shore Audio';
            audioBtn.style.backgroundColor = '#17a2b8';
            audioMuted = false;
        } else {
            // Mute
            shoreAudio.muted = true;
            audioBtn.innerHTML = '🔇 Shore Audio';
            audioBtn.style.backgroundColor = '#6c757d';
            audioMuted = true;
        }
    }
    
    audioBtn.addEventListener('click', toggleAudio);

    // Keyboard shortcut for audio toggle (spacebar)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('button, input, textarea')) {
            e.preventDefault();
            audioBtn.click();
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
        // Set canvas sizes and pre-calculate dimensions
        const srcWidth = video.videoWidth / gridSize.cols;
        const srcHeight = video.videoHeight / gridSize.rows;
        
        canvases.forEach(canvas => {
            canvas.width = srcWidth;
            canvas.height = srcHeight;
        });

        // Start animation
        requestAnimationFrame(draw);
    });

    function draw() {
        if (video.paused || video.ended) return;

        // Get current page dimensions
        const pageWidth = window.innerWidth;
        const pageHeight = window.innerHeight;
        const pageAspectRatio = pageWidth / pageHeight;
        
        // Get video dimensions
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const videoAspectRatio = videoWidth / videoHeight;
        
        // Calculate which part of the video is visible for this page resolution
        let visibleVideoWidth, visibleVideoHeight, videoOffsetX, videoOffsetY;
        
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
        const tileWidth = visibleVideoWidth / gridSize.cols;
        const tileHeight = visibleVideoHeight / gridSize.rows;

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

        requestAnimationFrame(draw);
    }
}); 