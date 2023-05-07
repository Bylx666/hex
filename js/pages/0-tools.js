// 编辑页面-左栏工具
(($d)=> {

  var $table = $d.querySelector("canvas");

  // --右键菜单-- //
  // 截图
  var $shot = $.c("p", "<ico>&#xe82a;</ico>截图");
  var shotSrc = "";
  $shot.onclick = ()=> {
    $table.toBlob((b)=> {

      shotSrc&&URL.revokeObjectURL(shotSrc);
      shotSrc = URL.createObjectURL(b);
      window.open(shotSrc, "_blank");

    }, "image/png");
  };

  // 导出选中
  // var $expo = $.c("p", "<ico>&#xe833;</ico>导出");
  // $expo.onclick = ()=> {

  //   var sel = Hex.selection;
  //   if(!sel[3]) return Sub.tip("无法导出", "动动鼠标选一段内容先", 0, 1);
  //   var min = Math.min(sel[0], sel[1]);
  //   var max = Math.max(sel[0], sel[1]);
  //   shotSrc&&URL.revokeObjectURL(shotSrc);
  //   shotSrc = URL.createObjectURL(new Blob([Hex.buffer.slice(min, max)]));
  //   window.open(shotSrc, "_blank");

  // };


  // 洗剪吹
  var $cut = $.c("p", "<ico>&#xe83b;</ico>剪切");
  $cut.onclick = ()=> Hex.cut("user-menu-cut");
  var $copy = $.c("p", "<ico>&#xe83d;</ico>复制");
  $copy.onclick = ()=> Hex.copy("user-menu");
  var $paste = $.c("p", "<ico>&#xe836;</ico>粘贴");
  $paste.onclick = ()=> Hex.paste("user-menu-paste");
  $table.oncontextmenu = Sub.menu([$shot, $.c("hr"), $cut,$copy,$paste]);



  var $tool = $.c("div", 0, $d);
  $tool.id = "edit-tools";

  // ---X 不可选中---
  // (15)[==------]
  var $prot = $.c("p", "<ico>&#xe854;</ico>覆盖", $tool);
  var protTipped = false;
  $.c("hr", null, $tool);
  $prot.onmousedown = function fc() {

    Editor.status = 1;
    $prot.innerHTML = "<ico>&#xe852;</ico>插入";
    Editor.render();

    if(!protTipped&&localStorage.getItem("edit-prot-tip")!=="1") {

      protTipped = true;
      Sub.tip("注意文件长度(大小)", "进入插入模式后「任何操作都会」改变文件长度, 对二进制头部格式有要求的文件谨慎使用\n~点确认不再提示",
       ()=> localStorage.setItem("edit-prot-tip", "1"), true);

    }

    $prot.onmousedown = ()=> {
      
      Editor.status = 0;
      $prot.innerHTML = "<ico>&#xe854;</ico>覆盖";
      Editor.render();
      $prot.onmousedown = fc;

    };

  };



  // ---- 历史 ----
  var $undo = $.c("p", "<ico>&#xe636;</ico>撤销", $tool);
  $undo.onmousedown = ()=> {

    Hex.his.undo("user-click");
    Editor.render();
    
  };
  var $redo = $.c("p", "<ico>&#xe635;</ico>重做", $tool);
  $redo.onmousedown = ()=> {

    Hex.his.redo("user-click");
    Editor.render();

  };
  $.c("hr", null, $tool);



  var $right = $d.querySelector("#edit-right");
  var toggleEv = (c, d)=> {

    d.style.display = "none";
    return function f() {

      $.a([], c);
      d.style.display = null;
      c.onclick = ()=> {

        $.a([c]);
        d.style.display = "none";
        c.onclick = f;

      };

    };

  };

  // ---- 脚本 ---- //
  var $scriptTool = $.c("p", "<ico>&#xec68;</ico>脚本", $tool);
  var $script = $.c("div", "<h3><ico>&#xec68;</ico>文件处理脚本</h3>", $right);
  $script.id = "edit-scripts";
  $scriptTool.onclick = toggleEv($scriptTool, $script);
  $.c("q", "脚本也都是能撤销的, 大胆尝试", $script);

  // 文件位移脚本
  var $script1H = $.c("h4", "文件位移", $script);
  $.c("q", "二进制位移 请输入bit位数(1-7)", $script);
  var $script1 = $.c("div", 0, $script);
  $script1H.onclick = toggleEv($script1H, $script1);

  var $script1direc = $.c("span", "左移", $script1);
  var script1direc = 0;
  $script1direc.onclick = function f() {

    $.a([], $script1direc);
    $script1direc.textContent = "右移";
    script1direc = 1;
    $script1direc.onclick = ()=> {

      $.a([$script1direc]);
      $script1direc.textContent = "左移";
      script1direc = 0;
      $script1direc.onclick = f;

    };
  }

  var $script1Inp = $.c("input", 0, $script1);
  $script1Inp.style.cssText = "width:50px;text-align:center";
  $script1Inp.placeholder = "bits";
  var $script1Enter = $.c("span", "确定", $script1);
  $script1Enter.onclick = ()=> {

    var v = parseInt($script1Inp.value);
    if(!v) return Sub.tip("参数错误", "你填个数字啊");
    if(v<1||v>7) return Sub.tip("参数错误", "只能填1-7");

    // 左移转为右移
    var bits = script1direc?v:(8-v);
    var tmpArr = new DataView(Hex.buffer.slice(0));
    var tmpByte = 0;
    for(let i=0; i<Hex.len; ++i) {

      const b = tmpArr.getUint8(i);
      tmpArr.setUint8(i, (b>>>bits)|tmpByte, "user-click-script-1");
      tmpByte = (b&(Math.pow(2, bits) - 1))<<(8-bits);

    }
    Hex.cursor = 0;
    Hex.write(tmpArr.buffer, "user-click-script-1");
    Hex.cursor = Hex.len;
    tmpByte&&Hex.insert(new Uint8Array([tmpByte]).buffer);
    Hex.cursor = 0;
    !Hex.view.getUint8(0)&&!script1direc&&Hex.delete(1, "user-click-script-1");
    Editor.render();

  };

  // 翻转脚本
  var $script2H = $.c("h4", "选区翻转", $script);
  $.c("q", "使选中部分头尾互换", $script);
  var $script2 = $.c("div", 0, $script);
  $script2H.onclick = toggleEv($script2H, $script2);
  var $script2Enter = $.c("span", "确定", $script2);
  $script2Enter.onclick = ()=> {

    var sel = Hex.selection;
    if(!sel[3]) return Sub.tip("翻转失败", "先选区亲");

    var min = Math.min(sel[0], sel[1]);
    var max = Math.max(sel[0], sel[1]);
    var tmpArr = new Uint8Array(Hex.buffer.slice(min, max+1));
    tmpArr.reverse();
    Hex.cursor = min;
    Hex.write(tmpArr, "user-click-script-2");
    Editor.render();

  };

  // 反转脚本
  var $script3H = $.c("h4", "文件反转", $script);
  $.c("q", "颠倒黑白 让文件的1和0互转攻势", $script);
  var $script3 = $.c("div", 0, $script);
  $script3H.onclick = toggleEv($script3H, $script3);
  var $script3Enter = $.c("span", "确定", $script3);
  $script3Enter.onclick = ()=> {

    var tmpArr = new DataView(Hex.buffer.slice(0));
    for(let i=0; i<tmpArr.byteLength; ++i)
      tmpArr.setUint8(i, ~tmpArr.getUint8(i), 0, "user-click-script-3");
    Hex.cursor = 0;
    Hex.write(tmpArr.buffer, "user-click-script-3");
    Editor.render();

  };

  // 反转脚本
  var $script4H = $.c("h4", "文件加掩码", $script);
  $.c("q", "异或加密文件 同掩码运行两次可得源文件", $script);
  var $script4 = $.c("div", 0, $script);
  $script4H.onclick = toggleEv($script4H, $script4);

  var $script4Inp = $.c("input", 0, $script4);
  $script4Inp.style.width = "160px";
  $script4Inp.placeholder = "255,255,255,255";
  var $script4Enter = $.c("span", "确定", $script4);
  $script4Enter.onclick = ()=> {

    if(!$script4Inp.value) return Sub.tip("使用方法", "输入0-255之间的数字, 想多个掩码就用英文逗号\",\"隔开，会按顺序循环给字节异或运算");
    var inp = $script4Inp.value.split(",").map((str)=> parseInt(str));
    if(inp.includes(NaN)) return Sub.tip("掩码失败", "你输入的格式是不是有问题");
    var tmpArr = new DataView(Hex.buffer.slice(0));
    for(let i=0; i<tmpArr.byteLength; ++i)
      tmpArr.setUint8(i, tmpArr.getUint8(i)^inp[i%inp.length], 0, "user-click-script-4");
    Hex.cursor = 0;
    Hex.write(tmpArr.buffer, "user-click-script-4");
    Editor.render();

  };

  // docs
  $.c("h4", "API文档(施工中)", $script);
  $.c("q", "唯一一个开放API的二进制编辑器", $script);

  var $find = $.c("p", "<ico>&#xe844;</ico>查找", $tool);
  var $memo = $.c("p", "<ico>&#xe875;</ico>注释", $tool);

})(Sub.pages[0]);
