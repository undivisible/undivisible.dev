var currentTheme = "taiga";
var once2 = false;
const palette = document.getElementById('color');

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value) {
    document.cookie = name + '=' + (value || '') + '; path=/';
}

function randoms() {
    const links = document.querySelectorAll('.link');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            for (let i = 1; i <= 12; i++) {
                document.documentElement.style.setProperty(`--rotate${i}`, Math.floor(Math.random() * 201) - 100 + 'deg');
                document.documentElement.style.setProperty(`--loc${i}`, Math.floor(Math.random() * 201) - 100 + '%');
                document.documentElement.style.setProperty(`--loctwo${i}`, Math.floor(Math.random() * 201) - 100 + '%');
            }
        });
    });
}

function toggleTheme() {
    const body = document.body;
    switch (currentTheme) {
        case 'taiga':
            body.classList.add('dark');
            body.classList.remove('taiga');
            currentTheme = 'dark';
            setCookie('theme', 'dark');
            break;
        case 'dark':
            body.classList.add('nord');
            body.classList.remove('taiga');
            currentTheme = 'nord';
            setCookie('theme', 'nord');
            break;
        case 'nord':
            body.classList.add('sepia');
            body.classList.remove('nord');
            currentTheme = 'sepia';
            setCookie('theme', 'sepia');
            break;
        case 'sepia':
            body.classList.add('light');
            body.classList.remove('sepia');
            currentTheme = 'light';
            setCookie('theme', 'light');
            break;
        case 'light':
            body.classList.add('taiga');
            body.classList.remove('light');
            currentTheme = 'taiga';
            setCookie('theme', 'taiga');
            break;
    }
    palette.innerHTML = currentTheme;
    fancyText(['color']);
}

function swap(page, backing, back) {
    var bg = document.getElementById(backing);
    const elementIds = ["sticky", "intro", "see", "about"];
    

    if (!back) {
        elementIds.forEach(function(id) {
            const element = document.getElementById(id);
            element.style.animation = 'onexit 1s ease-out forwards';
        });
        bg.style.animation = 'swap 3s ease-in forwards';
    }
    else {
        const wrapper = document.getElementById("wrapper");
        wrapper.style.animation = 'onexit 1.5s ease-out forwards';
        setTimeout(() => {
            document.body.style.animation = 'exit 1.5s ease-in forwards'; 
        }, 1500);
        onexternal = false;
    }
    setTimeout(() => {
        window.location.href = page;
        let pageloc = page;
    }, 3000);
}

function lang() {
    
}

function showLinks() {
    
}

function fancyText(elementIds) {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const enhance = id => {
        const element = document.getElementById(id);
        if (!element) return;

        const text = element.innerText.split('');
        element.innerText = '';

        text.forEach((value, index) => {
            const outer = document.createElement('span');
            outer.className = 'outer';

            const inner = document.createElement('span');
            inner.className = 'inner';
            inner.style.animationDelay = `${rand(-5000, 0)}ms`;

            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.innerText = value;
            letter.style.animationDelay = `${index * 100}ms`;

            inner.appendChild(letter);
            outer.appendChild(inner);
            element.appendChild(outer);
        });
    };

    elementIds.forEach(id => enhance(id));
}

function updateText() {
    var names = ['max lee carter', 'максим ли раймондович картер', '祁明思', 'مكس لي ابن ريمون ال كعطار'];
    var jobs = ['student', 'developer', 'entrepreneur', 'video editor'];
    var langs = ['cantonese', 'english', 'russian', 'mandarin', 'indonesian'];
    var code = ['type/javascript', 'python', 'c#', 'html+css'];

    let n = 1, j = 1, l = 1, c = 1;
    setInterval(() => {
        $('#names').fadeOut(() => $('#names').html(names[(n++ % names.length)]).fadeIn());
        $('#jobs').fadeOut(() => $('#jobs').html(jobs[(j++ % jobs.length)]).fadeIn());
        $('#langs').fadeOut(() => $('#langs').html(langs[(l++ % langs.length)]).fadeIn());
        $('#code').fadeOut(() => $('#code').html(code[(c++ % code.length)]).fadeIn());
    }, 3000);
}

document.addEventListener("DOMContentLoaded", function() {
    const savedTheme = getCookie('theme');
    const onexternal = getCookie('external');
    const location = getCookie('location');
    if (savedTheme) {
        const body = document.body;
        body.classList.add(savedTheme);
        currentTheme = savedTheme;
        palette.innerHTML = currentTheme;
    }
    fancyText(["color", "tg", "ig", "gh", "email", "all", "back", "abouthover"]); // Pass an array of element IDs
    updateText();
    randoms();
    if (onexternal == 'true') {
        var see = document.getElementById('see');
        var about = document.getElementById('about');
        var greet = document.getElementById('greet');
        var onel = document.getElementById('onel');
        var twol = document.getElementById('twol');
        if (location = "see") {
            see.style.animation('popup');
            greet.html('skills, education and experience');
            onel.innerHTML = '';
            twol.innerHTML = '';
        }
        else if (location = "about") {
            see.style.animation('popup');
            greet.innerHTML = 'skills, education and experience';
            onel.innerHTML = '';
            twol.innerHTML = '';
        }
    }
});
  
