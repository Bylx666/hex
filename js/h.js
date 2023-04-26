// h.js 意思是头文件地位的文件，包含页面框架和基本工具

// ---文档工具---
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



// ---渲染导航栏---
(()=>{

  var frag = document.createDocumentFragment();

  var l = ["<ico>&#xe8ca;</ico>编辑", "<ico>&#xe842;</ico>计算", 
    "<ico>&#xe835;</ico>文件", "<ico>&#xe840;</ico>设置"];
  l.forEach((v, i)=> {

    var $e = $.c("span", v, frag);
    $e.onclick = ()=> Sub.pageTo(i);

  });

  $.i("nav").append(frag);

})();



// ---页面工具 *Sub UI* 厉不厉害你Subkey哥，自己写了一套页面系统--- //
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



// ---小工具---
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

// arraybuffer[]合并为单arraybuffer
function concatBuffers(abArr) {

  var l = abArr.reduce((p,c)=> p+c.byteLength, 0);
  var u = new Uint8Array(l);
  var i = 0;
  for(const ab of abArr) {

    u.set(new Uint8Array(ab) ,i);
    i += ab.byteLength;

  }
  return u.buffer;
  
};



// ---设置---
var Settings = {
  columns: 16, // 编辑器列数
  maxLines: 0, // 设置非0正数作为渲染一页的行数
  theme: { // 编辑器(Canvas)渲染颜色
    editTitle: "#577",
    edit: "#310",
    edit0: "#978a",
    editf: "#f9aa"
  }
};



// ---文件方面API---
var Files = {
  list: [], // 所有打开的文件对象(HexFile[])
  current: -1, // 正在编辑的文件的对象在list里的索引
  loading: 0, // 正在加载的文件数量，大于0时左上角显示加载
  upload: null, // void upload(files) 加载拖拽或上传的文件列表并调用open()
  open: null, // void open(buffer, name) 传入单个文件的buffer并在buffers里加入对应对象
  focus: null, // void focus(index) 传入索引,改变Hex.buffer并跳转到对应文件的编辑界面
  MAX_SAVING_SIZE: 524288000, // 最大保存大小,对应Blob最大大小
};



// ---控制编辑器的API---
// 不要把Hex替换成this, this很容易被传递别的东西
var Hex = {
  file: { // 正在编辑的文件的对象
    buffer: new ArrayBuffer(0), // 文件的原arraybuffer
    view: new DataView(new ArrayBuffer(0)), // buffer的dataview
    time: Date.now(), // 文件打开时间
    name: "", // 文件名字
    len: 0, // length
    history: [], // 修改历史, undo redo这种的
    memo: {}, // 文件注释
  }, 
  get buffer() {return Hex.file.buffer}, 
  get len() {return Hex.file.buffer.byteLength}, 
  get his() {return Hex.file.history}, 
  get view() {return Hex.file.view}, 
  set8(i,v) {return Hex.view.setUint8(i,v)}, 
  get8(i) {return Hex.view.getUint8(i)}, 

  status: 0, // 编辑状态  0:保护原长度模式 ,1:改变原长度模式
  render: null, // Boolean render() 渲染一帧表格, 返回true是渲染到文件尾了
  clipboard: new ArrayBuffer(0), // 剪切板

  // [startIndex, endIndex, (b)mousedown, (b)selected] 
  // [开始索引, 结束索引, bool 鼠标是否按下, bool 选择是否有效]
  // 只有在status为0时才会渲染和调用selection
  selection: [0, 0, 0, 0], 

  cursor: 0, // 闪耀光标
  scroll: 0, // 渲染开始处

  // 在cursor处插入len个byte(s); len值也可指定一个arraybuffer
  insert(len) {

    var i = Hex.cursor;
    var list = null;
    if(i>=Hex.len) list = [
      Hex.buffer, 
      new ArrayBuffer(i-Hex.len+1)
    ];
    else list = [
      Hex.buffer.slice(0,i), 
      len instanceof ArrayBuffer?len:new ArrayBuffer(len), 
      Hex.buffer.slice(i)
    ];
    Hex.file.buffer = concatBuffers(list);

  },

  // 在cursor处[向后]删除len个byte(s)
  delete(len) {

    if(!len) {

      const selection = Hex.selection;
      Hex.cursor = Math.min(selection[0], selection[1]);
      Hex.delete(Math.abs(selection[0] - selection[1]) + 1);
      return selection[3] = 0;

    }
    var i = Hex.cursor;
    if(i+len>Hex.len) len = Hex.len - i;

    Hex.file.buffer = concatBuffers([
      Hex.buffer.slice(0, i), 
      Hex.buffer.slice(i+len)
    ]);

  },
  copy() {

    var sel = Hex.selection;
    if(!sel[3]) return Sub.tip("复制未遂", "长按拖动鼠标选几个字节吧先");
    if(sel[0]>=Hex.len) sel[0] = Hex.len-1;
    if(sel[1]>=Hex.len) sel[1] = Hex.len-1;
    Hex.clipboard = Hex.buffer.slice(
      Math.min(sel[0], sel[1]),
      Math.max(sel[0], sel[1])+1
    );
    Sub.tip("复制成功", "剪切板上现在有"+(Math.abs(sel[0]-sel[1])+1)+"个字节");

    sel[3] = 0;
    Hex.render();

  },
  cut() {
    
    var sel = Hex.selection;
    if(!sel[3]) return Sub.tip("剪切未遂", "长按拖动鼠标选几个字节吧先");
    Hex.cursor = Math.min(sel[0], sel[1]);
    Hex.copy();
    if(Hex.status) Hex.delete(Math.abs(sel[0]-sel[1])+1);
    else {

      const v = new Uint8Array(Hex.buffer);
      v.fill(0x00, Math.min(sel[0], sel[1]), Math.max(sel[0], sel[1])+1);

    }
    Hex.render();

  },
  paste() {

    var sel = Hex.selection;
    if(sel[3]&&Hex.status) Hex.delete();

    if(Hex.status) Hex.insert(Hex.clipboard);
    else {

      const v = new Uint8Array(Hex.buffer);
      let _c = Hex.clipboard;
      if(_c.byteLength+Hex.cursor > Hex.len)
        _c = _c.slice(0, Hex.len - Hex.cursor);
      v.set(new Uint8Array(_c), Hex.cursor);

    }
    Hex.render();

  }

};


