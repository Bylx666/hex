// ---- 历史记录【类】 ---- //
function HexStory(file) {

  EventEmitter.call(this);
  this.list = [];
  this.now = 0;
  this.file = file;
  this.view = new HexStoryDataView(this);

}

HexStory.prototype = Object.create(
 EventEmitter.prototype, Object.getOwnPropertyDescriptors({

  push(v, from) {

    if(this.emit("push", {
      data: v, 
      type: "push", 
      index: this.now+1, 
      from
    })) return 0;

    this.list.length = this.now++;
    this.list.push(v);

  }, 

  undo(from) {
    if(this.now<=0) return 0;

    if(this.emit("undo", {
      index: this.now-1, 
      type: "undo", 
      data: this.list[this.now-1], 
      from
    })) return 0;

    var undo = this.list[--this.now];
    var typ = undo.type;
    if((typ&2)===0) {

      const { len, buf, index } = undo;
      this.file.cursor = index;
      if(typ===0) return this.file.delete(len, "history");
      if(typ===1) return this.file.insert(buf, "history");

    }else {

      const { index, set, before, le } = undo;
      this.file.cursor = index;
      if(typ===2) return this.view["set"+set](index, before, le, "history");
      if(typ===3) return this.file.write(before, "history");

    }

    Editor.render();

  },

  redo(from) {
    if(this.now>=this.list.length) return 0;

    if(this.emit("redo", {
      index: this.now+1, 
      type: "redo", 
      data: this.list[this.now+1], 
      from
    })) return 0;

    var redo = this.list[this.now++];
    var typ = redo.type;
    if(typ<2) {

      const { len, buf, index } = redo;
      this.file.cursor = index;
      if(typ===0) return this.file.insert(buf?buf:len, "history");
      if(typ===1) return this.file.delete(len, "history");

    }else {

      const { index, set, after, le } = redo;
      this.file.cursor = index;
      if(typ===2) return this.view["set"+set](index, after, le, "history");
      if(typ===3) return this.file.write(after, "history");

    }

  }

}));
HexStory.type = {
  INSERT: 0, 
  DELETE: 1, 
  SET: 2, 
  WRITE: 3 
};

// 会推送历史的dataview
function HexStoryDataView(hexstory) {

  this.file = hexstory.file;
  this.hexstory = hexstory;
  this.dataview = new DataView(this.file.buffer);

}
var dataviewList = ["Uint8", "Int8", "Uint16", "Int16", "Uint32", "Int32", "BigInt64", "BigUint64", "Float32", "Float64"];
dataviewList.forEach((type)=> HexStoryDataView.prototype["set"+type] = function() {

  var [i, v, l, from] = arguments;
  var d = parseInt(type.match(/\d+/))/8;
  if(i+d>this.file.len) return 0;

  l = !!l;
  var obj = {
    index: i, 
    set: type, 
    before: this.dataview["get"+type](i, l), 
    after: v, 
    le: l, 
  };
  if(this.file.emit("set", {
    type: "set", 
    from,
    ...obj
  })) return 0;

  from!=="history"&&this.hexstory.push({
    type: HexStory.type.SET,
    ...obj
  });
  return this.dataview["set"+type](i, v, l);

});
dataviewList.forEach((type)=> HexStoryDataView.prototype["get"+type] = function() {

  var [i, l] = arguments;
  var d = parseInt(type.match(/\d+/))/8;
  if(i+d>this.file.len) return 0;
  return this.dataview["get"+type](i, l);

});
