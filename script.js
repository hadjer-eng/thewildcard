// ---------- Elements ----------
const accountsInput = document.getElementById('accounts');
const countEl   = document.getElementById('count');
const errorEl   = document.getElementById('error');
const drawBtn   = document.getElementById('drawBtn');
const againBtn  = document.getElementById('againBtn');
const backBtn   = document.getElementById('backBtn');
const setup     = document.getElementById('setup');
const stage     = document.getElementById('stage');
const stageText = document.getElementById('stageText');
const deck      = document.getElementById('deck');
const actions   = document.getElementById('actions');

const SUITS = ['♠', '♥', '♦', '♣'];
const BACK = '<span class="back-mark">♠</span>';

let busy = false;

// ---------- 1. Clean the list ----------
function parseAccounts(text) {
    const valid = [];
    const seen = new Set();

    text.split(/[\n,;\s]+/).forEach(function (raw) {
        let name = raw.trim().toLowerCase();
        if (!name) return;

        name = name.replace(/^https?:\/\//, '')
                   .replace(/^(www\.)?instagram\.com\//, '')
                   .replace(/[\/?].*$/, '')
                   .replace(/^@+/, '');

        if (/^[a-z0-9._]{1,30}$/.test(name) && !seen.has(name)) {
            seen.add(name);
            valid.push(name);
        }
    });
    return valid;
}

accountsInput.addEventListener('input', function () {
    const n = parseAccounts(accountsInput.value).length;
    countEl.textContent = n + (n === 1 ? ' account' : ' accounts');
    errorEl.textContent = '';
});

// ---------- 2. Fair random number ----------
function randomIndex(max) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
}

// ---------- 3. Build the 5 cards ----------
function buildDeck(winner, suit) {
    const isRed = suit === '♥' || suit === '♦';
    deck.className = 'deck';
    deck.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const card = document.createElement('div');
        card.className = 'pcard' + (i === 2 ? ' chosen' : '');
        card.style.setProperty('--i', i);

        card.innerHTML =
            '<div class="face back">' + BACK + '</div>' +
            '<div class="face front' + (isRed ? ' red' : '') + '">' +
                '<span class="corner tl">A<br>' + suit + '</span>' +
                '<span class="pcard-name"></span>' +
                '<span class="corner br">A<br>' + suit + '</span>' +
            '</div>';

        if (i === 2) card.querySelector('.pcard-name').textContent = '@' + winner;
        deck.appendChild(card);
    }
}

// ---------- 4. The trick ----------
function reveal(list) {
    if (busy) return;
    busy = true;

    const winner = list[randomIndex(list.length)];
    const suit = SUITS[randomIndex(SUITS.length)];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setup.classList.add('hidden');
    stage.classList.remove('hidden');
    actions.classList.add('hidden');

    buildDeck(winner, suit);
    stageText.textContent = 'Watch closely…';
    deck.classList.add('shuffling');

    setTimeout(function () {
        deck.classList.remove('shuffling');
        deck.classList.add('picked');
        stageText.textContent = 'Now you see me.';

        setTimeout(function () {
            actions.classList.remove('hidden');
            busy = false;
        }, reduce ? 0 : 1100);
    }, reduce ? 0 : 2600);
}

// ---------- Buttons ----------
function startDraw() {
    const list = parseAccounts(accountsInput.value);
    if (list.length < 2) {
        errorEl.textContent = 'Add at least 2 different accounts.';
        return;
    }
    reveal(list);
}

drawBtn.addEventListener('click', startDraw);
againBtn.addEventListener('click', startDraw);

backBtn.addEventListener('click', function () {
    stage.classList.add('hidden');
    setup.classList.remove('hidden');
    accountsInput.focus();
});