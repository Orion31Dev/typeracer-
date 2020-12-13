let cIndex = 0;
let uIndex = 0;
let codeTxt = "";
let username = "";

let typeCode = true;

const btn = document.getElementById('join');

const cl = document.getElementById('code-label');
const ul = document.getElementById('user-label');

document.addEventListener('keydown', (e) => {

  const key = e.key;

  if (key === ' ') {
    typeCode = !typeCode;
    if (typeCode) {
      ul.classList.add('dark');
      cl.classList.remove('dark');

      if (cIndex < 5) c(cIndex).classList.add('c-cursor');
      if (uIndex < 4) u(uIndex).classList.remove('c-cursor');
    } else {
      cl.classList.add('dark');
      ul.classList.remove('dark');

      if (uIndex < 4) u(uIndex).classList.add('c-cursor');
      if (cIndex < 5) c(cIndex).classList.remove('c-cursor');
    }
  }

  if (key === 'Enter' && cIndex === 5) {
    btn.click();
  }

  if (typeCode) {
    // Check to make sure the key is alphanumeric
    if (key.match(/^[a-zA-Z]+$/) && key.length === 1 && cIndex < 5) {
      let cl = c(cIndex);

      cl.innerHTML = key;
      cl.classList.add('correct');

      codeTxt += key;

      cl.classList.remove('c-cursor');
      if (cIndex !== 4) c(cIndex + 1).classList.add('c-cursor');

      cIndex++;
      if (cIndex === 5) {
        btn.classList.add('active');
      }
    } else if (key === 'Backspace' && cIndex > 0) {
      let cl = c(cIndex - 1);

      codeTxt = codeTxt.substring(0, codeTxt.length - 1);

      if (cIndex !== 5) c(cIndex).classList.remove('c-cursor');
      cl.classList.add('c-cursor');

      cl.classList.remove('correct');

      cIndex--;

      btn.classList.remove('active');
    }
  } else {
    // Check to make sure the key is alphanumeric
    if (key.match(/^[a-zA-Z]+$/) && key.length === 1 && uIndex < 4) {
      let ul = u(uIndex);

      ul.innerHTML = key;
      ul.classList.add('correct');

      username += key;

      ul.classList.remove('c-cursor');
      if (uIndex !== 3) u(uIndex + 1).classList.add('c-cursor');

      uIndex++;
      setCookie('username', username, 1);
    } else if (key === 'Backspace' && uIndex > 0) {
      let ul = u(uIndex - 1);

      username = username.substring(0, username.length - 1);

      if (uIndex !== 4) u(uIndex).classList.remove('c-cursor');
      ul.classList.add('c-cursor');

      ul.classList.remove('correct');

      uIndex--;
    }
  }
});

btn.addEventListener('click', () => {
  if (btn.classList.contains('active')) {
    if (username === '') setCookie('username', 'epic', 1);

    window.location.href = '/' + codeTxt;
  }
})

// Get code letter at index
function c(index) {
  return document.getElementById('c' + index);
}

// Get user letter at index
function u(index) {
  return document.getElementById('u' + index);
}

// Get from cookie
function loadUsername() {
  let un = getCookie('username');
  username = un;

  un = un.split('');
  for (let i = 0; i < un.length; i++) {
    u(i).innerHTML = un[i];
    u(i).classList.add('correct');

    uIndex++;
  }
}

loadUsername();