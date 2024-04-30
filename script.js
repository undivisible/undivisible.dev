let currentTheme = 'dark';
let once2 = false;

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
        case 'dark':
            body.classList.add('nord');
            body.classList.remove('dark');
            currentTheme = 'nord';
            break;
        case 'nord':
            body.classList.add('sepia');
            body.classList.remove('nord');
            currentTheme = 'sepia';
            break;
        case 'sepia':
            body.classList.add('light');
            body.classList.remove('sepia');
            currentTheme = 'light';
            break;
        case 'light':
            body.classList.add('dark');
            body.classList.remove('light');
            currentTheme = 'dark';
            break;
    }
}

function swap(page, backing, back) {
    var bg = document.getElementById(backing);
    if (!back) {
        bg.style.animation = 'swap 3s ease-in forwards';
    }
    else {
        bg.style.animation = 'back 3s ease-in forwards';
    }
    setTimeout(() => {
        window.location.href = page;
    }, 3000);
}

function showLinks() {
    // Add code to show all links
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

    let n = 0, j = 0, l = 0, c = 0;
    setInterval(() => {
        $('#names').fadeOut(() => $('#names').html(names[(n++ % names.length)]).fadeIn());
        $('#jobs').fadeOut(() => $('#jobs').html(jobs[(j++ % jobs.length)]).fadeIn());
        $('#langs').fadeOut(() => $('#langs').html(langs[(l++ % langs.length)]).fadeIn());
        $('#code').fadeOut(() => $('#code').html(code[(c++ % code.length)]).fadeIn());
    }, 3000);
}

document.addEventListener("DOMContentLoaded", function() {
  fancyText(["color", "tg", "ig", "gh", "email", "all", "back"]); // Pass an array of element IDs
  updateText();
  randoms();
});
  
