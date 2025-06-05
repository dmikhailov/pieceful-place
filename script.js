document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    video.play();
    const gridContainer = document.getElementById('gridContainer');
    const shuffleBtn = document.getElementById('shuffleBtn');
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

        const srcWidth = video.videoWidth / gridSize.cols;
        const srcHeight = video.videoHeight / gridSize.rows;

        // Draw each canvas based on the tile mapping
        for (let canvasIndex = 0; canvasIndex < canvases.length; canvasIndex++) {
            const ctx = contexts[canvasIndex];
            const gridPosition = tileMapping[canvasIndex];
            
            // Calculate row and column from grid position
            const row = Math.floor(gridPosition / gridSize.cols);
            const col = gridPosition % gridSize.cols;
            
            // Draw the corresponding portion of the video
            ctx.drawImage(
                video,
                col * srcWidth, row * srcHeight, srcWidth, srcHeight, // Source rectangle
                0, 0, canvases[canvasIndex].width, canvases[canvasIndex].height  // Destination rectangle
            );
        }

        requestAnimationFrame(draw);
    }
}); 