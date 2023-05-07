// 编辑页面-编辑器表格, 数据查看器
Sub.pages[0] = (()=> {

  var $d = $.c("div");
  $d.id = "edit";

  // ---- 表格渲染部分 ---- //
  var $table = $.c("canvas", 0, $d);
  var t2d = $table.getContext("2d");
  window.addEventListener("resize", ()=> Editor.render());

  // 表格渲染
  Editor.render = ()=> {

    if(Editor.emit("render", {
      type: "render", 
      file: Hex, 
      from: "unknown"
    })) return 0;

    // 渲染用的数据
    var cs = Settings.columns; // 设置的列数
    var headered = false; // 是否画过第一行表头
    var lines = Settings.maxLines>0?Settings.maxLines:
     Math.floor($main.clientHeight / 20) - 3; // 一页最大行数
    var indexLength = Hex.len.toString(16).length; // 左侧表头长度
    var scroll = Hex.scroll; // 渲染开头索引
    var left = indexLength * 10 + 27; // 表格主体左间距
    var top = 27; // 上间距
    var sel = Hex.selection;

    // 主题色
    var { editTitle, edit, edit0, editf, select, selecti, cross } = Settings.theme;
    editTitle = editTitle||"#577";
    edit = edit||"#310";
    edit0 = edit0||"#657a";
    editf = editf||"#f9aa";
    select = select||"#521";
    selecti = selecti||"#e51";
    cross = cross||"#6af";

    // 清空canvas
    $table.height = $main.clientHeight;
    $table.width = cs * 36 + indexLength * 10 + 45;
    t2d.clearRect(0, 0, $table.width, $table.height);
    t2d.font = '16px code, "Cascadia Mono", Consolas, monospace';
    t2d.textAlign = "left";

    // 计算滚动条高度
    if($scrollInner) {

      const max = lines * cs;
      if(max > Hex.len) $scroll.style.display = "none";
      else {

        $scroll.style.display = null;
        const ratio = max / Hex.len;
        $scrollInner.style.height = (ratio>0.02?ratio:0.02) * 100 + "%";

      }

    }

    // 刷新数据查看器
    curUint8 = Hex.view.getUint8(Hex.cursor);
    for(let i=0; i<8; ++i) {

      if(curUint8>>(7-i)&1) bin021(i, $bin.children[i]);
      else bin120(i, $bin.children[i]);

    }
    for(const type of Object.keys(detailInputs)) 
      detailInputs[type].value = Hex.view["get"+type](Hex.cursor, Editor.littleEndian);

    // 渲染选中背景
    var selN = Math.min(sel[0], sel[1]) - scroll;
    var selX = Math.max(sel[0], sel[1]) - scroll;
    if(sel[3]&&selX>=0&&selN/cs<lines+1) {

      if(selN<0) selN = 0;
      if(selX>=(lines+1)*cs) selX = (lines+1)*cs-1;
      const selNx = selN % cs;
      const selNy = Math.floor(selN / cs);
      const selXx = selX % cs + 1;
      const selXy = Math.floor(selX / cs) + 1;
      const _top = top + 5;
      const _left = left - 2;
      if(selNy+1===selXy&&selNx>=0&&selNy>=0) 
        t2d.rect(_left+selNx*24, _top+20*selNy, 24*(selXx-selNx), 20);
      else {

        t2d.beginPath();
        t2d.moveTo(_left+selNx*24, _top+20*selNy);
        t2d.lineTo(_left+24*cs,    _top+20*selNy);
        t2d.lineTo(_left+24*cs,    _top+20*(selXy-1));
        t2d.lineTo(_left+24*selXx, _top+20*(selXy-1));
        t2d.lineTo(_left+24*selXx, _top+20*selXy);
        t2d.lineTo(_left,          _top+20*selXy);
        t2d.lineTo(_left,          _top+20*(selNy+1));
        t2d.lineTo(_left+selNx*24, _top+20*(selNy+1));
        t2d.lineTo(_left+selNx*24, _top+20*selNy);
        t2d.closePath();

      }
      t2d.fillStyle = "#fff5";
      t2d.fill();
      t2d.lineWidth = 1;
      t2d.strokeStyle = select;
      if(Editor.status) t2d.strokeStyle = selecti;
      t2d.stroke();

    }

    // 渲染按下的位置的选择框
    var sel0 = Hex.cursor - scroll;
    if(sel0>=0&&sel0/cs<lines+1) {

      t2d.lineWidth = 2;
      t2d.strokeStyle = "#3558";
      const width = !Editor.status?28:1;
      const y = top+3+Math.floor(sel0/cs)*20;
      t2d.strokeRect(left-4+(sel0%cs)*24, y, width, 24);
      t2d.strokeStyle = "#3558";

      if(Hex.cursor1!==-1) {

        t2d.fillStyle = cross+"5";
        t2d.fillRect(left+9+(sel0%cs)*24, y+2, 10, 20);

      }

      t2d.fillStyle = cross+"3";
      t2d.fillRect(0, y+2, $table.width, 20);
      t2d.fillStyle = cross+"1";
      t2d.fillRect(left-2+(sel0%cs)*24, 0, 24, $table.height);

    }

    // 从滚动位置开始遍历渲染一页内容
    for(let i=scroll;;) {

      // 行数对应的top高度
      const y = (i-scroll) / cs * 20 + top;

      // 渲染左表头
      t2d.fillStyle = editTitle;
      headered&&t2d.fillText(toHex(i, indexLength), 20, y+20, indexLength*10);

      for(let column=0; column<cs; ++column) {
        if(headered&&i>=Hex.len) return 1;

        // 列数对应的left长度
        const x = column * 24 + left; 

        // 渲染hex
        const byte = (headered?Hex.view.getUint8(i):column);
        if(!headered) t2d.fillStyle = editTitle;
        else if(byte===0) t2d.fillStyle = edit0;
        else if(byte===255) t2d.fillStyle = editf;
        else t2d.fillStyle = edit;
        t2d.fillText(toHex(byte, 2), x, y + (headered?20:0));

        // 渲染ascii
        const ax = cs * 24 + indexLength * 10 + 30 + column * 12;
        if(!headered) {

          t2d.fillStyle = editTitle;
          t2d.fillText(toHex(column, 1), ax, y);

        }else if(byte>32&&byte<127) {

          t2d.fillStyle = edit;
          t2d.fillText(String.fromCharCode(byte), ax, y + 20);

        }

        headered&&++i;

      }
      if(!headered) headered = true;

      if((i-scroll)/cs>lines) return 0;

    }

  };



  // ---- 选中 ---- //
  // 返回鼠标在$table点击的byte的位置和索引
  var pos = (e)=> {

    var l = Hex.len;
    var left = l.toString(16).length * 10 + 25;
    var top = 30;
    var cs = Settings.columns;

    var x = Math.floor((e.offsetX - left) / 24); // 列位置
    var y = Math.floor((e.offsetY - top) / 20); // 行位置
    if(x>=cs) x = cs-1;
    if(x<0) x = 0;
    if(y>l/cs) y = Math.floor(l/cs);
    if(y<0) y = 0;

    var i = Hex.scroll + y*cs + x; // byte index
    if(i>l) i = l;

    return i;

  };

  $table.onmousedown = (e)=> {
    if(e.button!==0) return 0;

    var sel = Hex.selection;
    Hex.cursor = sel[0] = pos(e);
    sel[2] = 1; // 1==true
    sel[3] = 0; // 0==false
    Hex.cursor1 = -1; // 重置单byte输入
    Editor.render();

    var mouseup = ()=> {

      sel[2] = 0;
      document.removeEventListener("mouseup", mouseup);

    };
    document.addEventListener("mouseup", mouseup);

  };
  $table.onmousemove = (e)=> {

    var il = Hex.len.toString(16).length;
    var p = pos(e);
    var sel = Hex.selection;

    if(sel[2]) {

      sel[1] = p;
      sel[3] = 1;
      Editor.render();

    }else {

      t2d.clearRect(0, 0, il*10+25, 30);
      t2d.fillStyle = Settings.theme.editTitle||"#577";
      t2d.fillText(toHex(p, il), 20, 27);

    }

  };



  // ---- 键盘事件 ---- //
  $table.tabIndex = 1;
  $d.tabIndex = 2;
  $d.onkeydown = (e)=> { // 空格聚焦

    if(e.key===" ") {

      $table.focus();
      return false;

    }
    return true;

  };
  var keyTipped = false;
  $table.onkeydown = (e)=> {

    e.preventDefault();
    e.stopPropagation();

    if(!keyTipped&&localStorage.getItem("edit-key-tip")!=="1") {

      keyTipped = true;
      Sub.tip("注意键盘", "你第一次聚焦编辑器, 键盘会被编辑器占用, 连F5都点不了的哦。点编辑器以外的地方恢复\n~点确认不再提示",
       ()=> localStorage.setItem("edit-key-tip", "1"), true);

    }

    var k = e.key;
    var code = k.charCodeAt(0);
    var sel = Hex.selection;

    // 处理快捷键
    if(e.ctrlKey) {

      switch(k) {
        case "a":case "A": Hex.selection = [0, Hex.len-1, 0, 1];break;
        case "x":case "X": Hex.cut("user-key-cut");break;
        case "c":case "C": Hex.copy("user-key");break;
        case "v":case "V": Hex.paste("user-key-paste");break;
        case "s":case "S": Sub.pages[2].querySelectorAll(".active > div > span")[1].click();break;
        case "z":case "Z": Hex.history[e.shiftKey?"redo":"undo"]("user-key");break;
        case "y":case "Y": Hex.history.redo("user-key");break;
      }

    // 处理hex输入
    }else if(k.length===1&&(
     (code>=48&&code<=57) || // 0-9
     (code>=97&&code<=102)|| // a-f
     (code>=65&&code<=70))) { // A-F

      const n = parseInt(k, 16);

      if(!Editor.status&&Hex.cursor>=Hex.len) return 0;
      if(Editor.status&&sel[3]) Hex.delete(0, "user-key");
      if(Editor.status&&Hex.cursor1===-1) Hex.insert(1, "user-key");

      let i = Hex.cursor;
      if(Hex.cursor1===-1) { // 前4位

        const v = Hex.view.getUint8(i)&0x0f;
        Hex.view.setUint8(i, v|(n<<4), 0, "user-key");
        Hex.cursor1 = n;

      }else { // 后4位

        const v = Hex.cursor1<<4;
        Hex.view.setUint8(i, v|n, 0, "user-key");
        if(++Hex.cursor>=Hex.len&&!Editor.status) Hex.cursor = 0;
        Hex.cursor1 = -1;

      }


    // 处理光标移动
    }else if(k.startsWith("Arrow")) {

      const cs = Settings.columns;
      k==="ArrowLeft"&&--Hex.cursor;
      k==="ArrowRight"&&++Hex.cursor;
      k==="ArrowUp"&&(Hex.cursor -= cs);
      k==="ArrowDown"&&(Hex.cursor += cs);
      if(Hex.cursor<0) Hex.cursor = 0;
      if(Hex.cursor>=Hex.len&&!Hex.status) Hex.cursor = Hex.len - 1;
      Hex.cursor1 = -1;
      Editor.render();


    // 插入 删除 回档
    }else if(k==="Insert") $.i("edit-tools").children[0].onmousedown();
    else if(k==="Backspace"||k==="Delete") {

      const back = k==="Backspace";
      if(Editor.status) {

        if(sel[3]) Hex.delete(0, "user-key");
        else if(Hex.cursor>0) {

          back&&--Hex.cursor;
          Hex.delete(1, "user-key");
          
        }
        Hex.cursor1 = -1;

      }else {

        const val = back?0x00:0xff;
        if(sel[3]) Hex.fill(val);
        else {

          Hex.view.setUint8(Hex.cursor, val, 0, "user-key");
          if(back&&--Hex.cursor<0&&!sel[3]) Hex.cursor = 0;

        }

      }

    // home end
    }else if(k==="Home") Hex.cursor = Hex.scroll = 0;
    else if(k==="End") {

      Hex.scroll = Math.floor(Hex.len/Settings.columns)*Settings.columns;
      Hex.cursor = Hex.len - 1;
      
    }

    Editor.render();

  };



  // ---- 渲染滚动条 ---- //
  var $scroll = $.c("div", 0, $d);
  $scroll.id = "edit-scroll";
  $scroll.style.display = "none";
  var $scrollInner = $.c("div", 0, $scroll);

  // 滚动条拖动
  $scrollInner.onmousedown = (e)=> {
    e.stopPropagation();

    var length = Hex.len;
    var height = $main.clientHeight - $scrollInner.clientHeight;
    var scrollTop = $scrollInner.offsetTop;

    var mousemove = (_e)=> {

      var _scrollTop = scrollTop + _e.clientY - e.clientY;
      if(_scrollTop < 0) _scrollTop = 0;
      if(_scrollTop > height) _scrollTop = height;
      $scrollInner.style.top = _scrollTop + "px";
      Hex.scroll = Math.floor(_scrollTop / height * length / Settings.columns)
       * Settings.columns;
      Editor.render();
      getSelection().empty();

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
    var s = Hex.scroll + Math.floor(e.deltaY/48)*Settings.columns;
    var l = Hex.len;
    if(s>=l) s = l - l%Settings.columns;
    if(s<0) s = 0;
    Hex.scroll = s;
    $scrollInner.style.top = s / l * height + "px";
    Editor.render();

  };

  // 点击滑动
  $scroll.onmousedown = (e)=> {

    var height = $main.clientHeight - $scrollInner.clientHeight;
    var pos = e.offsetY;
    if(pos>height) pos = height;
    if(pos<0) pos = 0;
    $scrollInner.style.top = pos + "px";
    Hex.scroll = Math.floor(pos / height * Hex.len
     / Settings.columns) * Settings.columns;
    Editor.render();

  };



  var $right = $.c("div", 0, $d);
  $right.id = "edit-right";

  // ---- 渲染byte详情 ---- //
  var $detail = $.c("div", 0, $right);
  $detail.id = "edit-detail";
  var $detailH3 = $.c("h3", "<ico>&#xe82c;</ico>数据查看器", $detail);
  var $endian = $.c("span", "大字节序", $detailH3);
  $endian.onmousedown = function f() {

    Editor.littleEndian = true;
    $endian.textContent = "小字节序";
    Editor.render();
    $.a([], $endian);
    $endian.onmousedown = ()=> {

      Editor.littleEndian = false;
      $endian.textContent = "大字节序";
      Editor.render();
      $.a([$endian], null);
      $endian.onmousedown = f;

    };
  };

  var detailInputs = {};
  
  // 二进制显示
  var $binContainer = $.c("div", 0, $detail);
  $.c("b", "2", $binContainer);
  $.c("p", "进制数", $binContainer);
  var $bin = $.c("div", 0, $binContainer);
  $bin.id = "edit-detail-bin";

  var curUint8 = 0;
  var bin021 = (i, $span)=> {

    $span.textContent = "1";
    $span.className = "t";
    $span.onclick = ()=> {

      Hex.view.setUint8(Hex.cursor, curUint8&~(1<<(7-i)), 0, "user-binclick");
      bin120(i, $span);
      Editor.render();

    };

  };
  var bin120 = (i, $span)=> {

    $span.textContent = "0";
    $span.className = "f";
    $span.onclick = ()=> {

      Hex.view.setUint8(Hex.cursor, curUint8|1<<(7-i), 0, "user-binclick");
      bin021(i, $span);
      Editor.render();

    };

  };
  for(let i=0; i<8; ++i) $.c("span", 0, $bin);

  // 十进制显示
  // 双栏显示的输入框
  var detailChangeEv = (constru, type)=> (e)=> {

    var $inp = e.target;
    var num = constru($inp.value.match(/(\-?)\d+/));
    if(num===NaN) return 0;
    $inp.value = num;
    Hex.view["set"+type](Hex.cursor, num, Editor.littleEndian, "user-detail-input");
    Editor.render();

  };

  var detail2Columns = ["Uint8", "Int8", "Uint16", "Int16", "Uint32", "Int32"];
  for(let i=0; i<detail2Columns.length; i+=2) {

    const c1type = detail2Columns[i];
    const c2type = detail2Columns[i+1];

    const $p = $.c("div", 0, $detail);
    $p.className = "d";
    $.c("b", c1type.match(/\d+/), $p);
    $.c("p", "位整型", $p);
    const $inp1 = $.c("input", 0, $p);
    const $inp2 = $.c("input", 0, $p);
    detailInputs[c1type] = $inp1;
    detailInputs[c2type] = $inp2;
    $inp1.onchange = detailChangeEv((v)=> v?parseInt(v[0]):0, c1type);
    $inp2.onchange = detailChangeEv((v)=> v?parseInt(v[0]):0, c2type);

  }

  // 单栏输入框
  ["BigUint64", "BigInt64"].forEach((type, i)=> {

    var $p = $.c("div", 0, $detail);
    $.c("b", "64", $p);
    $.c("p", (i?"位":"正")+"整型", $p);
    var $inp = $.c("input", 0, $p);
    detailInputs[type] = $inp;
    $inp.onchange = detailChangeEv((v)=> v?BigInt(v[0]):0n, type);

  });
  ["Float32", "Float64"].forEach((type, i)=> {

    var $p = $.c("div", 0, $detail);
    $.c("b", i?"双":"单", $p);
    $.c("p", "浮点数", $p);
    var $inp = $.c("input", 0, $p);
    detailInputs[type] = $inp;
    $inp.onchange = detailChangeEv((v)=> v?parseFloat(v[0]):0, type);

  });

  return $d;

})();
