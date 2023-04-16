
var $ = { // 文档工具
  i: (e)=> document.getElementById(e),
  c: (t, c, p)=> { // $.c("tag名如div", "HTML文本", parentNode)
  
    var d = document.createElement(t);
    if(c) d.innerHTML = c;
    if(p) p.append(d);
    return d;
  
  }
};
var $main = document.querySelector("main");


// 导航栏
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


// ---页面工具---
var Sub = {
  pages: [], // 4个页面的dom对象
  current: -1, // 目前页面在pages的索引
  pageTo(i) { // 跳转到 i∈[0,3];

    var p = this.pages[i];
    if(!p||i===this.current) return false;
    this.current = i;
  
    var n = $.i("nav").children;
    for(const c of n) c.className = "";
    n[i].className = "active";
  
    $main.textContent = "";
    $main.append(p);
    if(typeof p.onpagein==="function") p.onpagein()

  },
  tip(title, content, callback, warning) { // 确认框或提示框
  
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

  }
};
Sub.tip("欢迎回来", "现在时间: "+new Date().toLocaleTimeString());


// ---小工具---
function parseByte(n) { // 数字转字节数

  if(n===0) return "空文件";
  var ki = Math.floor(Math.log2(n) / 10);
  if(ki===0) return n + " 字节";
  return (n/Math.pow(1024, ki)).toFixed(2)+" "+["", "KB", "MB", "GB"][ki];

}
function toHex(n, length) { // 数字转对应长度的Hex字符串

  var str = n.toString(16).toUpperCase();
  if(length) while(str.length<length) str = "0"+str;
  return str;

}


// ---偏好---
var Settings = {
  columns: 16, // 编辑器列数
};


// ---控制编辑器的API---
var Hex = {
  buffers: [], // 所有打开的文件对象
  current: -1, // 正在编辑的文件的对象在buffers里的索引
  get buffer() { // readonly buffer 快速获取正在编辑的文件的buffer

    var _ = this.buffers[this.current];
    if(!_) return new ArrayBuffer(0);
    return _.buffer;

  },
  MAX_SAVING_SIZE: 524288000, // 最大保存大小,对应Blob最大大小

// from 0.js edit编辑页面 >
  edit: { // 对buffers[current]的实际操作，由编辑器调用,可作为API
    status: 1, // 编辑状态-1:选择,2:删除,3:插入
    selection: [0, 0], // 选中部分,仅编辑状态为1时有用
    cursor: 0, // 光标位置(数字是buffer的索引)
    scroll: 0, // 渲染开始处
    render: null, // Boolean render() 根据viewing渲染一次表格, 返回true是渲染到文件尾了
    insert: null,
    delete: null,
    copy: null,
  },

// from 2.js files文件页面 >
  loading: 0, // 正在加载的文件数量，大于0时左上角显示加载
  upload: null, // void upload(files) 加载拖拽或上传的文件列表并调用open()
  open: null, // void open(buffer, name) 传入单个文件的buffer并在buffers里加入对应对象
  focus: null, // void focus(index) 传入索引,跳转到对应文件的编辑界面
};
