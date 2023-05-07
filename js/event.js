// ---- 事件目标【类】 ---- //
function EventEmitter() {

  this.events = {};

}
EventEmitter.prototype = {
  on(event, cb) {

    if(!this.events[event]) this.events[event] = [];
    this.events[event].push(cb);

  }, 
  off(event, cb) {

    var events = this.events[event];
    var i = events.indexOf(cb);
    if(events&&i!==-1) events.splice(i, 1);

  }, 
  emit(event, data) {

    var canceled = false;
    if(typeof data==="object") data.cancel = ()=> canceled = true;
    var events = this.events[event];
    events&&events.forEach((f)=> typeof f==="function"&&f.call(this, data));
    return canceled;

  }
};
EventEmitter.extBy = function (obj) {

  obj.events = {};
  Object.assign(obj, this.prototype);

}
