import{R as t,g as o,E as N,u as O}from"./index-fcad9ce5.js";const x="/assets/rocket-e5630fc4.gif",A=o.div`
  position: relative;
  width: 100%;
  padding: 10px 0;
`,U=o.input.attrs({type:"range"})`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-image: url(${x});
    background-size: 100% 100%;
    cursor: pointer;
  }

  /* The slider handle (thumb) for Firefox */
  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-image: url(${x});
    background-size: 100% 100%;
    cursor: pointer;
  }
`;function D({value:r,onChange:d}){const s=t.useMemo(()=>Array.from({length:101}).map((c,h)=>h<=50?Math.round((1+9*(h/50))*4)/4:Math.round(10+90*((h-50)/50))),[]),n=c=>{d(s[Number(c.target.value)])},u=s.indexOf(r);return t.createElement(A,null,t.createElement("div",{style:{bottom:"30px",left:"50%"}},r.toFixed(2),"x"),t.createElement(U,{type:"range",min:"0",max:"100",value:u,onChange:n}))}const W="/assets/crash-2caccc98.mp3",I="/assets/music-3c85cf35.mp3",P="/assets/win-f4ffa6d3.mp3",g=r=>{const d=window.innerWidth,s=4e3;let n=`${Math.random()*d}px ${Math.random()*s}px #ffffff`;for(let u=2;u<=r;u++)n+=`, ${Math.random()*d}px ${Math.random()*s}px #ffffff`;return n},M=g(700),E=g(200),v=g(100),V=N`
  from {
    transform: translateY(-100vh);
  }
  to {
    transform: translateY(0);
  }
`,m=o.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  animation: ${V} linear infinite;
`,Y=o(m)`
  width: 1px;
  height: 1px;
  animation-duration: 150s;
  opacity: 1;
  transition: opacity 12s;
  box-shadow: ${M};
`,_=o(m)`
  width: 1px;
  height: 12px;
  top: -12px;
  animation-duration: 75s;
  opacity: 0;
  transition: opacity 2s;
  box-shadow: ${M};
`,j=o(m)`
  width: 2px;
  height: 2px;
  animation-duration: 100s;
  box-shadow: ${E};
`,G=o(m)`
  width: 2px;
  height: 25px;
  top: -25px;
  animation-duration: 6s;
  opacity: 0;
  transition: opacity 1s;
  box-shadow: ${E};
`,H=o(m)`
  width: 3px;
  height: 3px;
  animation-duration: 50s;
  box-shadow: ${v};
`,X=o(m)`
  width: 2px;
  height: 50px;
  top: -50px;
  animation-duration: 3s;
  opacity: 0;
  transition: opacity 1s;
  box-shadow: ${v};
`,q=o.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
`,J=o.div`
  font-size: 48px;
  color: ${r=>r.color||"#fff"}; // Use color prop or default to white
  text-shadow: 0 0 20px #fff;
  z-index: 1;
  font-family: monospace;
`,K=o.div`
  position: absolute;
  width: 120px;
  aspect-ratio: 1 / 1;
  background-image: url(${x});
  background-size: contain;
  background-repeat: no-repeat;
  transition: all 0.1s ease-out;
`;function Z(){const{balance:r,withdrawBalance:d,addBalance:s}=O(),[n,u]=t.useState(0),[c,h]=t.useState(1.5),[i,y]=t.useState(0),[w,b]=t.useState("idle"),S=e=>{new Audio(e).play()},$=()=>{const a=Math.min(i/1,1),l=20,f=30,p=a*(100-l),T=Math.pow(a,5)*(100-f),B=Math.pow(a,2.3),F=90,z=(1-B)*F;return{bottom:`${T}%`,left:`${p}%`,transform:`rotate(${z}deg)`}},k=(e,a,l)=>{const f=.01*(Math.floor(e)+1),p=e+f;if(y(p),p>=a){S(l?P:W),b(l?"win":"crash"),y(a);return}setTimeout(()=>k(p,a,l),50)},C=w==="crash"?"#ff0000":w==="win"?"#00ff00":"#ffffff",L=e=>{const a=Math.random(),l=Math.min(e,12),f=a>.95?2.8:e>10?5:6,p=1+Math.pow(a,f)*(l-1);return parseFloat(p.toFixed(2))},R=async()=>{if(n<=0||n>r){alert("Balans kifayət deyil!");return}d(n),b("idle"),S(I);const e=Math.random()>.5,a=e?c:L(c);k(0,a,e),e&&s(n*c)};return t.createElement(t.Fragment,null,t.createElement("div",null,t.createElement(q,null,t.createElement(Y,{style:{opacity:i>3?0:1}}),t.createElement(_,{style:{opacity:i>3?1:0}}),t.createElement(j,{style:{opacity:i>2?0:1}}),t.createElement(G,{style:{opacity:i>2?1:0}}),t.createElement(H,{style:{opacity:i>1?0:1}}),t.createElement(X,{style:{opacity:i>1?1:0}}),t.createElement(J,{color:C},i.toFixed(2),"x"),t.createElement(K,{style:$()}))),t.createElement("div",{style:{marginTop:20}},t.createElement("input",{type:"number",value:n,onChange:e=>u(Number(e.target.value)),placeholder:"Mərc məbləği"}),t.createElement(D,{value:c,onChange:h}),t.createElement("button",{onClick:R},"Play")))}export{Z as default};
