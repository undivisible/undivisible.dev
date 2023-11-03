function mouseover() {
   

    
}

document.addEventListener("DOMContentLoaded", function() {

  const text = document.getElementById("text");
  const links = document.getElementById("links");
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const link = document.querySelectorAll("#link");
  
  function updateText() {
    (function () {
        var names = ["max","mack","maxim","maximus","祁明思","максим" ],
        i = 0;
        setInterval(function(){ $('#names').fadeOut(function(){
            $(this).html(names[(i = (i + 1) % names.length)]).fadeIn();
          }); }, 3000)
        var greetings = ["hello!","здравствуй!","你好！","hey!","доброе день" ],
        i2 = 0;
        setInterval(function(){ $('#greetings').fadeOut(function(){
            $(this).html(greetings[(i2 = (i2 + 1) % greetings.length)]).fadeIn();
          }); }, 3000)
        var jobs = ["student","developer","entrepreneur","video editor" ],
        i3 = 0;
        setInterval(function(){ $('#jobs').fadeOut(function(){
            $(this).html(jobs[(i3 = (i3 + 1) % jobs.length)]).fadeIn();
        }); }, 3000)
        var langs = ["english","russian","cantonese","chinese","indonesian" ],
        i4 = 0;
        setInterval(function(){ $('#langs').fadeOut(function(){
            $(this).html(langs[(i4 = (i4 + 1) % langs.length)]).fadeIn();
        }); }, 3000)
        var code = ["html and css","javascript","python","c#" ],
        i5 = 0;
        setInterval(function(){ $('#code').fadeOut(function(){
            $(this).html(code[(i5 = (i5 + 1) % code.length)]).fadeIn();
        }); }, 3000)
    })();
  }

  function updateLinks() {
    links.addEventListener("mouseover", function(){
        text.style.animation = "linksr 0.5s ease-in forwards";
        links.style.animation = "links 0.5s ease-in forwards";
    });

    links.addEventListener("mouseout", function(){
        text.style.animation = "links 0.5s ease-out forwards";
        links.style.animation = "linksr 0.5s ease-out forwards";
    });
  }

  function updateMouseOver() {
    link.forEach(link => {
        let interval = null;

        link.onmouseover = event => {  
            let iteration = 0;
            
            clearInterval(interval);
            
            interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                  .split("")
                  .map((letter, index) => {
                    if(index < iteration) {
                      return event.target.dataset.value[index];
                    }
                  
                    return letters[Math.floor(Math.random() * 26)]
                  })
                  .join("");
                
                if(iteration >= event.target.dataset.value.length){ 
                  clearInterval(interval);
                }
                
                iteration += 1 / 3;
            }, 30);
        }
    });
  }

  updateText();
  updateLinks();
  updateMouseOver();
  
});