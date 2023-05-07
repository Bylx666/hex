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
  var $d1 = $_("open-list");

  // 打开文件时创建div
  function openFile(e) {

    var file = e.file;
    d2.i.style.display = "none";
    $d1.style.display = "";

    var $file = $.c("div",'<ico>&#xe834;</ico>', $d1);

    var $title = $.c("input", 0, $file);
    $title.value = file.name;
    $title.onclick = (e)=> e.stopPropagation();
    $title.onchange = ()=> file.name = $title.value;

    $.c("p", new Date(file.time).toLocaleString(), $file);
    var $len = $.c("p", file.len + " (" + parseByte(file.len) + ")", $file);

    var $flex = $.c("div", 0, $file);
    var $close = $.c("span", "<ico>&#xe83a;</ico>关闭", $flex);
    $close.onclick = (e)=> {
      e.stopPropagation();

      $file.remove();
      var i = HexFiles.list.indexOf(file);
      i!==-1&&HexFiles.list.splice(i, 1);
      if(HexFiles.list.length===0) {

        $d1.style.display = "none";
        d2.i.style.display = "";

      }

    };

    var $download = $.c("a");
    var $save = $.c("span", "<ico>&#xe833;</ico>保存", $flex);
    $save.onclick = (e)=> {
      e.stopPropagation();

      if(file.len > HexFiles.MAX_SAVING_SIZE) 
        return Sub.tip("保存失败", `文件大小超过 ${
        parseByte(HexFiles.MAX_SAVING_SIZE)}, 无法保存`, null, 1);
      $download.href&&URL.revokeObjectURL($download.href);
      $download.download = file.name;
      $download.href = URL.createObjectURL(new Blob([file.buffer]));
      $download.click();

    };

    $file.onclick = ()=> HexFiles.focus(HexFiles.list.indexOf(file), "user-click");

    // 改变长度时刷新length
    file.on("lengthchange", (e)=>
     $len.textContent = e.after + " (" + parseByte(e.after) + ")");

  }
  HexFiles.on("open", openFile);



  // 拖拽文件
  document.body.ondragenter = document.body.ondragover = (e)=> {

    e.preventDefault();
    e.stopPropagation();
    return 0;

  };
  document.body.ondrop = (e)=> {

    e.preventDefault();
    e.stopPropagation();

    HexFiles.upload(e.dataTransfer.files, "user-drop-upload");
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
  d2.file.onchange = ()=> HexFiles.upload(d2.file.files, "user-select-upload");
  d2.open = $.c("p", "打开文件", d2.i);
  d2.open.className = "a";
  d2.open.onclick = ()=> d2.file.click();

  // 创建 新建文件按钮
  d2.new = $.c("p", "新建文件", d2.i);
  d2.new.className = "a";
  d2.new.onclick = ()=> HexFiles.open(new ArrayBuffer(16), "", "user-newfile");

  return $d;

})();
