// 编辑页面
Sub.pages[0] = (()=> {

  var $d = $.c("div");
  $d.id = "edit";

  // --表格渲染部分-- //
  var $table = $.c("div", 0, $d);
  $table.id = "edit-table";
  
  Hex.edit.render = ()=> { // 根据Hex.viewing, buffers和current进行表格渲染

    $table.textContent = "";

    var ab = Hex.buffer||new ArrayBuffer(16);
    var abview = new DataView(ab);
    var headered = false;
    var ended = false;

    var lines = $main.clientHeight / 20 - 3;
    var indexLength = ab.byteLength.toString(16).length;
    if($scrollInner) { // 计算滚动条高度

      const max = lines * Settings.columns;
      if(max > ab.byteLength) $scroll.style.display = "none";
      else {

        $scroll.style.display = null;
        const ratio = max / ab.byteLength;
        $scrollInner.style.height = (ratio>0.02?ratio:0.02) * 100 + "%";

      }

    }

    for(let i=Hex.edit.scroll;;) { // 渲染表格

      const $line = $.c("div", 0, $table);
      const $hex = $.c("div", 0, $line);
      $hex.className = "h";
      const $index = $.c("span", (headered?toHex(i, indexLength):""), $hex);
      $index.style.width = indexLength*10 + "px";

      let ascii = "";
      for(let column=0; column<Settings.columns; ++column) {

        if(headered&&i>=ab.byteLength) {

          ended = 1;
          $.c("span", "", $hex);
          continue;

        }
        const byte = (headered?abview.getUint8(i):column);
        const $byte = $.c("span", toHex(byte, 2), $hex);
        if(byte===0&&headered) $byte.className = "o";
        if(byte===255) $byte.className = "f";

        ascii += (headered?
          (byte>32&&byte<127?String.fromCharCode(byte):" ")
          :toHex(column, 1));
        headered&&++i;

      }
      if(!headered) headered = true;

      const $ascii = $.c("div", ascii, $line);
      $ascii.className = "a";

      if((i-Hex.edit.scroll)/Settings.columns>lines||ended) return ended;

    }

  };



  // --工具栏部分-- //
  var $tool = $.c("div", 0, $d);
  $tool.id = "edit-tools";
  var toolA = {
    select: $.c("p", "<ico>&#xe638;</ico>选择", $tool),
    delete: $.c("p", "<ico>&#xe829;</ico>删除", $tool),
    insert: $.c("p", "<ico>&#xe82b;</ico>插入", $tool)
  };
  $.c("hr", null, $tool)
  var toolB = {
    cut: $.c("p", "<ico>&#xe83b;</ico>剪切", $tool),
    copy: $.c("p", "<ico>&#xe83d;</ico>复制", $tool),
    paste: $.c("p", "<ico>&#xe836;</ico>粘贴", $tool),
    undo: $.c("p", "<ico>&#xe636;</ico>撤销", $tool),
    redo: $.c("p", "<ico>&#xe635;</ico>重做", $tool)
  };
  $.c("hr", null, $tool)
  var toolC = {
    script: $.c("p", "<ico>&#xec68;</ico>脚本", $tool),
    find: $.c("p", "<ico>&#xe843;</ico>查找", $tool),
    memo: $.c("p", "<ico>&#xe84a;</ico>注释", $tool)
  };



  // --渲染滚动条-- //
  var $scroll = $.c("div", 0, $d);
  $scroll.id = "edit-scroll";
  $scroll.style.display = "none";
  var $scrollInner = $.c("div", 0, $scroll);
  var scrollTop = 0;

  // 滚动条拖动
  $scrollInner.onmousedown = (e)=> {

    var length = Hex.buffer.byteLength;
    var height = $main.clientHeight - $scrollInner.clientHeight;
    var scrollTop = $scrollInner.offsetTop;

    var mousemove = (_e)=> {

      var _scrollTop = scrollTop + _e.clientY - e.clientY;
      if(_scrollTop < 0) _scrollTop = 0;
      if(_scrollTop > height) _scrollTop = height;
      $scrollInner.style.top = _scrollTop + "px";
      Hex.edit.scroll = Math.floor(_scrollTop / height * length / Settings.columns)
       * Settings.columns;
      Hex.edit.render();

    };
    var mouseup = ()=> {

      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);

    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);

  };

  // 鼠标滚动
  $table.onwheel = (e)=> {

    var height = $main.clientHeight - $scrollInner.clientHeight;
    var s = Hex.edit.scroll + Math.floor(e.deltaY/48)*Settings.columns;
    var l = Hex.buffer.byteLength;
    if(s>=l) s = l + l%Settings.columns;
    if(s<0) s = 0;
    Hex.edit.scroll = s;
    $scrollInner.style.top = s / l * height + "px";
    Hex.edit.render();

  };

  return $d;

})();
