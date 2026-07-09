import{E as F,g as d,f as K,u as G,R as e,i as V,a as J,G as p}from"./index-fcad9ce5.js";const Q="/assets/lose-7bddab0f.mp3",q="/assets/play-9df4c567.mp3",X="/assets/win-26f0420f.mp3",Z="/assets/card-7f5581c3.mp3",ee="/assets/win2-32c627c7.mp3",k={0:"2",1:"3",2:"4",3:"5",4:"6",5:"7",6:"8",7:"9",8:"10",9:"J",10:"Q",11:"K",12:"A"},f={0:2,1:3,2:4,3:5,4:6,5:7,6:8,7:9,8:10,9:10,10:10,11:10,12:11},x={0:"♠",1:"♥",2:"♦",3:"♣"},O={0:"black",1:"red",2:"red",3:"black"},te=Object.keys(k).length,ne=Object.keys(x).length,U=F`
  0% { transform: scale(.0) translateY(100px) rotateY(90deg); }
  100% { transform: scale(1) translateY(0) rotateY(0deg) }
`,ae=d.div`
  user-select: none;
  transition: opacity .2s;
  ${({$disabled:c})=>c&&K`
    pointer-events: none;
    opacity: .7;
  `}
`,R=d.div`
  border: 2px solid white;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  width: 300px;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
`,D=d.div`
  display: flex;
  justify-content: center;
  align-items: center;
`,N=d.div`
  margin: 0 5px;
  animation: ${U} .25s cubic-bezier(0.5, 0.9, 0.35, 1.05);
`,P=d.div`
  height: 120px;
  font-size: 50px;
  padding: 10px;
  border-radius: 8px;
  box-shadow: -5px 5px 10px 1px #0000003d;
  background: white;
  aspect-ratio: 4/5.5;
  position: relative;
  color: ${c=>c.color||"#333"};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  .rank {
    font-weight: bold;
    margin-left: 5px;
  }
  .suit {
    font-size: 40px;
    margin-right: 5px;
    align-self: flex-end;
  }
`,re=d.div`
  font-size: 18px;
  color: #005400;
  margin-top: 20px;
  border-radius: 50px;
  background: #69ff6d;
  padding: 5px 10px;
  animation: ${U} .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  cursor: pointer;
`,se=()=>Math.floor(Math.random()*te),E=()=>Math.floor(Math.random()*ne),s=(c=se(),C=E())=>({key:Math.random(),rank:c,suit:C});function ie(c){const{balance:C,withdrawBalance:A,addBalance:j}=G(),[B,S]=e.useState([]),[_,b]=e.useState([]),[g,H]=V(),[m,w]=e.useState(null),[I,le]=e.useState(!1),i=J({win:X,lose:Q,play:q,card:Z,jackpot:ee}),L=()=>{w(null),S([]),b([])},W=async()=>{if(!A(g)){alert("Balansınız kifayət etmir!");return}L(),i.play("play");const t=[2.5,2.5,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0],a=Math.floor(Math.random()*t.length),n=t[a];let r=[],u=[];n===2.5?(r=Y(),u=v(21)):n===2?(r=T(),u=M(r)):(r=M(),u=z(r)),await(async()=>{for(let l=0;l<2;l++)l<r.length&&(S(o=>[...o,r[l]]),i.play("card"),await new Promise(o=>setTimeout(o,500))),l===1&&n===2.5&&i.play("jackpot"),l<u.length&&(b(o=>[...o,u[l]]),i.play("card"),await new Promise(o=>setTimeout(o,500)))})();const y=g*n;y>0&&j(y),w(y),n===2.5||(n>0?i.play("win"):i.play("lose"))},h=t=>t.reduce((a,n)=>a+f[n.rank],0),Y=()=>{const a=[8,9,10,11],n=a[Math.floor(Math.random()*a.length)];return[s(12,E()),s(n,E())]},v=t=>{let a=t;for(;a>=t;){const n=s(),r=s();if(a=f[n.rank]+f[r.rank],a<t)return[n,r]}return[]},T=()=>{const t=[17,18,19,20],a=t[Math.floor(Math.random()*t.length)];return $(a)},M=t=>{const a=t?h(t):20;let n=a;for(;n>=a;){const r=[s(),s()];if(n=h(r),n<a)return r}return[]},z=t=>{const a=h(t);let n=a;for(;n<=a||n>21;){const r=[s(),s()];if(n=h(r),n>a&&n<=21)return r}return[]},$=t=>{for(let a=0;a<100;a++){const n=s(),r=s();if(f[n.rank]+f[r.rank]===t)return[n,r]}return v(t)};return e.createElement(e.Fragment,null,e.createElement(p.Portal,{target:"screen"},e.createElement(p.Responsive,null,e.createElement(ae,{$disabled:I},e.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"}},e.createElement("h2",null,"Dealer's Hand"),e.createElement(R,null,e.createElement(D,null,_.map(t=>e.createElement(N,{key:t.key},e.createElement(P,{color:O[t.suit]},e.createElement("div",{className:"rank"},k[t.rank]),e.createElement("div",{className:"suit"},x[t.suit])))))),e.createElement("h2",null,"Player's Hand"),e.createElement(R,null,e.createElement(D,null,B.map(t=>e.createElement(N,{key:t.key},e.createElement(P,{color:O[t.suit]},e.createElement("div",{className:"rank"},k[t.rank]),e.createElement("div",{className:"suit"},x[t.suit])))))),m!==null&&e.createElement(re,{key:m},m>0?e.createElement(e.Fragment,null,"₾ ",m," (+",Math.round(m/g*100-100),"%)"):e.createElement(e.Fragment,null,"You Lost")))))),e.createElement(p.Portal,{target:"controls"},e.createElement(e.Fragment,null,e.createElement(p.WagerInput,{value:g,onChange:H}),e.createElement(p.PlayButton,{onClick:W},"Deal Cards"))))}export{ie as default};
