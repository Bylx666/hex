var themes = [
  {
    name: "太空透镜", // 主题名字
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


  { // 是个深色主题
    name: "雫るる",
    bg: "url(/res/bg4.png)",
    css:`
body {
  background-image: url(/res/bg3.webp);
  background-size: contain;
  background-color: #f1f3f4;
  background-repeat: repeat-y;
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
#set > p {color: #ccc}
`,
    theme: {
      editTitle: "#e8e", 
      edit: "#faf", 
      edit0: "#fffa", 
      editf: "#bffa"
    }
  },


  {
    name: "经典",
    bg: "linear-gradient(15deg, #acc, #cff)"
  }
];