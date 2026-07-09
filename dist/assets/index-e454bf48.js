import{E as x,g as p,f as h,u as Z,a as q,R as e,G as u,B as N}from"./index-fcad9ce5.js";const J="/assets/finish-89d641e7.mp3",Q="/assets/tick-4a62b354.mp3",Y="/assets/win-fccf1281.mp3",ee="/assets/axe-96913656.mp3",te="/assets/explode-b3aafc71.mp3",l=16,ne=1.06,P=[1,3,5,10,15],ae=x`
  0%, 50%, 100% {
    transform: scale(1);
    filter: brightness(1);
    /* background: #764cc4; */
    /* box-shadow: 0 0 1px 1px #ffffff00; */
  }
  25% {
    transform: scale(0.95);
    filter: brightness(1.5);
    /* background: #945ef7; */
    /* box-shadow: 0 0 1px 1px #ffffff99; */
  }
`,se=x`
  0% {
    filter: brightness(1);
    /* background: #ffffff; */
    transform: scale(1.1);
  }
  75% {
    filter: brightness(2);
    /* background: #3fff7a; */
    transform: scale(1.2);
  }
`,re=x`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  51% {
    background: #ffffff;
    transform: scale(1.6);
  }
`;x`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;const oe=p.div`
  display: grid;
  grid-template-rows: auto auto 1fr;
  height: 100%;
`,ie=p.div`
  display: grid;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  user-select: none;
  backdrop-filter: blur(20px);
`,le=p.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
`,ce=p.div`
  border-radius: 5px;
  color: gray;
  background: #292a307d;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  height: 50px;
`,de=p.div`
  margin: 0 auto;
  width: 25%;
  text-align: center;
  padding: 5px 0;
  opacity: .5;
  text-wrap: nowrap;

  & > div:first-child {
    font-size: 60%;
    color: gray;
  }

  ${t=>t.$active&&h`
    background: #FFFFFF11;
    background: 2px 0px 10px #00000033;
    color: #32cd5e;
    opacity: 1;
  `}
`,fe=p.button`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  background: #9358ff;
  background-size: 100%;
  border: none;
  border-bottom: 5px solid #00000055;
  border-radius: 4px;
  font-weight: bold;
  aspect-ratio: 1;
  width: 60px;
  transition: background 0.3s, opacity .3s, filter .2s ease;
  font-size: 12px;
  cursor: pointer;

  ${t=>t.selected&&h`
    animation: ${ae} .5s ease infinite;
    z-index: 10;
    opacity: 1!important;
  `}

  ${t=>t.status==="gold"&&h`
    color: white;
    animation: ${se} .5s ease;
    opacity: 1;
  `}

  ${t=>t.status==="mine"&&h`
    background: #ff5252;
    z-index: 10;
    animation: ${re} .3s ease;
    opacity: 1;
  `}

  ${t=>t.status==="hidden"&&h`
    &:disabled {
      opacity: .5;
    }
  `}

  &:disabled {
    cursor: default;
  }

  &:hover:not(:disabled) {
    filter: brightness(1.5);
  }
`,ue=p.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: white;
  & > div:first-child {
    display: flex;
    color: #ffffffCC;
    gap: 20px;
  }
`,L=t=>Array.from({length:t}).fill({status:"hidden",profit:0}),pe=(t,c,n)=>t.map((d,a)=>a===c?{status:"gold",profit:n}:d),me=(t,c,n)=>{const d=t.map((a,r)=>({cell:a,index:r})).sort((a,r)=>a.index===c?-1:r.index===c?1:a.cell.status==="hidden"&&r.cell.status==="hidden"?Math.random()-.5:a.cell.status==="hidden"?-1:r.cell.status==="hidden"?1:0).map(a=>a.index).slice(0,n);return t.map((a,r)=>d.includes(r)?{status:"mine",profit:0}:a)};function Ee(){const{balance:t,updateBalance:c}=Z(),n=q({tick:Q,win:Y,finish:J,step:ee,explode:te}),[d,a]=e.useState(L(l)),[r,v]=e.useState(0),[$,M]=e.useState(-1),[g,k]=e.useState(0),[O,b]=e.useState(!1),[_,S]=e.useState(!1),[f,A]=e.useState(10),[i,D]=e.useState(P[2]),R=s=>{const o=l-s;return Number(BigInt(o*N)/BigInt(o-i))/N},I=e.useMemo(()=>{const s=l-i;let o=0,y=f;return Array.from({length:s}).map((E,m)=>{const C=m===0?f:y,B=R(m),K=l-m,V=Array.from({length:K},(be,X)=>X<i?0:B),F=C*(B-1);o+=F;const G=C+F;return y=G,{bet:V,wager:C,profit:F,cumProfit:o,balance:G}})},[f,i]),U=l-r<=i,z=_&&!O&&!U,{wager:w,bet:he}=I[r]??{},T=()=>{t<f||(c(-f),a(L(l)),b(!1),v(0),k(0),S(!0))},W=()=>{n.play("finish"),j()},j=()=>{a(L(l)),b(!1),v(0),k(0),S(!1)},H=async s=>{if(!(!w||t<w)){b(!0),M(s);try{n.sounds.step.player.loop=!0,n.play("step"),n.sounds.tick.player.loop=!0,n.play("tick");const y=Math.random()<i/(l-r);if(n.sounds.tick.player.stop(),y){S(!1),a(me(d,s,i)),n.play("explode");return}const E=w*(R(r)-1);c(E);const m=r+1;v(m),a(pe(d,s,E)),k(g+E),m<l-i?n.play("win",{playbackRate:Math.pow(ne,r)}):(n.play("win",{playbackRate:.9}),n.play("finish"))}finally{b(!1),M(-1),n.sounds.tick.player.stop(),n.sounds.step.player.stop()}}};return e.createElement(e.Fragment,null,e.createElement(u.Portal,{target:"screen"},e.createElement(oe,null,e.createElement(ce,null,I.map(({cumProfit:s},o)=>e.createElement(de,{key:o,$active:r===o},e.createElement("div",null,"LEVEL ",o+1),e.createElement("div",null,s.toFixed(2)," ₾")))),e.createElement(ue,null,e.createElement("div",null,e.createElement("span",null,"Mines: ",i),g>0&&e.createElement("span",null,"+",g.toFixed(2)," ₾ +",Math.round(g/f*100-100),"%"))),e.createElement(u.Responsive,null,e.createElement(ie,null,e.createElement(le,null,d.map((s,o)=>e.createElement(fe,{key:o,status:s.status,selected:$===o,onClick:()=>H(o),disabled:!z||s.status!=="hidden"},s.status==="gold"&&e.createElement("div",null,"+",s.profit.toFixed(2)," ₾")))))))),e.createElement(u.Portal,{target:"controls"},_?e.createElement(u.Button,{onClick:W},g>0?"Finish":"Reset"):e.createElement(e.Fragment,null,e.createElement(u.WagerInput,{value:f,onChange:A}),e.createElement(u.Select,{options:P,value:i,onChange:D,label:s=>e.createElement(e.Fragment,null,s," Mines")}),e.createElement(u.PlayButton,{onClick:T},"Start"))))}export{Ee as default};
