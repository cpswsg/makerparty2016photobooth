(function() {
                   //Please, get your own as this is limited to 50 uploads an hour! https://imgur.com/register/api_anon
  var
      startbutton  = document.querySelector('#takephoto'),
      video        = document.querySelector('#video'),
      flash        = document.querySelector('#flash'),
      canvas       = document.querySelector('#canvas'),
      vidcontainer = document.querySelector('#videocontainer'),
      tabs         = document.getElementsByClassName('tab'),
      adjective    = document.querySelector('#adjective'),
      urlfield     = document.querySelector('#imgur'),
      timers       = document.querySelectorAll("span[id$='timer']"),
      shareImage;


  var ctx    = canvas.getContext('2d'),
     streaming    = false,
     width  = 606,
     height = 606,
     state  = 'intro';

 var audio = document.querySelectorAll('audio'),
     sounds = {
        shutter: audio[0]
      };

  /* BRANDING */
  var img = new Image(),
      imgwidth = 606,
      imgheight = 606;
  img.src = 'media/images/frame.png';

  setstate(state);

  function init() {

    timers[0].hidden = true;
    timers[1].hidden = true;
    timers[2].hidden = true;

    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
        }
        timers[0].hidden = false;
        timers[1].hidden = false;
        timers[2].hidden = false;
        video.play();
      },
      function(err) {
        console.log("No camera has been found or access to it has been denied! ");
        tabs[1].className = "tab tab-inactive";
        tabs[0].className = "tab tab-active";
        setstate('intro');
      }
    );
  }

 function setstate(newstate) {
    state = newstate;
    document.body.className = newstate;
  }

  function takepicture(callback) {
    sounds.shutter.play();

    ctx.drawImage(video, 35, 77, 535, 402);
    ctx.restore();
    ctx.scale(1, 1);
    ctx.drawImage(img, 606 - imgwidth, 606 - imgheight, imgwidth, imgheight);
    adjective.hidden = true;
    appendAdjective();


    if (callback)
      callback();
  }

  function upload() {
    var head = /^data:image\/(png|jpeg);base64,/,
        fd = new FormData(),
        xhr = new XMLHttpRequest();

    setstate('sharing');

    shareImage = canvas.toDataURL('image/png', 1).replace(head, '');

    fd.append('image', shareImage);

    xhr.open('POST', 'https://api.imgur.com/3/image.json');

    xhr.addEventListener('error', function(ev) {
      console.log('Upload Error!');
    }, false);

    xhr.addEventListener('load', function(ev) {
      try {
        var links = JSON.parse(xhr.responseText);
        urlfield.innerHTML = links.data.link;
        urlfield.href = links.data.link;
        setstate('uploaded');
      } catch(e) {
        console.log('Upload Error!' + e);
      }
    }, false);

    xhr.setRequestHeader("Authorization", "Client-ID a41e1ecad14d783");
    xhr.send(fd);
  }


function shareOrRetake(){
  document.getElementById("timers").hidden = true;
}
  /* Event Handlers */

function appendAdjective(){
  word = document.querySelector('#myfirefox').value;
  ctx.font="24px Open Sans";
  ctx.fillStyle = "#00AFB4";
  ctx.fillText(word,383,537);
}

function timer(time,update,complete) {
    var start = new Date().getTime();
    var interval = setInterval(function() {
        var now = time-(new Date().getTime()-start);
        if( now <= 0) {
            clearInterval(interval);
            complete();
        }
        else update(Math.floor(now/1000));
    },100);
}

video.addEventListener('play', function(ev){
    if (!streaming) {
      console.log(video.clientHeight);
      finalheight = video.clientHeight / (video.clientWidth/width);
      video.setAttribute('width', 539);
      video.setAttribute('height', 470);
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 607 - imgwidth, 606 - imgheight, imgwidth, imgheight);
      streaming = true;
      vidcontainer.classname = 'playing';
      adjective.hidden = false;
    }
  }, false);

startbutton.addEventListener('click', function(ev){
    if (state === 'intro'){
      setstate('picture');
      init();
    }

    if (state === 'reviewing'){
      setstate('picture');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 606 - imgwidth, 606 - imgheight, imgwidth, imgheight);

    }

    tabs[1].className = "tab tab-active";
    tabs[0].className = "tab tab-inactive";

  }, false);


shorttimer.addEventListener('click', function(ev){
  timers[1].hidden = true;
  timers[2].hidden = true;

  timer(3000,
    function(timeleft) {
      timers[0].children[1].innerHTML = timeleft;
    },
    function() {
      timers[1].hidden = false;
      timers[2].hidden = false;
      timers[0].children[1].innerHTML = "3 Seconds";
      setstate('reviewing');
      takepicture(shareOrRetake);
    }
  );
}, false);

mediumtimer.addEventListener('click', function(ev){
  timers[0].hidden = true;
  timers[2].hidden = true;

  timer(5000,
    function(timeleft) {
      timers[1].children[1].innerHTML = timeleft;
    },
    function() {
      timers[0].hidden = false;
      timers[2].hidden = false;
      timers[1].children[1].innerHTML = "5 Seconds";
      setstate('reviewing');
      takepicture(shareOrRetake);
    }
  );
}, false);

longtimer.addEventListener('click', function(ev){
  timers[0].hidden = true;
  timers[1].hidden = true;

  timer(10000,
    function(timeleft) {
       timers[2].children[1].innerHTML = timeleft;
    },
    function() {
      timers[0].hidden = false;
      timers[1].hidden = false;
      timers[2].children[1].innerHTML = "10 Seconds";
      setstate('reviewing');
      takepicture(shareOrRetake);
    }
  );
}, false);

retake.addEventListener('click', function(ev){
  document.querySelector('#takephoto').click();
  adjective.removeAttribute('hidden');
}, false);

share.addEventListener('click', function(ev){
  tabs[2].className = "tab tab-active";
  tabs[1].className = "tab tab-inactive";
  video = null;
  upload();
}, false);


twittershare.addEventListener('click', function(ev){
  var textToTweet = "Eu criei uma arte licenciada sob " + document.querySelector('#myfirefox').value + ". " + "🤘😜📢 " + "#MakerParty #MPWeekCampinas " + urlfield.href ;
  var twtLink = 'http://twitter.com/home?status=' +encodeURIComponent(textToTweet);
  window.open(twtLink,'_blank');
}, false);

})();
