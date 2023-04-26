// 编辑页面-编辑工具
(($d)=> {

  var $table = $d.querySelector("canvas");

  // --右键菜单-- //
  // 截图
  var $shot = $.c("p", "<ico>&#xe82a;</ico>截图");
  var $shotSrc = "";
  $shot.onclick = ()=> {
    $table.toBlob((b)=> {

      $shotSrc&&URL.revokeObjectURL($shotSrc);
      $shotSrc = URL.createObjectURL(b);
      window.open($shotSrc, "_blank");

    }, "image/png");
  };


  // 洗剪吹
  var $cut = $.c("p", "<ico>&#xe83b;</ico>剪切");
  $cut.onclick = Hex.cut;
  var $copy = $.c("p", "<ico>&#xe83d;</ico>复制");
  $copy.onclick = Hex.copy;
  var $paste = $.c("p", "<ico>&#xe836;</ico>粘贴");
  $paste.onclick = Hex.paste;
  $table.oncontextmenu = Sub.menu([$shot, $.c("hr"), $cut,$copy,$paste]);



  var $tool = $.c("div", 0, $d);
  $tool.id = "edit-tools";

  // ---X 不可选中---
  // (15)[==------]
  var $prot = $.c("p", "<ico>&#xe854;</ico>覆盖", $tool);
  var protTipped = false;
  $.c("hr", null, $tool);
  $prot.onmousedown = function fc() {

    Hex.status = 1;
    $prot.innerHTML = "<ico>&#xe852;</ico>插入";
    Hex.render();

    if(!protTipped&&localStorage.getItem("edit-prot-tip")!=="1") {

      protTipped = true;
      Sub.tip("注意文件长度(大小)", "进入插入模式后「任何操作都会」改变文件长度, 对二进制头部格式有要求的文件谨慎使用\n~点确认不再提示",
       ()=> localStorage.setItem("edit-prot-tip", "1"), true);

    }

    $prot.onmousedown = ()=> {
      
      Hex.status = 0;
      $prot.innerHTML = "<ico>&#xe854;</ico>覆盖";
      Hex.render();
      $prot.onmousedown = fc;

    };

  };



  // ---历史---
  var $undo = $.c("p", "<ico>&#xe636;</ico>撤销", $tool);
  $undo.onmousedown = ()=> {

    Hex.his.undo();
    Hex.render();
    
  };
  var $redo = $.c("p", "<ico>&#xe635;</ico>重做", $tool);
  $redo.onmousedown = ()=> {

    Hex.his.redo();
    Hex.render();

  };
  $.c("hr", null, $tool);


  // ---- 脚本 ---- //
  var $script = $.c("p", "<ico>&#xec68;</ico>脚本", $tool);

  var $find = $.c("p", "<ico>&#xe844;</ico>查找", $tool);
  var $memo = $.c("p", "<ico>&#xe875;</ico>注释", $tool);

})(Sub.pages[0]);
