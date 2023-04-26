Sub.pages[3] = (()=> {

  var $d = $.c("div");
  $d.id = "set";


  // ---- 主题 ---- //
  $.c("h3", "<ico>&#xe82d;</ico>挑选一个主题", $d);
  $.c("p", "主题只会改变背景和整体色调(?)随便挑一个试试看吧", $d);
  var $theme = $.c("div", 0, $d);
  $theme.id = "set-theme";
  var $style = $.c("style", 0, document.head);

  var curTheme = -1;
  for(let i=0; i<themes.length; ++i) {

    const t = themes[i];
    const $div = $.c("div", `
<div style="background-image: ${t.bg}"></div><p>${t.name}</p>`, $theme);
    $div.onclick = ()=> {
      if(i===curTheme) return 0;

      document.body.style.opacity = 0;
      setTimeout(()=> {

        $style.textContent = t.css||" ";
        Settings.theme = Object.assign({}, t.theme);
        curTheme!==-1&&colorResets.forEach((v)=>v());
        curTheme = i;

        localStorage.setItem("last-theme", i);
        document.body.style.opacity = 1;
        $.a($theme.children, $div);
        Hex.render();

      }, 200);

    };

  }



  // ---- 快捷键 ---- //
  $.c("h3", "<ico>&#xe843;</ico>学习和适应编辑器操作", $d);
  $.c("p", "这不就和Word一样嘛，有什么好学的", $d);
  var $keys = $.c("div", 0, $d);
  $keys.id = "set-keys";
  var $keysWitch = $.c("p", "<ico>&#xe841;</ico>展开按键列表", $keys);
  var $keysList = $.c("div", 0, $keys);
  $keysList.style.display = "none";
  [
    ["Insert", "切换(插入/覆盖)模式"], 
    ["Backspace", "删除一格, 覆盖模式下填充00"], 
    ["Delete", "删除一格, 覆盖模式下填充ff"], 
    ["Home", "跳到文件开头"], 
    ["End", "跳到文件结尾"], 
    ["ctrl+x", "剪切选中部分"], 
    ["ctrl+c", "复制选中部分"], 
    ["ctrl+v", "在指针处粘贴"], 
    ["ctrl+s", "将编辑后的文件下载"], 
    ["ctrl+z", "撤销一步操作"], 
    ["ctrl+shift+z|ctrl+y", "重做一步"], 
    ["↑↓←→", "移动指针, 插入模式可以移到空白的地方输入"], 
    ["1-9|a-F|A-F", "写入十六进制数字"], 
  ].forEach((v)=> $.c("div", `<kbd>${v[0]}</kbd>${v[1]}`, $keysList));
  $keysWitch.onmousedown = function f() {

    $keysList.style.display = "block";
    $keysWitch.innerHTML = "<ico>&#xe837;</ico>收起按键列表";
    $keysWitch.onmousedown = ()=> {

      $keysList.style.display = "none";
      $keysWitch.innerHTML = "<ico>&#xe841;</ico>展开按键列表";
      $keysWitch.onmousedown = f;
      
    };

  };



  // ---- 参数设置 ---- //
  $.c("h3", "<ico>&#xe69c;</ico>不超过5个字的参数", $d);
  $.c("p", "几个小参数, 极大改善使用体验, 随便改改呗反正有备份", $d);
  var $para = $.c("div", 0, $d);
  $para.id = "set-para";
  [["编辑器列数", "columns", 16], ["编辑器行数", "maxLines", 0]].forEach((v)=> {

    var $p = $.c("p", v[0], $para);
    var $inp = $.c("input", 0, $p);
    $inp.value = Settings[v[1]]||v[2];
    $inp.onchange = ()=> {

      var val = parseInt($inp.value);
      if(val===NaN) {

        $inp.value = v[2];
        return 0;

      }
      $inp.value = Settings[v[1]] = val;
      Hex.render();

    };

  });

  var colorResets = [];
  [
    ["表头的颜色", "editTitle", "#577"],
    ["普通的颜色", "edit", "#310"],
    ["零零的颜色", "edit0", "#657a"],
    ["艾弗的颜色", "editf", "#f9aa"],
    ["覆盖边框色", "select", "#521"],
    ["插入边框色", "selecti", "#e51"], 
    ["选中十字色", "cross", "#6af"]
  ].forEach((v)=> {

    var $p = $.c("p", v[0], $para);
    var $inp = $.c("input", 0, $p);
    var reset = ()=> $inp.value = Settings.theme[v[1]]||v[2];
    reset();
    colorResets.push(reset);
    $inp.onchange = ()=> {

      var val = $inp.value;
      if(!val.startsWith("#")||![4,5,7,9].find((w)=>w===val.length)) return reset();
      $inp.value = Settings.theme[v[1]] = val;
      Hex.render();

    };

  });
  
  $theme.children[localStorage.getItem("last-theme")||5].click();



  // ---- ABOUT ---- //
  $.c("h3", "<ico>&#xe685;</ico>谈谈此项目", $d);
  $.c("p", "此项目开源, 注释和API标注的非常好(骄傲,自我满足) →<a href=\"https://github.com/Bylx666/hex\" target=\"_blank\"><ico>&#xe65e;</ico>Github</a>", $d);
  $.c("p", "作者: 沙琪玛-Subkey Charisma, 在b站有号欢迎交↗流 →<a href=\"https://space.bilibili.com/525849858\" target=\"_blank\"><ico>&#xe66b;</ico>Bilibili</a>", $d);
  $.c("p", "知识产权说明: 允许一切非盈利目的的复制修改, 盈利的话也管不住你随便吧。", $d);
  $.c("p", "<ico>&#xe69f;</ico>爱来自中国", $d).id = "set-end";


  return $d;

})();