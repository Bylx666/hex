
this.conf.desc = "为编辑器提供小端序128进制预览和编辑功能\n最大支持32位\n<a href=\"https://github.com/Bylx666/hex/plugins\" target=\"_blank\"><ico>&#xe69f;</ico>Subkey</a>";

// 创建两个输入框
var $detail = Sub.pages[0].querySelector("#edit-detail");

var $p = $.c("div", 0, $detail);
$p.className = "d";
$.c("b", "LE", $p);
$.c("p", "B128", $p);
var $inpu = $.c("input", 0, $p);
var $inps = $.c("input", 0, $p);

// 每次渲染都触发刷新
Editor.on("render", ()=> {

  var i = Hex.cursor;
  var s = 0;
  var b = 0;
  var vu = 0;
  do {

    b = Hex.view.getUint8(i);
    vu |= (b&0x7f) << s;
    s+=7;

  }while (++i<Hex.len&&(b&0x80)&&s<24) // 31位就左移不了了

  $inpu.value = vu;
  $inps.value = b&0x40?(-((1<<s)-vu)):vu;

});
Sub.tip("Leb128", "插件仅供演示API使用，本插件最多只能读取4位Leb128数字");
