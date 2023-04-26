var themes = [
  {
    name: "先知", // 主题名字
    bg: "url(/res/bg2.jpg)", // 主题【按钮】的背景图，不是主题背景图
    css: // 主题的css设计，请在控制台找想改的元素然后写到css属性里(可以用::after)
`body {background-image: url(/res/bg2.jpg);}
body > header > span {color: #fec;}
body > header > span.active, #edit-tools {background-color: #fff;}
main {
  border: 5px #fff solid;
  box-sizing: border-box;
  backdrop-filter: blur(2px);
  background-color: #fff8;
}
#edit > canvas {
  box-shadow: 0 0 0 #8f8 inset;
  transition: box-shadow 1s;
}
#edit > canvas:focus {box-shadow: 0 0 16px #8f8 inset;}
#edit-scroll > div {background-color: #635;}
#set-theme > div.active {
  background-image: linear-gradient(90deg, #cfc, #5f5, #cfc);
}
`,
    theme: { // 主题的【编辑器】的颜色设计
      editTitle: "#535", // 上左表头颜色
      edit: "#310", // 正常颜色
      edit0: "#657a", // 00的颜色
      editf: "#9faa" // ff的颜色
    }
  },
  

  {
    name: "极·洋", 
    bg: "url(/res/bg.jpg)", 
    css:`
body {background-image: url(/res/bg.jpg);}
main {background-color: #fffc;}
#edit-tools {background-color: #fff;}
body > header > span {color: #fff;}
body > header > span.active {
  background-color: #fff;
  color: #555;
}`,
  },


  {
    name: "极·夜",
    bg: "url(/res/bg4.jpg)",
    css:`
body {
  background-image: url(/res/bg4.jpg);
  --link: #5dd;
}
main {
  background-color: #0000;
  box-shadow: none;
}
#edit-tools {
  background-color: #0000;
  box-shadow: none;
  transition: width 0.2s, background-color 0.2s;
}
#edit-tools:hover {
  background-color: #000a;
}
#edit-tools > p {color: #fff;}
#edit-tools > p:hover {background-color: #fff3;}
#edit-tools > hr {
  border: none;
}
body > header > span{color: #aac;}
body > header > span.active {
  background-color: #0000;
  box-shadow: none;
  color: #fff;
}
#edit > canvas {
  box-shadow: 0 0 0 #fff inset;
  transition: box-shadow 0.2s;
  border-radius: 20px;
}
#edit > canvas:focus {box-shadow: 0 0 5px #fff inset;}
#edit-scroll {box-shadow: none;}
#edit-scroll > div {background-color: #fff;}
#set > h3 {color: #fff}
#set {color: #ccc}
`,
    theme: {
      editTitle: "#fae", 
      edit: "#ccc", 
      edit0: "#888a", 
      editf: "#8f8"
    }
  },


  {
    name: "雫るる",
    bg: "url(/res/bg3l.png)",
    css:`
body {
  background-image: url(/res/bg3.webp);
  background-size: contain;
  background-color: #f1f3f4;
  background-repeat: repeat-y;
  --link: #5dd;
}
main {background-color: #333a;}
#edit-tools {background-color: #333;}
#edit-tools > p {color: #fff;}
#edit-tools > p:hover {background-color: #fff3;}
body > header > span.active {
  background-color: #333;
  color: #fff;
}
#edit > canvas {
  box-shadow: 0 0 0 #fff inset;
  transition: box-shadow 0.2s;
}
#edit > canvas:focus {box-shadow: 0 0 5px #fff inset;}
#edit-scroll > div {background-color: #fff;}
#set > h3 {color: #fff}
#set {color: #ccc}
`,
    theme: {
      editTitle: "#e8e", 
      edit: "#faf", 
      edit0: "#fffa", 
      editf: "#bffa"
    }
  },


  {
    name: "墨香舒客", 
    bg: "url(/res/bg5.jpg)", 
    css:`
@font-face {
  font-family: qingke;
  src: url(/res/qingke.woff2);
}
body {background-image: url(/res/bg5.jpg);}
body, input {font-family: qingke, "PingFangSC-Regular", "Microsoft Yahei UI", sans-serif;}
::selection {
  background-color: #355;
  color: #fcc;
}
main {
  background-color: #fff5;
  box-shadow: none;
}
#edit-tools {
  background-color: #fff0;
  transition: background-color 0.2s;
}
#edit-tools:hover {
  width: 45px;
  background-color: #fff5;
}
#edit-tools > p:active {background-color: #888a;}
#edit-tools > hr {border: none;}
body > header > span {color: #aac;}
body > header > span.active {
  background-color: #0000;
  box-shadow: none;
  color: #88a;
}
#edit > canvas {box-shadow: 0 0 0px #888 inset;}
#edit > canvas:focus {box-shadow: 0 0 10px #888 inset;}
#edit-scroll {box-shadow: none;}
#edit-scroll > div {background-color: #000;opacity: 0.05;}
#edit-scroll:hover > div {background-color: #000;opacity: 0.2}
#edit-scroll:active > div {background-color: #000;opacity: 0.5}
`,
    theme: {
      editTitle: "#688", 
      edit: "#355", 
      edit0: "#896a", 
      editf: "#4c9a",
      select: "#133",
      selecti: "#422",
      cross: "#266",
    }
  },


  {
    name: "经典",
    bg: "linear-gradient(15deg, #acc, #cff)"
  }
];