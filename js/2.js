// 打开页面
Sub.pages[2] = (()=> {

  var $d = $.c("div");
  $d.innerHTML = `
<div id="open-list"></div>
<div id="open-upload">
  <ico>&#xe6e4;</ico>
  <p>拖动文件到浏览器</p>
</div>`;
  $d.style.padding = "15px";
  var $_ = (e)=> $d.querySelector("#"+e);

  // ---- 文件列表界面 ---- //
  var d1 = $_("open-list");
  
  // 聚焦第i个文件
  Files.focus = (i)=> { 

    if(Files.list[i]) $.a(d1.children, d1.children[i]);
    Files.current = i;
    Hex.file = Files.list[i];
    Sub.pageTo(0);
    Hex.scroll = 0;
    Hex.selection[3] = 0;
    $.i("edit-scroll").querySelector("div").style.top = "0px";
    Hex.render();

  };

  // 打开文件的buffer
  Files.open = (buffer, name)=> { 

    var l = buffer.byteLength;
    name = name||"无标题";
    var time = new Date();
    var bobj = {
      _buffer: buffer, // 文件的arraybuffer
      view: new DataView(buffer), 
      get buffer() {return bobj._buffer;}, 
      set buffer(v) {bobj._buffer = v; bobj.view = new DataView(v);}, 
      time: time.getTime(), // 文件打开时间
      get name() {return name;}, // 文件名
      set name(v) { name = $title.value = v}, 
      get len() {return buffer.byteLength;}, // 文件字节数
      set len(v) {$p2.textContent = v + " (" + parseByte(v) + ")";},
      history: new HexStory(), // 修改历史, undo redo这种的
      memo: {}, // 文件注释
    };
    bobj.history.view = bobj.view;
    Files.list.push(bobj);
    d2.i.style.display = "none";
    d1.style.display = "";

    var $file = $.c("div",'<ico>&#xe834;</ico>', d1);

    var $title = $.c("input", 0, $file);
    $title.value = name;
    $title.onclick = (e)=> e.stopPropagation();
    $title.onchange = ()=> name = $title.value;

    $.c("p", time.toLocaleString(), $file);
    var $p2 = $.c("p", l + " (" + parseByte(l) + ")", $file);

    var $flex = $.c("div", 0, $file);
    var $close = $.c("span", "<ico>&#xe83a;</ico>关闭", $flex);
    $close.onclick = (e)=> {
      e.stopPropagation();

      $file.remove();
      var i = Files.list.indexOf(bobj);
      i!==-1&&Files.list.splice(i, 1);
      if(Files.list.length===0) {

        d1.style.display = "none";
        d2.i.style.display = "";

      }

    };

    var $download = $.c("a");
    var $save = $.c("span", "<ico>&#xe833;</ico>保存", $flex);
    $save.onclick = (e)=> {
      e.stopPropagation();

      if(buffer.byteLength > Files.MAX_SAVING_SIZE) 
        return Sub.tip("保存失败", `文件大小超过 ${
        parseByte(Files.MAX_SAVING_SIZE)}, 无法保存`, null, 1);
      $download.href&&URL.revokeObjectURL($download.href);
      $download.download = bobj.name;
      $download.href = URL.createObjectURL(new File([bobj.buffer], name));
      $download.click();
      
    };

    $file.onclick = ()=> Files.focus(Files.list.indexOf(bobj));

    return bobj;

  };

  // 上传文件组
  Files.upload = (files)=> { 
    for(const file of files) {

      var open = ()=> {

        ++Files.loading;
        $.i("loading").querySelector("span").textContent = Files.loading;
        $.i("loading").style.display = "";
        file.arrayBuffer().then((v)=> Files.open(v, file.name))
        .catch(()=> Sub.tip("打开文件错误", file.name+": 别传文件夹啊, 要传就打开文件夹全选拖过来", null, true))
        .finally(()=> {

          --Files.loading;
          $.i("loading").querySelector("span").textContent = Files.loading;
          if(Files.loading<=0) $.i("loading").style.display = "none";
          if(files.length===1) Files.focus(Files.list.length-1);

        });

      };

      if(file.size > Files.MAX_SAVING_SIZE) Sub.tip("确定打开此文件吗", `${file.name}: 此文件大小高达${ parseByte(file.size) }, 超过浏览器最大保存大小, 将无法保存! 而且插入模式下会很卡...`, open);
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
    
    Files.upload(e.dataTransfer.files);
    e.dataTransfer.files.length!==0&&Sub.pageTo(2);

  };


  
  // ---- 上传界面 ---- //
  var d2 = {
    i: $_("open-upload"),
    file: $.c("input")
  };

  // 创建 打开文件按钮
  d2.file.type = "file";
  d2.file.multiple = true;
  d2.file.onchange = ()=> Files.upload(d2.file.files);
  d2.open = $.c("p", "打开文件", d2.i);
  d2.open.className = "a";
  d2.open.onclick = ()=> d2.file.click();

  // 创建 新建文件按钮
  d2.new = $.c("p", "新建文件", d2.i);
  d2.new.className = "a";
  d2.new.onclick = ()=> Files.open(new ArrayBuffer(16));

  return $d;

})();
