Sub.pages[3] = (()=> {

  var $d = $.c("div");
  $d.id = "set";


  // ---主题--- //
  $.c("h3", "<ico>&#xe82c;</ico>挑选一个主题", $d);
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

        curTheme = i;
        document.body.style.opacity = 1;
        $.a($theme.children, $div);

        $style.textContent = t.css||" ";
        Settings.theme = t.theme||{
          editTitle: "#577",
          edit: "#310",
          edit0: "#978a",
          editf: "#f9aa"
        };
        Hex.render();

      }, 200);

    };

  }
  $theme.children[1].click();


  return $d;

})();