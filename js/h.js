// h.js 意思是头文件地位的文件，包含页面框架和基本工具

// ---- 文档工具 ---- //
var $ = { 
  i: (e)=> document.getElementById(e),

  // $.c("tag名如div", "HTML文本", parentNode)
  c: (t, c, p)=> {
  
    var d = document.createElement(t);
    if(c) d.innerHTML = c;
    if(p) p.append(d);
    return d;
  
  },

  // $.a([node1, node2], node) 删&贴active class, 只有style上的作用
  a: (pre, cur)=> {

    for(const c of pre) c.classList.remove("active");
    cur&&cur.classList.add("active");
    
  }
};
var $main = document.querySelector("main");



// ---- 渲染导航栏 ---- //
(()=>{

  var frag = document.createDocumentFragment();

  var l = ["<ico>&#xe8ca;</ico>编辑", "<ico>&#xe68a;</ico>计算", 
    "<ico>&#xe835;</ico>文件", "<ico>&#xe840;</ico>设置"];
  l.forEach((v, i)=> {

    var $e = $.c("span", v, frag);
    $e.onclick = ()=> Sub.pageTo(i);

  });

  $.i("nav").append(frag);

})();



// ---- 页面工具 *Sub UI* 厉不厉害你Subkey哥，自己写了一套页面系统 ---- //
var Sub = {
  pages: [], // 4个页面的dom对象
  current: -1, // 目前页面在pages的索引
  pageTo(i) { // 跳转到 i∈[0,3];

    var p = Sub.pages[i];
    if(!p||i===Sub.current) return false;
    Sub.current = i;
  
    var n = $.i("nav").children;
    for(const c of n) c.className = "";
    n[i].className = "active";
  
    $main.textContent = "";
    $main.append(p);
    if(typeof p.onpagein==="function") p.onpagein()

  },

  // void tip("标题", "内容", ?回调, ?警告图标) 右下弹出提示,有回调就有确认键
  tip(title, content, callback, warning) { 
  
    var cb = typeof callback==="function";
    var $d = $.c("div", `
<h3>
  <ico>${warning?"&#xe849;":(cb?"&#xe83f;":"&#xe83e;")}</ico>
  ${ title?title:"" }
</h3>
<p>${ content?content:"" }</p>`, $.i("tip"));

    if(cb) {
  
      const _d = $.c("div", 0, $d);
      
      const _d1 = $.c("span", "确认", _d);
      _d1.onclick = ()=> {
        
        $d.remove();
        callback();
  
      };
  
      const _d2 = $.c("span", "取消", _d);
      _d2.onclick = ()=> $d.remove();
  
    }else setTimeout(()=> {
  
      $d.style.transform = "translateX(100%)";
      setTimeout(()=> $d.remove(), 500);
  
    }, 3000);

    if(warning) $d.querySelector("h3").style.color = "#833";

  },

  // $node.oncontextmenu = menu(node[]: <p>||<hr>])
  menu(menuList) {

    var $m = $.i("menu");
    var $d = $.c("div");
    $d.oncontextmenu = (e)=> e.preventDefault();
    for(const $c of menuList) $d.append($c);

    var docE = ()=> {

      $m.textContent = "";
      document.removeEventListener("click", docE);

    };
    return function(e) {
      e.preventDefault();
      e.stopPropagation();

      $m.append($d);
      $d.style.left = e.clientX + "px";
      $d.style.top = e.clientY + "px";
      document.addEventListener("click", docE);

    }

  }
};
Sub.tip("欢迎回来", "现在时间: "+new Date().toLocaleTimeString());



// ---- 小工具 ---- //
// 数字转字节数
function parseByte(n) { 

  if(n===0) return "空文件";
  var ki = Math.floor(Math.log2(n) / 10);
  if(ki===0) return n + " Bytes";
  return (n/Math.pow(1024, ki)).toFixed(2)+" "+["", "KB", "MB", "GB"][ki];

}

// 数字转对应长度的Hex字符串
function toHex(n, length) { 

  var str = n.toString(16).toUpperCase();
  if(length) {

    if(str.length>length) return str.slice(-length);
    while(str.length<length) str = "0"+str;

  }
  return str;

}

// arraybuffer多合一
function concatBuffers(...arrs) {

  var u = new Uint8Array(arrs.reduce((i,b)=> i+b.byteLength, 0));
  arrs.reduce((i, cur)=> {

    u.set(new Uint8Array(cur), i);
    return i+cur.byteLength;

  }, 0);
  return u.buffer;

};



// ---- 设置 ---- //
var Settings = null;
try{

  Settings = JSON.parse(localStorage.getItem("settings"));
  if(typeof Settings!=="object"||typeof Settings.columns!=="number"||typeof Settings.maxLines!=="number"||typeof Settings.theme!=="object") throw 0;

}catch{

  Settings = {
    columns: 16, // 编辑器列数
    maxLines: 0, // 设置非0正数作为渲染一页的行数
    theme: {} // 编辑器(Canvas)渲染颜色
  };

}
window.addEventListener("beforeunload", ()=> 
  localStorage.setItem("settings", JSON.stringify(Settings)));




