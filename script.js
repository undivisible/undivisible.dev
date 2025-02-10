function updateText() {
    let greetings = ['Assalamualaikum!', 'Ассалам Алейкум!', '哈喽！', 'السالم عليكم', 'שלום'],
        names = ['Abdurrahman', 'Абдуррахман', '明思', 'مبد الرحمن', 'עבד הרחמן'],
        jobs = ['a full stack web developer', 'a director', 'a photographer and videographer', 'a student', 'a thinker'],
        langs = ['<span>speak</span> English', '<span>speak</span> Cantonese', '<span>speak</span> Mandarin Chinese', '<span>speak</span> Russian', '<span>speak</span> Indonesian', '<span>learn</span> Arabic', '<span>learn</span> Hebrew'],
        n = 0, j = 0, l = 0;

    $('#greetings').html(greetings[n]);
    $('#names').html(names[n]);
    $('#nameso').html(nameso[n]);
    $('#jobs').html(jobs[j]);
    $('#langs').html(langs[l]);

    setTimeout(function update() {
        n = (n + 1) % names.length;
        j = (j + 1) % jobs.length;
        l = (l + 1) % langs.length;

        $('#greetings, #names, #jobs, #langs').fadeOut(500, function () {
            $('#greetings').html(greetings[n]);
            $('#names').html(names[n]);
            $('#nameso').html(nameso[n]);
            $('#jobs').html(jobs[j]);
            $('#langs').html(langs[l]);
            $('#greetings, #names, #jobs, #langs').fadeIn(500);
        });

        setTimeout(update, 4000);
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    updateText();
});
