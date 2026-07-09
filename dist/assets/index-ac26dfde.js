import{g as c,u as x,R as q,a as h}from"./index-fcad9ce5.js";const y="/assets/lose-7bddab0f.mp3",v="data:audio/mpeg;base64,//uUZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFoACioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAADUgJALCjQABzAAABaBVoENUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//vEZAAAAZYTUh094AgAAA/woAABFNCvQ7ndgEAAAD/DAAAAA/wAA3ilMsavdn4LmXOMrHBTk7MtcCbjjVcB5VjZ7K9n3Aiahx8P35/cUDBc+H5zxBBAgAAAAAUCgPFi4MgAAAQhGYXhIYHB2YZAkqiYCDCZREgdBTgZFo6bLrSaVKKZTE+aaDOYZjARPYYVgIZpDiYNAUcXTHTBhg0qCvQxUvMukwaHGblgCUTHUQwpTMkC0RX/AgGgsw5ZBh5oQBKlpkAGnnPIUOUmI2kkSOdF2EJVZl8ovX8YEl7iUMPyB0mHTT/S6t////DcvgOL4Re/Psppq8ZPdAYKRZWLABAEDMaj6hQAgAAAAuyKhwCgEwYBjDAFAQ3HRoABAY/KBsiKmHC2YtJQCFBhURBiABAZMNgMwMEgMhC0AYPgYvZgFhkBhwggY2CIBSQDJwMJhYAgSgYRBYGERoA8JCPQsiAw6IQbDCZgY1AQAQcCyEOGRMLnRyzi1QDg2BgkDhloGxANkBCMgJAkDDogAiJQDgV+TpExzysThFAMCA0BwOBuaACCAFwODbL+eTMz6CjQRyISCgRSQrcUELT/uib0jSw5gyo+iDjLEqRAZX/059Bjybm5gRhJjLE2Sw5JMEkQIn//7Ghm5uYMaJpm6CBVICVCeIcVydIaWiLE0ViZ/////5otM3Uh////yiVSaMieJkSWWJsfh/CVyunN0L0TVCkSQUuJ0uMJPIcElEiVVVV6pJsFNBTcgrgV4KbFNyCuBTwUXFFZBTAU+KLxFExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uUZNEACJqCz25yoJAAAA/wwAAAB3Q/J3zzACgAAD/DgAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",B="/assets/play-9df4c567.mp3",b="/assets/win-051b921a.mp3",w=c.div`
  color: white;
  user-select: none;
  width: min(100vw, 420px);
  font-size: 20px;
`,M=c.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
  & > div {
    padding: 20px;
    text-align: center;
    div:last-child {
      font-size: 14px;
    }
  }
`,U=c.div`
  display: flex;
  color: white;

  margin-bottom: 20px;

  & > div {
    margin: 0 auto;
    border-radius: 10px;
    text-align: center;
    & > div:first-child {
      font-weight: bold;
      font-size: 64px;
      font-variant-numeric: tabular-nums;
    }
  }
`,K=c.div`
  @keyframes result-appear {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  transform: translateX(-50%);
  position: absolute;
  top: -50px;
  transition: left .3s ease;

  & > div {
    animation: result-appear .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    transform-origin: bottom;
    background: #ffffffCC;
    backdrop-filter: blur(50px);
    border-radius: 5px;
    padding: 5px;
    font-weight: bold;
    width: 50px;
    text-align: center;
    color: black;
  }

  & > div::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px 10px 0px 10px;
    border-style: solid;
    border-color: #ffffffCC transparent transparent transparent;
  }

`,S=n=>{const t=(l,A)=>A?t(A,l%A):l;return 100/t(100,n)},F=n=>{const t=S(n),l=(100/n).toFixed(4);let A=Array.from({length:t}).map((e,i)=>i<t*(n/100)?parseFloat(l):0);const r=A.reduce((e,i)=>e+i,0);if(r>t){for(let e=A.length-1;e>=0;e--)if(A[e]>0){A[e]-=r-t,A[e]=parseFloat(A[e].toFixed(4));break}}return A};function R(){const{balance:n,withdrawBalance:t,addBalance:l}=x(),[A,r]=q.useState(10),[e,i]=q.useState(-1),[a,p]=q.useState(Math.floor(100/2)),[d,m]=q.useState(!1),s=h({win:b,play:B,lose:y,tick:v}),u=100/a,g=u*A,f=async()=>{if(d)return;if(!t(A)){alert("Not enough balance!");return}s.play("play"),m(!0);const o=Math.random()*100<a,E=Math.floor(o?Math.random()*a:Math.random()*(100-a)+a);if(i(E),o){const C=A*u;l(C),s.play("win")}else s.play("lose");m(!1)};return q.createElement(q.Fragment,null,q.createElement("div",{className:"screen"},q.createElement(w,null,q.createElement(U,null,q.createElement("div",null,q.createElement("div",null,a+1),q.createElement("div",null,"Roll Under"))),q.createElement(M,null,q.createElement("div",null,q.createElement("div",null,(a/100*100).toFixed(0),"%"),q.createElement("div",null,"Win Chance")),q.createElement("div",null,q.createElement("div",null,u.toFixed(2),"x"),q.createElement("div",null,"Multiplier")),q.createElement("div",null,q.createElement("div",null,g.toFixed(2)," ₼"),q.createElement("div",null,"Payout"))),q.createElement("div",{style:{position:"relative"}},e>-1&&q.createElement(K,{style:{left:`${e/100*100}%`}},q.createElement("div",{key:e},e+1)),q.createElement(Slider,{disabled:d,range:[0,100],min:1,max:95,value:a,onChange:o=>{p(o),s.play("tick")}})))),q.createElement("div",{className:"controls"},q.createElement("input",{type:"number",value:A,onChange:o=>r(Number(o.target.value)),min:1,max:n}),q.createElement("button",{onClick:f,disabled:d},"Roll")))}export{R as default,F as outcomes};
