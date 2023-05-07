Object["extends"] = function (obj, sup) {
  if(typeof sup!=="function") return false;

  if(typeof obj==="function") {

    obj = new Function(obj.toString());
  }
}
