// ---- 控制编辑器的API ---- //
var Editor = {
  file: new HexFile(new ArrayBuffer(16), "0"), 
  status: 0, // 编辑状态  0:保护原长度模式 ,1:改变原长度模式
  render: null, // Boolean render() 渲染一帧表格, 返回true是渲染到文件尾了->见/pages/0.js
  clipboard: new ArrayBuffer(0), // 剪切板
  littleEndian: false, // 数据查看器字节序
};
EventEmitter.extBy(Editor);
Object.defineProperty(window, "Hex", {get(){return Editor.file}});
