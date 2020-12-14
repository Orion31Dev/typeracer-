let index = 0, words, wrong = 0, last;
let running;
let sec = 0, min = 0;
let timer;

let oppTime = -1;
let oppPos = 0;

const text = document.getElementById('text');
const st = document.getElementById('sec');
const mt = document.getElementById('min');

const statDiv = document.getElementById('stats');
const wpm = document.getElementById('wpm');
const cpm = document.getElementById('cpm');
const acc = document.getElementById('acc');
const timeStat = document.getElementById('time');

const caps = document.getElementById('caps-lock');

let stats = new Stats();

const room = window.location.href.split('/')[window.location.href.split('/').length - 1];

function genTest() {
  let html = `<div class='word'>`;

  let i = 0;
  words.split('').forEach(l => {
    if (l === ' ') html += `</div><div class="word">`;

    if (i === 0) html += `<div class="letter curs-fade" id='l${i}'>${l}</div>`;
    else html += `<div class="letter" id='l${i}'>${l}</div>`;

    i++;
  });

  last = i;

  html += '</div>'
  text.innerHTML = html;
}

function initTest() {
  running = false;
  genTest();

  st.classList = "";
  mt.classList = "";
}

function preStart(s) {
  running = false;

  st.classList.remove('txt-end');
  mt.classList.remove('txt-end');

  sec = parseInt(s);
  min = 0;

  mt.innerHTML = 'T-';
  st.innerHTML = ((sec < 10) ? '0' : '') + sec.toString();

  // Fade out the stats 3s before the game starts
  setTimeout(() => {
    statDiv.style.opacity = '0';
    stats = new Stats();
  }, sec * 1000 - 3000);

  timer = setInterval(() => {
    sec--;
    if (sec < 0) {
      clearInterval(timer);
      start();
      return;
    }


    mt.innerHTML = 'T-';
    st.innerHTML = ((sec < 10) ? '0' : '') + sec.toString();

  }, 1000);
}

function start() {
  running = true;

  index = 0;
  wrong = 0;
  oppTime = -1;
  oppPos = 0;

  st.classList.add('txt-active');

  mt.innerHTML = '0:';

  l(0).classList.add('cursor');

  timer = setInterval(() => {
    sec++;
    if (sec >= 60) {
      sec %= 60;
      min++;

      if (min === 1) {
        mt.classList.add('txt-active');
      }
    }

    mt.innerHTML = min.toString() + ':';
    st.innerHTML = ((sec < 10) ? '0' : '') + sec.toString();

  }, 1000);
}

function end() {
  st.classList.add('txt-end');
  mt.classList.add('txt-end');

  clearInterval(timer);

  let time = min * 60 + sec;

  statDiv.style.opacity = '1';

  wpm.innerHTML = stats.wpm(time).toString();
  cpm.innerHTML = stats.cpm(time).toString();
  acc.innerHTML = stats.acc() + '%';
  timeStat.innerHTML = min + ':' + ((sec < 10) ? '0' : '') + sec.toString();

  socket.emit('result', time);


  if (oppTime !== -1) {
    document.getElementById('results').innerHTML = `you lost by ${time - oppTime}s`;
  }

  running = false;
}

function letterCallback(newOpp) {
  l(oppPos).classList.remove('opp-pos');

  if (l(newOpp) === null) return;

  l(newOpp).classList.add('opp-pos');

  oppPos = newOpp;
}

function textCallback(txt) {
  words = txt;
  initTest();
}

function oppCallback(txt) {
  document.querySelector('.opponent span').innerHTML = txt;
}

function resultCallback(txt) {
  oppTime = parseInt(txt);

  if (!running) document.getElementById('results').innerHTML = `you win by ${oppTime - (min * 60 + sec)}s`;
}

document.addEventListener('keydown', (e) => {
  if (!running) return;

  let key = e.key;
  const cl = l(index);

  // Caps Lock Warning
  if (e.getModifierState('CapsLock')) caps.style.display = 'inline';
  else caps.style.display = 'none';


  // If the user hits backspace after making a mistake (wrong > 0), then delete that mistake
  if (wrong > 0 && key === 'Backspace') {
    wrong--;
    w(wrong).remove();
    return;
  }

  // Check to make sure the key is alphanumeric, space, or apostrophe
  if (key.match(/^[a-zA-Z"'\s]+$/) && key.length === 1) {

    // If the user types in the correct letter, move to the next one
    if (cl.innerHTML === key && wrong === 0) {

      // Make the correct letter show up white, not gray
      cl.classList.add('correct');

      index++;

      // Send the letter index to the server
      emit('letter', index);

      // If the player has typed in the last letter, end the game.
      if (index === last) {
        end();
        cl.classList.remove('cursor'); // delete the cursor

        return;
      }

      stats.correct++;

      // If the player types the wrong key, and that key is not a space, it is wrong
    } else if (key !== ' ') {

      // Create a new letter, in red, that displays the user's mistake, and appends it where they typed it
      let w = document.createElement('DIV');
      w.classList.add('letter');
      w.classList.add('incorrect');
      w.id = "w" + wrong;
      w.innerHTML = key;

      // Increase the recorded number of mistakes
      wrong++;

      stats.incorrect++;

      // Append the mistake to the last correct letter, so that the wrong letter is inserted
      // into the word where the user made the mistake
      if (index > 0) l(index - 1).appendChild(w);
      // If the user made a mistake on the first letter, there is no previous letter to
      // append the wrong letter to, so inserted it before the first letter.
      else {
        let n = l(index);
        n.parentNode.insertBefore(w, n);
      }
    }

    // Update cursor position
    cl.classList.remove('cursor');
    l(index).classList.add('cursor');
  }
});

// Get letter at index
function l(index) {
  return document.getElementById('l' + index);
}

// Get wrong letter at wrong index
function w(index) {
  return document.getElementById('w' + index);
}

// Initial setup
const username = getCookie('username');
document.querySelector('.room-code span').innerHTML = room;
document.querySelector('.username span').innerHTML = username;

emit('join', room + ':' + username);

setCallback('letter', letterCallback);
setCallback('text', textCallback);
setCallback('opponent', oppCallback);
setCallback('result', resultCallback);
setCallback('start', preStart);