
function initCursor() {
    // Calculate the maximum X and Y coordinates
    const maxX = window.innerWidth - 5; // Subtract a small value to keep the cursor fully visible
    const maxY = window.innerHeight - 5;
  
    // Cursor
    document.addEventListener('mousemove', handleMove); 
  
    function handleMove(e) {
        // Update dot cursor 
        const dotCursor = document.querySelector('.dot-cursor');
        dotCursor.style.left = Math.min(maxX, e.pageX) + 'px';
        dotCursor.style.top = Math.min(maxY, e.pageY) + 'px';
    }
  }
  
// Initialize the cursor after the DOM is loaded
window.addEventListener('DOMContentLoaded', initCursor);

initCursor();

window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-3YW9C78ZXL');