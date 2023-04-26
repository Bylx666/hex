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


// ---- 文件方面API ---- //
var Files = {
  list: [], // 所有打开的文件对象(HexFile[])
  current: -1, // 正在编辑的文件的对象在list里的索引
  loading: 0, // 正在加载的文件数量，大于0时左上角显示加载
  upload: null, // void upload(files) 加载拖拽或上传的文件列表并调用open()
  open: null, // void open(buffer, name) 传入单个文件的buffer并在buffers里加入对应对象
  focus: null, // void focus(index) 传入索引,改变Hex.buffer并跳转到对应文件的编辑界面
  MAX_SAVING_SIZE: 524288000, // 最大保存大小,对应Blob最大大小
};



// ---- 历史记录【类】 ---- //
class HexStory {
  
  list = [];
  now = 0;
  _view = null;

  push(v) {

    this.list.length = this.now++;
    this.list.push(v);

  };

  undo() {
    if(this.now<=0) return 0;

    var undo = this.list[--this.now];
    var typ = undo.type;
    if((typ&2)===0) {

      const { len, buf, index} = undo;
      Hex.cursor = index;
      if(typ===0) return Hex.delete(len, 65);
      if(typ===1) return Hex.insert(buf, 65);

    }else {

      const { index, set, before } = undo;
      Hex.cursor = index;
      if(typ===2) return DataView.prototype["set"+set].call(this._view, index, before);
      if(typ===3) return Hex.write(before, 65);
      
    }

    Hex.render();

  };

  redo() {
    if(this.now>=this.list.length) return 0;

    var redo = this.list[this.now++];
    var typ = redo.type;
    if(typ<2) {

      const { len, buf, index } = redo;
      Hex.cursor = index;
      if(typ===0) return Hex.insert(buf?buf:len, 65);
      if(typ===1) return Hex.delete(len, 65);

    }else {

      const { index, set, after } = redo;
      Hex.cursor = index;
      if(typ===2) return DataView.prototype["set"+set].call(this._view, index, after);
      if(typ===3) return Hex.write(after, 65);
      
    }

  };

  get view() {return this._view};
  // 绑定(劫持)一个dataview使它在set时push一条新历史记录
  set view(dv) {
    if(!dv instanceof DataView) return 0;

    var proto = DataView.prototype;
    this._view = dv;
    ["Uint8", "Int8", "Uint16", "Int16", "Uint32", "Int32", "BigInt64", "BigUint64", "Float32", "Float64"].forEach((type)=> dv["set"+type] = function() {

      var [i, v, l] = arguments;
      Hex.file.history.push({
        type: HexStory.type.SET,
        index: i,
        set: type,
        before: dv["get"+type](i),
        after: v
      });
      proto["set"+type].call(dv, i, v, l);

    });

  }

  static type = {
    INSERT: 0, 
    DELETE: 1, 
    SET: 2, 
    WRITE: 3 
  };

}



// ---- 控制编辑器的API ---- //
// 不要把Hex替换成this, this很容易被传递别的东西
var Hex = {
  file: { // 正在编辑的文件的对象
    buffer: new ArrayBuffer(0), // 文件的原arraybuffer
    view: new DataView(new ArrayBuffer(0)), // buffer的dataview
    time: Date.now(), // 文件打开时间
    name: "", // 文件名字
    len: 0, // length
    history: new HexStory(), // 给你undo的机会
    memo: {}, // 文件注释
  }, 
  get buffer() {return Hex.file.buffer}, 
  get len() {return Hex.file.buffer.byteLength}, 
  get his() {return Hex.file.history}, 
  get view() {return Hex.file.view}, 

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
  insert(len, his) {

    var i = Hex.cursor;
    var isBuffer = len instanceof ArrayBuffer;
    var list = null;
    if(i>=Hex.len) list = [
      Hex.buffer, 
      new ArrayBuffer(i-Hex.len+1)
    ];
    else list = [
      Hex.buffer.slice(0,i), 
      isBuffer?len:new ArrayBuffer(len), 
      Hex.buffer.slice(i)
    ];
    Hex.file.buffer = concatBuffers(list);

    his!==65&&Hex.file.history.push({
      type: HexStory.type.INSERT, 
      index: i, 
      len: isBuffer?len.byteLength:len, 
      buf: isBuffer?len:null
    });

  },

  // 在cursor处[向后]删除len个byte(s)
  delete(len, his) {

    if(!len) { // 不指定长度就直接把选择部分删掉

      const selection = Hex.selection;
      Hex.cursor = Math.min(selection[0], selection[1]);
      Hex.delete(Math.abs(selection[0] - selection[1]) + 1);
      return selection[3] = 0;

    }
    var i = Hex.cursor;
    if(i+len>Hex.len) len = Hex.len - i;

    his!==65&&Hex.file.history.push({
      type: HexStory.type.DELETE,
      index: i,
      len: len,
      buf: Hex.buffer.slice(i, i+len)
    });

    Hex.file.buffer = concatBuffers([
      Hex.buffer.slice(0, i), 
      Hex.buffer.slice(i+len)
    ]);

  },

  // 从cursor处覆盖上一个arraybuffer
  write(buf, his) {

    var i = Hex.cursor;
    var len = buf.byteLength;
    if(i+len > Hex.len) {

      buf = buf.slice(0, Hex.len - i);
      len = Hex.len - i;

    }

    his!==65&&Hex.file.history.push({
      type: HexStory.type.WRITE,
      index: i,
      set: len,
      before: Hex.buffer.slice(i, i + len),
      after: buf
    });
    new Uint8Array(Hex.buffer).set(new Uint8Array(buf), i);

  },

  // 将选择部分用这个val值填充，十分easy
  fill(val) {

    var sel = Hex.selection;
    if(!sel[3]) return Sub.tip("填充未遂", "就喜欢你这样喜欢尝试代码的动力, 但是先选中部分吧");
    const l = Math.abs(sel[0] - sel[1])+1;
    const _arr = new ArrayBuffer(l);
    new Uint8Array(_arr).fill(val);
    Hex.cursor = Math.min(sel[0], sel[1]);
    Hex.write(_arr);
    sel[3] = 0;

  },

  // 复制选择部分
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

    Hex.render();

  },

  // 删除+复制
  cut() {
    
    var sel = Hex.selection;
    if(!sel[3]) return Sub.tip("剪切未遂", "长按拖动鼠标选几个字节吧先");
    Hex.cursor = Math.min(sel[0], sel[1]);
    Hex.copy();
    if(Hex.status) Hex.delete(Math.abs(sel[0]-sel[1])+1);
    else Hex.fill(0);
    Hex.render();

  },

  // insert或遍历写入剪切板
  paste() {

    var sel = Hex.selection;
    if(sel[3]&&Hex.status) Hex.delete();

    if(Hex.status) Hex.insert(Hex.clipboard);
    else Hex.write(Hex.clipboard);
    Hex.render();

  },

};



// 加载serviceworker
"serviceWorker" in navigator&&navigator.serviceWorker.register("/serviceworker.js").then((v)=> console.log(v)).catch((r)=> Sub.tip("无法离线缓存", r.message, ()=>{}, true));

