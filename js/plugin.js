// 有个对象没有事件，我不说是谁
var HexPlugins = {
  enabled: [], // 只有字符串，名称介绍在插件启动后自动显示
  disabled: [], // 需要完整的名称介绍的object
  all: [], // pluginThis列表

  // (PluginThis)load({src:"../..js", ...}) 为用户插件列表添加一个插件 返回plugin的this
  load(src, from) {
    if(typeof src!=="string") return 0;

    var existed = HexPlugins.all.find((v)=> v.conf.src===src);
    if(existed) return existed;

    var plug = new HexPlugin(src, from);
    plug.load();
    return plug;

  }, 

};

function HexPlugin(src, from) {

  EventEmitter.call(this);

  var $plug = $.c("div");
  var splited = src.split("/");
  var splLast = splited[splited.length-1];

  this.conf = {
    name: splLast.split(".")[0], 
    src, 
    srcName: splLast.toLocaleUpperCase(), 
    desc: from||src
  };

  this.return = null;
  this.loaded = 0;
  this.elem = $plug;
  Sub.pages[3].querySelector("#set-plug").append($plug);
  this.from = from;

  return this;

}
HexPlugin.prototype = Object.create(EventEmitter.prototype,
 Object.getOwnPropertyDescriptors({

  // load使这个对象开始载入并加入HexPlugins列表和显示出来
  // 不load的话就是个普通对象，不会有任何效果
  load(from) {

    if(this.emit("loadstart", {
      type: "load", 
      this: this, 
      from
    })) return 0;

    var src = this.conf.src;
    var $plug = this.elem;

    this.loaded = 1;
    HexPlugins.all.push(this);

    fetch(src).then((v)=> {
      return v.ok?v.text():Promise.reject(new Error("似与网络有深仇大恨"));
    }).then((v)=> {

      var ret = Function(v).call(this);
      this.return = ret;
      this.loaded = 2;

      var { name, desc, srcName } = this.conf;
      $plug.innerHTML = `<h4>${name}</h4>`
      +`<p><a href="${src}" target="_blank"><ico>&#xe842;</ico>${srcName}</a>\n`
      +`${desc}</p><div></div>`;
      this.enable(from);

      // 插件加载完成的load事件，无法取消
      this.emit("load", {
        type: "load", 
        return: ret, 
        this: this, 
        from
      });

    }).catch((err)=> {

      this.emit("error", {
        type: "error", 
        return: null, 
        this: this, 
        from
      });
      this.loaded = 0;
      console.error(err);

      Sub.tip("插件加载失败", `${src}:\n${err.message}\n点确认键删除该插件`, ()=> {

        var ai = HexPlugins.all.indexOf(this);
        ai!==-1&&HexPlugins.all.splice(ai, 1);
        var ei = HexPlugins.enabled.indexOf(this.conf.src);
        ei!==-1&&HexPlugins.enabled.splice(ei, 1);
        this.elem.remove();

      }, 1);

    });

  }, 

  enable(from) {
    if(!this.loaded) return this.load();
    if(this.emit("enable", {
      type: "enable", 
      from
    })) return 0;

    $.a([], this.elem);
    var di = HexPlugins.disabled.indexOf(this.conf);
    di!==-1&&HexPlugins.disabled.splice(di, 1);
    HexPlugins.enabled.push(this.conf.src);
    var that = this;
    this.elem.onclick = ()=> that.disable("user-click");

  }, 
  disable(from) {
    if(!this.loaded) return 0;
    if(this.emit("disable", {
      type: "disable", 
      from
    })) return 0;

    $.a([this.elem]);
    var ei = HexPlugins.enabled.indexOf(this.conf.src);
    ei!==-1&&HexPlugins.enabled.splice(ei, 1);
    HexPlugins.disabled.push(this.conf);

    var that = this;
    this.elem.onclick = ()=> that.enable("user-click");

  }, 
  require(...rqrs) {return Promise.all(rqrs.map((rqr)=> {

    var that = HexPlugins.load(rqr, "plugin-require");
    if(that.loaded===1) return Promise.resolve(that);
    return new Promise((resolve)=> that.on("load", resolve));

  }))}
}));
