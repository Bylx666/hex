// ---- 文件方面API ---- //
var HexFiles = {
  list: [], // 所有打开的文件对象(HexFile[])
  current: -1, // 正在编辑的文件的对象在list里的索引
  loading: 0, // 正在加载的文件数量，大于0时左上角显示加载

  // void upload(files) 加载拖拽或上传的文件列表并调用open()
  upload(fs, from) {

    if(this.emit("upload", {
      type: "upload", 
      files: fs, 
      from
    })) return 0;

    for(const file of fs) {

      const open = ()=> {

        ++this.loading;
        $.i("loading").querySelector("span").textContent = this.loading;
        $.i("loading").style.display = "";

        var fr = new FileReader();
        fr.onload = ()=> this.open(fr.result, file.name, from);
        fr.onerror = ()=> Sub.tip("打开文件错误", file.name+": 别传文件夹啊, 要传就打开文件夹全选拖过来", null, true);
        fr.onloadend = ()=> {

          --this.loading;
          $.i("loading").querySelector("span").textContent = this.loading;
          if(this.loading<=0) $.i("loading").style.display = "none";
          if(fs.length===1) this.focus(this.list.length-1, from);

        };
        fr.readAsArrayBuffer(file);

      };

      if(file.size > this.MAX_SAVING_SIZE) Sub.tip("确定打开此文件吗", `${file.name}: 此文件大小高达${ parseByte(file.size) }, 超过浏览器最大保存大小, 将无法保存! 而且插入模式下会很卡...`, open);
      else open();

    }

  }, 

  // open(buffer, name) 传入单个文件的buffer并在buffers里加入对应对象
  open(buffer, name, from) {

    var file = new HexFile(buffer, name);
    if(this.emit("open", {
      type: "open", 
      file, 
      from
    })) return 0;

    this.list.push(file);
    return file;

  }, 

  // void focus(index) 传入索引,改变Hex.buffer并跳转到对应文件的编辑界面
  focus(i, from) {

    var file = this.list[i];
    if(!file) return 0;
    if(this.emit("focus", {
      type: "focus", 
      file, 
      index: i, 
      from
    })) return 0;

    this.current = i;
    Editor.file = this.list[i];
    Sub.pageTo(0);
    $.i("edit-scroll").querySelector("div").style.top = "0px";
    Editor.render();
    document.title = file.name;
    var openList = Sub.pages[2].querySelector("#open-list").children;
    $.a(openList, openList[i]);

  }, 
  MAX_SAVING_SIZE: 524288000, // 最大保存大小,对应Blob最大大小
};
EventEmitter.extBy(HexFiles);

// 文件【类】//
function HexFile(buffer, name) {

  this.buffer = buffer; // 文件的arraybuffer
  this.len = buffer.byteLength;

  this.history = new HexStory(this), // 修改历史, undo redo这种的
  this.view = this.history.view;

  this.time = Date.now(), // 文件打开时间
  this.name = name||"无标题";
  this.memo = {}, // 文件注释

  // [startIndex, endIndex, (b)mousedown, (b)selected] 
  // [开始索引, 结束索引, bool 鼠标是否按下, bool 选择是否有效]
  this.selection = [0, 0, 0, 0];
  this.cursor = 0; // 选择框指针位置
  this.cursor1 = -1; // 输入的byte前四位，-1则为输入前4位，否则后四位
  this.scroll = 0; // 翻页位置

  EventEmitter.call(this);

}

HexFile.prototype = Object.create(
 EventEmitter.prototype, Object.getOwnPropertyDescriptors({

  setBuffer(v, from) {

    var len = v.byteLength;
    if(this.emit("reset", {
      type: "reset", 
      before: this.buffer.byteLength, 
      after: v.byteLength, 
      from
    })) return 0;

    this.buffer = v;
    this.view = new HexStoryDataView(this.history);
    this.history.view = this.view;
    this.len = len;

  },

  // 在cursor处插入len个byte(s); len值也可指定一个arraybuffer
  insert(len, from) {

    var i = this.cursor;
    var isBuffer = len instanceof ArrayBuffer;
    if(this.emit("insert", {
      type: "insert", 
      length: isBuffer?len.byteLength:len, 
      data: isBuffer?len:null, 
      index: i, 
      from
    })) return 0;

    var buf = null;
    if(i>=this.len) buf = concatBuffers(
      this.buffer, 
      isBuffer?len:new ArrayBuffer(i-this.len+1)
    );
    else buf = concatBuffers(
      this.buffer.slice(0,i), 
      isBuffer?len:new ArrayBuffer(len), 
      this.buffer.slice(i));
    this.setBuffer(buf, "proto-insert");

    from!=="history"&&this.history.push({
      type: HexStory.type.INSERT, 
      index: i, 
      len: isBuffer?len.byteLength:len, 
      buf: isBuffer?len:null
    });

  },

  // 在cursor处[向后]删除len个byte(s)
  delete(len, from) {

    if(!len) { // 不指定长度就直接把选择部分删掉

      const sel = this.selection;
      this.cursor = Math.min(sel[0], sel[1]);
      this.delete(Math.abs(sel[0] - sel[1]) + 1, from);
      return sel[3] = 0;

    }

    var i = this.cursor;
    if(i+len>this.len) len = this.len - i;
    var deleted = this.buffer.slice(i, i+len);
    if(this.emit("delete", {
      type: "delete", 
      length: len, 
      data: deleted, 
      index: i, 
      from
    })) return 0;

    from!=="history"&&this.history.push({
      type: HexStory.type.DELETE,
      index: i,
      len: len,
      buf: deleted
    });

    this.setBuffer(concatBuffers(
      this.buffer.slice(0, i), 
      this.buffer.slice(i+len)
    ), "proto-delete");

  },

  // 从cursor处覆盖上一个arraybuffer
  write(buf, from) {

    var i = this.cursor;
    var len = buf.byteLength;
    if(i+len > this.len) {

      buf = buf.slice(0, this.len - i);
      len = this.len - i;

    }

    var obj = {
      index: i, 
      before: this.buffer.slice(i, i + len), 
      after: buf 
    };
    if(this.emit("write", {
      type: "write", 
      from, 
      length: len, 
      ...obj
    })) return 0;

    from!=="history"&&this.history.push({
      type: HexStory.type.WRITE, 
      set: len, 
      ...obj
    });

    new Uint8Array(this.buffer).set(new Uint8Array(buf), i);

  },

  // 将选择部分用这个val值填充，十分easy
  fill(val, from) {

    var sel = this.selection;
    if(!sel[3]) return Sub.tip("填充未遂", "就喜欢你这样喜欢尝试代码的动力, 但是先选中部分吧");
    const l = Math.abs(sel[0] - sel[1])+1;
    const _arr = new ArrayBuffer(l);
    new Uint8Array(_arr).fill(val);
    this.cursor = Math.min(sel[0], sel[1]);
    this.write(_arr, from);
    sel[3] = 0;

  },

  // 复制选择部分
  copy(from) {

    var sel = this.selection;
    if(!sel[3]) return Sub.tip("复制未遂", "长按拖动鼠标选几个字节吧先");

    for(let i=0; i<2; ++i) if(sel[i]>=this.len) sel[i] = this.len-1;
    var starti = Math.min(sel[0], sel[1]);
    var endi = Math.max(sel[0], sel[1])+1;
    var copied = this.buffer.slice(starti, endi);

    if(this.emit("copy", {
      type: "write", 
      from, 
      data: copied, 
      index: starti, 
      length: copied.byteLength
    })) return 0;

    Editor.clipboard = copied;
    Sub.tip("复制成功", "剪切板上现在有"+(Math.abs(sel[0]-sel[1])+1)+"个字节");

    Editor.render();

  },

  // 删除+复制
  cut(from) {
    
    var sel = this.selection;
    if(!sel[3]) return Sub.tip("剪切未遂", "长按拖动鼠标选几个字节吧先");
    this.cursor = Math.min(sel[0], sel[1]);
    this.copy(from);
    if(Editor.status) this.delete(Math.abs(sel[0]-sel[1])+1, from);
    else this.fill(0, from);
    Editor.render();

  },

  // insert或遍历写入剪切板
  paste(from) {

    var sel = this.selection;
    if(sel[3]&&Editor.status) this.delete(0, from);

    if(Editor.status) this.insert(Editor.clipboard, from);
    else this.write(Editor.clipboard, from);
    Editor.render();

  }

}));
