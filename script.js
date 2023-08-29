
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

const element1 = document.querySelector('#cur');
const element2 = document.querySelector('#elem');

element1.addEventListener('mousemove', (event) => {
    const element1Rect = element1.getBoundingClientRect();
    const element2Rect = element2.getBoundingClientRect();

    if (
    event.clientX >= element2Rect.left &&
    event.clientX <= element2Rect.right &&
    event.clientY >= element2Rect.top &&
    event.clientY <= element2Rect.bottom
    ) {
    element1.style.Color = '#3B4252'; /* Change color on hover */
    } else {
    element1.style.Color = '#ffffff'; /* Reset color if not hovering */
    }
});
        