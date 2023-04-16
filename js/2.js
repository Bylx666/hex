// 打开页面
Sub.pages[2] = (()=> {

  var d = $.c("div");
  d.innerHTML = `
<div id="open-list"></div>
<div id="open-upload">
  <ico>&#xe6e4;</ico>
  <p>拖动文件到浏览器</p>
</div>`;
  d.style.padding = "15px";
  var $_ = (e)=> d.querySelector("#"+e);

  // --文件列表界面
  var d1 = $_("open-list");
  
  Hex.focus = (i)=> { // 聚焦第i个文件

    for(const c of d1.children) c.className = "";
    if(Hex.buffers[i]) d1.children[i].className = "active";
    Hex.current = i;
    Hex.edit.render();
    Sub.pageTo(0);

  };

  Hex.open = (buffer, name)=> { // 打开文件的buffer

    var l = buffer.byteLength;
    name = name||"无标题";
    var time = new Date();
    var bobj = {
      "buffer": buffer, // 文件的arraybuffer
      "time": time.getTime(), // 文件打开时间
      get name() {return name;}, // 文件名
      set name(v) {f.h3.textContent = name = v;},
      get len() {return buffer.byteLength;}, // 文件字节数
      set len(v) {f.p2.textContent = l + " (" + parseByte(l) + ")";},
      inserted: [], // 增加buffer长度的修改内容
      deleted: [], // 减少buffer长度的修改内容
      history: [], // 修改历史, undo redo这种的
      memo: [], // 文件注释
    };
    Hex.buffers.push(bobj);
    d2.i.style.display = "none";
    d1.style.display = "";

    var f = {
      i: $.c("div",'<ico>&#xe834;</ico>', d1),
      a: $.c("a")
    };

    f.h3 = $.c("h3", name, f.i);
    f.p1 = $.c("p", "打开时间: "+ time.toLocaleString(), f.i);
    f.p2 = $.c("p", l + " (" + parseByte(l) + ")", f.i);

    f.flex = $.c("div", 0, f.i);
    f.close = $.c("span", "<ico>&#xe83a;</ico>关闭", f.flex);
    f.close.onclick = (e)=> {
      e.stopPropagation();

      f.i.remove();
      var i = Hex.buffers.indexOf(bobj);
      i!==-1&&Hex.buffers.splice(i, 1);
      if(Hex.buffers.length===0) {

        d1.style.display = "none";
        d2.i.style.display = "";

      }

    };
    f.save = $.c("span", "<ico>&#xe833;</ico>保存", f.flex);
    f.save.onclick = (e)=> {
      e.stopPropagation();

      if(buffer.byteLength > Hex.MAX_SAVING_SIZE) 
        return Sub.tip("保存失败", `文件大小超过 ${
        parseByte(Hex.MAX_SAVING_SIZE)}, 无法保存`, null, 1);
      f.a.download = bobj.name;
      f.a.href = URL.createObjectURL(new File([bobj.buffer], name));
      f.a.click();
      URL.revokeObjectURL(f.a.href);
      
    };

    f.i.onclick = ()=> Hex.focus(Hex.buffers.indexOf(bobj));

  }

  Hex.upload = (files)=> { // 上传文件组
    for(const file of files) {

      var open = ()=> {

        ++Hex.loading;
        $.i("loading").querySelector("span").textContent = Hex.loading;
        $.i("loading").style.display = "";
        file.arrayBuffer().then((v)=> Hex.open(v, file.name))
        .catch(()=> Sub.tip("打开文件错误", file.name+": 别传文件夹啊, 要传就打开文件夹全选拖过来", null, true))
        .finally(()=> {

          --Hex.loading;
          $.i("loading").querySelector("span").textContent = Hex.loading;
          if(Hex.loading<=0) $.i("loading").style.display = "none";
          if(files.length===1) Hex.focus(Hex.buffers.length-1);

        });

      };

      if(file.size > Hex.MAX_SAVING_SIZE) Sub.tip("确定打开此文件吗", `${file.name}: 此文件大小高达${ parseByte(file.size) }, 超过浏览器最大保存大小, 将无法保存!`, open);
      else open();

    }
  };

  // 拖拽文件
  document.body.ondragenter = document.body.ondragover = (e)=> {

    e.preventDefault();
    e.stopPropagation();
    return 0;

  };
  document.body.ondrop = (e)=> {

    e.preventDefault();
    e.stopPropagation();
    
    Hex.upload(e.dataTransfer.files);
    e.dataTransfer.files.length!==0&&Sub.pageTo(2);

  };


  // --上传界面
  var d2 = {
    i: $_("open-upload"),
    file: $.c("input")
  };
  
  // 创建 打开文件按钮
  d2.file.type = "file";
  d2.file.multiple = true;
  d2.file.onchange = ()=> Hex.upload(d2.file.files);
  d2.open = $.c("p", "打开文件", d2.i);
  d2.open.className = "a";
  d2.open.onclick = ()=> d2.file.click();

  // 创建 新建文件按钮
  d2.new = $.c("p", "新建文件", d2.i);
  d2.new.className = "a";
  d2.new.onclick = ()=> Hex.open(new ArrayBuffer(16));

  return d;

})();
