const suits = ['♠','♥','♦','♣'];
const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

let deck = [];
let hands = [[],[],[],[]];
let scores = [0,0,0,0];
let currentPlayer = 0;

const handEl = document.getElementById('hand');
const trickCardsEl = document.getElementById('trickCards');
const messageEl = document.getElementById('message');
const newRoundBtn = document.getElementById('newRound');
const scoreEls = [
  document.getElementById('score0'),
  document.getElementById('score1'),
  document.getElementById('score2'),
  document.getElementById('score3')
];

const playerNameInput = document.getElementById('playerName');
const setNameBtn = document.getElementById('setName');
const portraitHolder = document.getElementById('portraitHolder');

let playerName = 'You';

function buildDeck(){ deck = []; for (const s of suits) for (const r of ranks) deck.push({suit:s, rank:r, code:`${r}${s}`}); }
function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
function deal(){ buildDeck(); shuffle(deck); for (let i=0;i<4;i++) hands[i]=[]; for (let i=0;i<52;i++) hands[i%4].push(deck[i]); hands[0].sort((a,b)=> a.suit.localeCompare(b.suit) || ranks.indexOf(a.rank)-ranks.indexOf(b.rank)); }

function renderHand(){ handEl.innerHTML=''; hands[0].forEach((card,idx)=>{ const d=document.createElement('div'); d.className='card '+(card.suit==='♥'?'hearts':(card.suit==='♠'?'spades':'')); d.dataset.index=idx; d.innerHTML=`<div class="top">${card.code}</div><div class="bottom">${card.suit}</div>`; d.addEventListener('click',()=>playCard(0,idx)); handEl.appendChild(d); }); }

function playCard(playerIndex, cardIndex){ const card=hands[playerIndex].splice(cardIndex,1)[0]; const el=document.createElement('div'); el.className='card small '+(card.suit==='♥'?'hearts':(card.suit==='♠'?'spades':'')); el.textContent=card.code; el.dataset.player=playerIndex; trickCardsEl.appendChild(el); messageEl.textContent=`Player ${playerIndex} played ${card.code}`; if (playerIndex===0) renderHand(); currentPlayer=(playerIndex+1)%4; if (currentPlayer!==0) setTimeout(()=>botPlay(currentPlayer),500); if (trickCardsEl.children.length===4) setTimeout(resolveTrick,700); }

function botPlay(idx){ const h=hands[idx]; if (!h||h.length===0) return; const choice=Math.floor(Math.random()*h.length); playCard(idx,choice); }

function resolveTrick(){ const cards=Array.from(trickCardsEl.children).map(n=>({player:Number(n.dataset.player), code:n.textContent})); const leadSuit=cards[0].code.slice(-1); let winner=cards[0].player; let bestRank=ranks.indexOf(cards[0].code.slice(0,-1)); for (let i=1;i<cards.length;i++){ const txt=cards[i].code; const suit=txt.slice(-1); const rank=ranks.indexOf(txt.slice(0,-1)); if (suit===leadSuit && rank>bestRank){ bestRank=rank; winner=cards[i].player; } } let points=0; for (const c of cards){ if (c.code.endsWith('♥')) points+=1; if (c.code==='Q♠') points+=13; } scores[winner]+=points; messageEl.textContent=`Player ${winner} won the trick (+${points} pts)`; updateScores(); showWinnerDecor(winner); trickCardsEl.innerHTML=''; currentPlayer=winner; if (hands[0].length===0) endRound(); else if (currentPlayer!==0) setTimeout(()=>botPlay(currentPlayer),500); }


function showWinnerDecor(winner){

  const prev = document.getElementById('winnerDecor');
  if(prev) prev.remove();


  const svg = `data:image/svg+xml;utf8,` + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>
      <g fill='none' stroke='%23c59a00' stroke-width='1.2'>
        <path d='M7 4v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V4' fill='%23ffd54a' stroke='none'/>
        <path d='M8 7a3 3 0 0 1-3 3' stroke='%23c59a00' />
        <path d='M16 7a3 3 0 0 0 3 3' stroke='%23c59a00' />
        <rect x='9' y='14' width='6' height='2' fill='%23ffb74d' stroke='none'/>
      </g>
    </svg>
  `);

  const img = document.createElement('img');
  img.id = 'winnerDecor';
  img.src = svg;
  img.alt = 'trophy';
  img.style.marginTop = '8px';
  img.style.width = '48px';
  img.style.height = '48px';
  trickCardsEl.appendChild(img);

  // briefly highlight winner's score element via a CSS class toggle
  const el = scoreEls[winner];
  if(el){
    el.classList.add('highlightWinner');
    setTimeout(()=>el.classList.remove('highlightWinner'),1200);
  }
}

function updateScores(){ for (let i=0;i<4;i++) scoreEls[i].textContent=`${i===0?playerName:(i===1?'West':i===2?'North':'East')}: ${scores[i]}`; }

function endRound(){ messageEl.textContent='Round complete. Click Deal & New Round to play again.'; updateScores(); }

newRoundBtn.addEventListener('click', ()=>{ trickCardsEl.innerHTML=''; messageEl.textContent='Dealing...'; deal(); renderHand(); currentPlayer=0; messageEl.textContent='Your turn — pick a card.'; });

// Event listener: Set player name (user input)
setNameBtn.addEventListener('click', ()=>{
  const v = playerNameInput.value.trim();
  if(v.length>0){
    playerName = v;
    updateScores();
    messageEl.textContent = `Hello ${playerName}! Game ready.`;
    // dynamically insert a tiny portrait image to show via JS (requirement)
    portraitHolder.innerHTML = '';
    const img = document.createElement('img');
    img.alt = 'portrait';
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' fill='%23f1f5f9'/><text x='50%' y='55%' font-size='22' text-anchor='middle' fill='%23222' font-family='Segoe UI, Roboto'>${playerName.charAt(0).toUpperCase()}</text></svg>`);
    img.style.width='40px'; img.style.height='40px'; img.style.borderRadius='50%';
    portraitHolder.appendChild(img);
  } else {
    messageEl.textContent = 'Please enter a name.';
  }
});


// start
deal(); renderHand(); updateScores();
