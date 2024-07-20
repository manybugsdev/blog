---
title: I joined js1024s
publish_date: 2024-07-20
---

I joined the [js1024](https://js1024.fun/) for the first time.

_js1024_ is the Annual JavaScript Golfing Competition. Participants have 15 days to create a cool JavaScript or GLSL program in **1024 bytes or less.**

I made a simple [Game of Life](https://conwaylife.com/wiki/Conway's_Game_of_Life) program by HTML.

https://js1024.fun/demos/2024/17/readme

I think the bellow code is the best part of my code.

```js
!c ? (L == 3 ? 1 : 0) : L < 2 || L > 3 ? 0 : 1;
```

This represents the state of a cell in next generation by the conditional operator.

- c: The flag whether current cell is living or not
- L: The count of living cells in surrounded cells

This is the minified entire code. I used [HTML Minifier](https://kangax.github.io/html-minifier/) and [JavaScript Minifier](https://www.toptal.com/developers/javascript-minifier).

<!-- prettier-ignore -->
```html
<body><style>h1,p{text-align:center}table{margin:auto}td{width:1em;height:1em}</style><h1>Life Game</h1><div id=$></div><script>let A=_=>Array.from({length:_}),f=0,t=A(30).map(()=>A(30).fill(0)),d=(_,e)=>(t[_][e]=!t[_][e],u()),L=0,l=(_,e)=>[[_-1,e-1],[_-1,e],[_-1,e+1],[_,e-1],[_,e+1],[_+1,e-1],[_+1,e],[_+1,e+1],].reduce((_,[e,c])=>_+(t[e]?.[c]??0),0),n=()=>(t=t.map((_,e)=>_.map((_,c)=>(L=l(e,c),_?L<2||L>3?0:1:3==L?1:0))),u()),u=()=>{$.innerHTML=`<p><button onclick="r()">${f?"Stop":"Run"}</button></p><table>${t.reduce((_,e,c)=>_+`<tr>${e.reduce((_,e,o)=>_+`<td style="background: ${e?"#111":"#ccc"}" onclick="d(${c}, ${o})"></td>`,"")}</tr>`,"")}</table>`},a=_=>setTimeout(_,500),z=()=>f&&(n(),a(z)),r=()=>f?(f=0,u()):(f=1,z());u();</script>
```
