事件是在发生前发送，不能访问发生后的结果 HexFiles.on("focus", (e)=> 
sel = Hex.selection -no
sel = e.file.selection -yes
);
别随便装别人的脚本，小心跨站攻击
from值在可能向更根本的api传递时要写更详细些,比如剪切相当于复制加删除，那么会触发复制和删除事件并取得同样的from比如`user-key-cut`
插件是异步加载，意思就是插件不可能在文档之前加载好。
使用this.require("src").then...来处理插件依赖
插件的结束可以用return返回一个值，在另一个插件的on("load", (e)=>e.return)获取返回值。(onload不能取消cancel，可以用loadstart拦截load事件)
可以用this.require(src0, src1).then((result)=> {
  ...your script after requiring
  result[0].return
})直接使用脚本依赖
this.require("/plugins/jquery.min.js").then((v)=> {
  var jq = jQuery.noConflict();
  console.log(jq);
});jq不要占用$
