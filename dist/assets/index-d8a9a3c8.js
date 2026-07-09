import{r as x,l as Q,c as J,s as z,g as v,f,R as n,E as Y,y,d as E,e as K,a as P,u as U,G as b}from"./index-fcad9ce5.js";var X=x.version.split(".").map(Number),$=Symbol.for(X[0]>=19?"react.transitional.element":"react.element"),N=function(){},d,H=Symbol.dispose||Symbol.for("Symbol.dispose");function k(e,t){var o=t.effect.S();return d=t,_.bind(t,e,o)}function _(e,t){t(),d=e}var R,M;(R={u:0,effect:{s:void 0,c:function(){},S:function(){return N},d:function(){}},subscribe:function(){return N},getSnapshot:function(){return 0},S:function(){},f:function(){}})[H]=function(){};var ee=Promise.prototype.then.bind(Promise.resolve());function te(){M||(M=ee(L))}function L(){var e;M=void 0,(e=d)==null||e.f()}var oe=typeof window<"u"?x.useLayoutEffect:x.useEffect;function ne(e){e===void 0&&(e=0),te();var t=x.useRef();t.current==null&&(t.current=function(a){var r,c,l,i,m=0,j=J(function(){c=this});return c.c=function(){m=m+1|0,i&&i()},(r={u:a,effect:c,subscribe:function(s){return i=s,function(){m=m+1|0,i=void 0,j()}},getSnapshot:function(){return m},S:function(){if(d!=null){var s=d.u,h=this.u;s==0&&h==0||s==0&&h==1?(d.f(),l=k(void 0,this)):s==1&&h==0||s==2&&h==0||(l=k(d,this))}else l=k(void 0,this)},f:function(){var s=l;l=void 0,s==null||s()}})[H]=function(){this.f()},r}(e));var o=t.current;return z.useSyncExternalStore(o.subscribe,o.getSnapshot,o.getSnapshot),o.S(),e===0&&oe(L),o}Object.defineProperties(Q.prototype,{$$typeof:{configurable:!0,value:$},type:{configurable:!0,value:function(e){var t=e.data,o=ne(1);try{return t.value}finally{o.f()}}},props:{configurable:!0,get:function(){return{data:this}}},ref:{configurable:!0,value:null}});const re=v.div`
  width: 18px;
  height: 18px;
  line-height: 16px;
  border-radius: 10px;
  background: var(--chip-color);
  border: 1px dashed var(--border-color);
  color: black;
  font-size: 9px;
  font-weight: bold;
  color: var(--text-color);
  box-shadow: 0 0 0 1px var(--chip-color);
  padding: 0;
  display: inline-block;
  text-align: center;
  user-select: none;

  ${e=>e.$color==="white"&&f`
    --chip-color: #f0f0ff;
    --border-color: #8888C0;
    --text-color: #333333;
  `}
  ${e=>e.$color==="green"&&f`
    --chip-color: #47ff7d;
    --border-color: #006600;
    --text-color: #004400;
  `}
  ${e=>e.$color==="red"&&f`
    --chip-color: #ff5b72;
    --border-color: #ffffff;
    --text-color: #220000;
  `}
  ${e=>e.$color==="blue"&&f`
    --chip-color: #a692ff;
    --border-color: #ffffff;
    --text-color: #000245;
  `}
`,le=e=>e<=1?"green":e<=2?"red":e<=10?"blue":"white";function W({value:e}){return n.createElement(re,{$color:le(e)},e)}const ae=Y`
  from { background-color: white;}
  to { background-color: #292a307d;}
`,ce=v.div`
  border-radius: 10px;
  background: #191c2fa1;
  margin: 0 auto;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  display: flex;
  height: 50px;

  & > div {
    display: flex;
    padding: 10px;
    width: 40px;
    justify-content: center;
  }

  & > div:first-child {
    font-size: 24px;
    align-items: center;
    width: 60px;
    justify-content: center;
    background: #FFFFFF11;
    animation: ${ae} 1s;
  }
`,ie=v.div`
  position: relative;
  border: none;
  border-radius: 5px;
  padding: 10px 10px;
  box-shadow: 0 0 0 1px var(--border-color);
  color: white;
  width: 60px;
  cursor: pointer;
  text-align: center;

  ${e=>e.$color==="red"&&f`
    --background-color: #ff3d5e;
    --border-color: #ff2b4e;
  `}

  ${e=>e.$color==="black"&&f`
    --background-color: #1b1b25;
    --border-color: #121218;
  `}

  background-color: var(--background-color);
  box-shadow: 0 0 0 1px var(--border-color);

  &::after {
    content: " ";
    transition: background .1s;
    background: transparent;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }

  &:hover::after {
    background: #9999ff44;
    mix-blend-mode:screen;
  }
  ${e=>e.$highlighted&&f`
    &::after {
      background: #9999ff44;
      mix-blend-mode:screen;
    }
  `}
`,se=v.div`
  display: grid;
  gap: 10px;
`,ue=v.div`
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
`,Ae="data:audio/mpeg;base64,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",fe="/assets/lose-7bddab0f.mp3",de="/assets/play-9df4c567.mp3",pe="/assets/win-26f0420f.mp3",D=[1,2,10,50],A=18,V=Math.ceil(A/3),O=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],S=e=>O.includes(e%(O.length+1)),g=e=>3-e%3,be=Array.from({length:A}).map((e,t)=>t+1),u=(e,t,[o,a])=>{const r=be.filter(t);return{label:e,numbers:r,row:a,column:o}},ve=Array.from({length:A}).reduce((e,t,o)=>({...e,[o+1]:{label:String(o+1),numbers:[String(o+1)],row:g(o),column:1+Math.floor(o/3),color:S(o+1)?"red":"black"}}),{}),G={...ve,firstHalf:u("<"+Math.floor(A/2+1),e=>e<=A/2,[1,4]),even:u("Even",e=>e%2===0,[2,4]),red:u("Red",e=>S(e),[3,4]),black:u("Black",e=>!S(e),[4,4]),odd:u("Odd",e=>e%2===1,[5,4]),secondHalf:u(">"+Math.floor(A/2),e=>e>A/2,[6,4]),row1:u("2:1",e=>g(e-1)===1,[V+1,1]),row2:u("2:1",e=>g(e-1)===2,[V+1,2]),row3:u("2:1",e=>g(e-1)===3,[V+1,3])},p=y({}),T=y([]),w=y([]),C=y(D[0]),I=E(()=>{const e=Object.entries(p.value),t=Array.from({length:A}).map(()=>0);for(const[o,a]of e){const r=G[o],c=Number(BigInt(a*1e4)/BigInt(r.numbers.length));for(const l of r.numbers)t[l-1]+=c}return t}),B=E(()=>Math.floor(I.value.reduce((e,t)=>e+t,0))),q=E(()=>I.value.map(t=>Number(BigInt(t*I.value.length*1e4)/BigInt(B.value||1))/1e4)),me=e=>{w.value=[...w.value,e]},Z=e=>p.value[e]??0,F=e=>{T.value=e},he=(e,t)=>{p.value={...p.value,[e]:Z(e)+t}},ge=e=>{p.value={...p.value,[e]:0}},qe=()=>{p.value={}};function xe(){const e=K(),t=P({chip:Ae}),o=r=>{e.isPlaying||(t.play("chip",{playbackRate:1}),he(r,C.value))},a=r=>{e.isPlaying||(t.play("chip",{playbackRate:.8}),ge(r))};return n.createElement(se,null,Object.entries(G).map(([r,c])=>{const l=Z(r);return n.createElement(ie,{key:r,onClick:i=>{i.preventDefault(),i.button!==2?o(r):a(r)},onContextMenu:()=>a(r),style:{gridRow:c.row,gridColumn:c.column},$highlighted:T.value.includes(Number(r)),$color:c.color,onMouseOver:()=>F(c.numbers),onMouseLeave:()=>F([])},c.label,l>0&&n.createElement(ue,{key:l},n.createElement(W,{value:l})))}))}const ye=v.div`
  display: grid;
  gap: 20px;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  color: white;
`;function Ee(){const e=E(()=>[...w.value].reverse());return n.createElement(ce,null,e.value.map((t,o)=>n.createElement("div",{key:o},t+1)))}function ke(){const{balance:e}=U(),t=B.value,o=Math.max(...q.value),a=o*t,r=t>e;return n.createElement("div",{style:{textAlign:"center",display:"grid",gridTemplateColumns:"1fr 1fr"}},n.createElement("div",null,r?n.createElement("span",{style:{color:"#ff0066"}},"TOO HIGH"):n.createElement(n.Fragment,null,t),n.createElement("div",null,"Wager")),n.createElement("div",null,n.createElement("div",null,a,"(",o.toFixed(2),"x)"),n.createElement("div",null,"Potential win")))}function Me(){const{balance:e,updateBalance:t}=U(),o=P({win:pe,lose:fe,play:de}),a=B.value;Math.max(...q.value);const r=a>e,c=async()=>{if(e<a){alert("Balans kifayət deyil!");return}t(e-a),o.play("play");const l=Math.floor(Math.random()*q.value.length),i=a*q.value[l];me(l),i>0?(t(e-a+i),o.play("win")):o.play("lose")};return n.createElement(n.Fragment,null,n.createElement(b.Portal,{target:"screen"},n.createElement(b.Responsive,null,n.createElement(ye,{onContextMenu:l=>l.preventDefault()},n.createElement(ke,null),n.createElement(Ee,null),n.createElement(xe,null)))),n.createElement(b.Portal,{target:"controls"},n.createElement(b.Select,{options:D,value:C.value,onChange:l=>C.value=l,label:l=>n.createElement(n.Fragment,null,n.createElement(W,{value:l})," = ",l)}),n.createElement(b.Button,{disabled:!a,onClick:qe},"Clear"),n.createElement(b.PlayButton,{disabled:!a||r,onClick:c},"Spin")))}export{Me as default};
