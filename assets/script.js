
window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-3YW9C78ZXL');

window.onload = () => {
    location.hash = '#toggle';
    };

var usrlang = (navigator.language || navigator.userLanguage).toLowerCase();

if (usrlang === "ru") {
    window.location = "ru/index.html";
} 
else if (usrlang === "id") {
    window.location = "id/index.html";
} 
else if (usrlang === "zh") {
    window.location = "zh/index.html";
} 
else {
    return;
}

document.body.addEventListener('click', () => {

    let hash = location.hash;
    
    if(hash == '#toggle') {
        location.hash = '#toggle2';
    } 
    else if (hash == '#toggle2') {
        location.hash = '#toggle';
    } 
    else {
        location.hash = '#toggle';
    }
    
});

function redirect(){
    document.getElementById('bg').style.animation = "fall 2s ease-out forwards"; 

    setTimeout(() => {
    window.location = "one.html"; 
    }, 2000);
}