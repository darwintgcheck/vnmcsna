import{E as O,g as o,f as u,u as B,R as e,a as L,G as s}from"./index-fcad9ce5.js";const U="/assets/card-7f5581c3.mp3",F="/assets/finish-89d641e7.mp3",I="/assets/lose-7bddab0f.mp3",W="/assets/play-9df4c567.mp3",H="/assets/win-26f0420f.mp3",j=5,b={0:"2",1:"3",2:"4",3:"5",4:"6",5:"7",6:"8",7:"9",8:"10",9:"J",10:"Q",11:"K",12:"A"},h=Object.keys(b).length,N=O`
  0% { transform: scale(.0) translateY(100px) rotateY(90deg); }
  100% { transform: scale(1) translateY(0) rotateY(0deg) }
`,G=o.div`
  user-select: none;
  background: #9967e300;
  transition: opacity .2s;
  ${({$disabled:a})=>a&&u`
    pointer-events: none;
    opacity: .7;
  `}
`,K=o.div`
  display: flex;
  flex-direction: column;
`,C=o.button`
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  transition: opacity .2s, background .2s ease;
  display: flex;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  color: white;
  & > div:first-child {
    font-size: 48px;
    filter: drop-shadow(-4px 4px 2px #00000066);
    margin-right: 10px;
  }

  --opacity: .5;

  &:hover {
    --opacity : 1;
  }

  ${a=>a.selected&&u`
    --opacity: 1;
  `}

  opacity: var(--opacity);
`,T=o.div`
  font-size: 18px;
  color: #005400;
  position: absolute;
  right: 0px;
  bottom: -100px;
  border-radius: 50px;
  background: #69ff6d;
  padding: 5px;
  animation: ${N} .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
`,X=o.div`
  display: flex;
  border-radius: 5px;
  gap: 5px;
  padding: 5px;
  margin-top: 30px;
  justify-content: center;
  & > div {
    transition: opacity .2s;
  }
`,J=o.div`
  transition: transform .2s ease;
  perspective: 500px;
  display: flex;
  position: relative;
  justify-content: flex-end;
  align-items: center;
`,Q=o.div`
  position: absolute;
  bottom: 0;
  transition: transform .25s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity .25s ease;
  filter: drop-shadow(-10px 10px 0px #00000011);
  transform-origin: bottom;
  perspective: 500px;
  & > div {
    animation: ${N} .25s cubic-bezier(0.5, 0.9, 0.35, 1.05);
  }
`,S=o.div`
  ${a=>a.$small?u`
    height: 35px;
    font-size: 15px;
    padding: 5px;
    border-radius: 4px;
  `:u`
    height: 160px;
    font-size: 70px;
    padding: 10px;
    border-radius: 8px;
  `}
  box-shadow: -5px 5px 10px 1px #0000003d;
  background: white;
  aspect-ratio: 4/5.5;
  position: relative;
  color: #333;
  overflow: hidden;
  .rank {
    font-weight: bold;
    line-height: 1em;
  }
  .suit {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50%;
    height: 50%;
    background-size: cover;
    background-repeat: none;
    transform: translate(0%, 0%);
    font-size: 128px;
    opacity: .9;
  }
`,Z=O`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;o.div`
  animation: ${Z} 2s ease-in-out infinite;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateX(100%) translateY(-50%);
  background-color: rgba(255, 204, 0, 0.8);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  color: black;
  white-space: nowrap;
  pointer-events: none;
`;const y=()=>1+Math.floor(Math.random()*(h-1)),w=(a=y())=>({key:Math.random(),rank:a});function ee(a){const{balance:R,withdrawBalance:z,addBalance:$}=B(),[r,M]=e.useState([w()]),[Y,D]=e.useState(!1),[d,P]=e.useState(10),[l,f]=e.useState(0),g=r[r.length-1].rank,[i,v]=e.useState(g>h/2?"lo":"hi"),[q,m]=e.useState(),c=L({card:U,win:H,lose:I,play:W,finish:F}),x=n=>M(t=>[...t,w(n)].slice(-j)),E=async()=>{if(d>R)return alert("Balans kifayət etmir");c.play("play"),z(d);const n=y();x(n);const t=i==="hi"&&n>=g||i==="lo"&&n<=g;setTimeout(()=>{if(t){const p=d*2;$(p),f(p),c.play("win")}else f(0),c.play("lose");c.play("card",{playbackRate:.8})},300)},k=()=>{c.play("finish",{playbackRate:.8}),setTimeout(()=>{f(0),x(y()),D(!1)},300)};return e.createElement(e.Fragment,null,e.createElement(s.Portal,{target:"screen"},e.createElement(s.Responsive,null,e.createElement(G,{$disabled:Y},e.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr"}},e.createElement(J,null,r.map((n,t)=>{const p=-(r.length-(t+1)),_=r.length>3?t/r.length:1,A=Math.min(1,_*3);return e.createElement(Q,{key:n.key,style:{transform:`translate(${p*30}px, ${-p*0}px) rotateZ(-5deg) rotateY(5deg)`,opacity:A}},e.createElement(S,null,e.createElement("div",{className:"rank"},b[n.rank]),e.createElement("div",{className:"suit",style:{backgroundImage:"url("+a.logo+")"}})))})),e.createElement(K,null,e.createElement(C,{selected:i==="hi",onClick:()=>v("hi"),onMouseEnter:()=>m("hi"),onMouseLeave:()=>m(void 0)},e.createElement("div",null,"👆"),e.createElement("div",null,"HI")),e.createElement(C,{selected:i==="lo",onClick:()=>v("lo"),onMouseEnter:()=>m("lo"),onMouseLeave:()=>m(void 0)},e.createElement("div",null,"👇"),e.createElement("div",null,"LO")))),e.createElement(X,null,Array.from({length:h}).map((n,t)=>e.createElement(S,{key:t,$small:!0,style:{opacity:.7},onClick:()=>x(t)},e.createElement("div",{className:"rank"},b[t])))),l>0&&e.createElement(T,{key:l,onClick:k},"+",l)))),e.createElement(s.Portal,{target:"controls"},l?e.createElement(e.Fragment,null,e.createElement("div",null,"Profit: ",l),e.createElement(s.Button,{onClick:k},"Finish"),e.createElement(s.PlayButton,{disabled:!i,onClick:E},"Deal card")):e.createElement(e.Fragment,null,e.createElement(s.WagerInput,{value:d,onChange:P}),e.createElement(s.PlayButton,{disabled:!i,onClick:E},"Deal card"))))}export{ee as default};
