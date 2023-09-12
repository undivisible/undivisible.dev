window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-3YW9C78ZXL');

window.onload = () => {
    location.hash = '#toggle';
    };

document.body.addEventListener('click', () => {

    let hash = location.hash;
    
    if(hash == '#toggle') {
        location.hash = '#toggle2';
    } else if (hash == '#toggle2') {
        location.hash = '#toggle';
    } else {
        location.hash = '#toggle';
    }
    
});

function redirect(){
    document.getElementById('bg').style.animation = "fall 2s ease-out forwards"; 

    setTimeout(() => {
    window.location = "one.html"; 
    }, 2000);
}