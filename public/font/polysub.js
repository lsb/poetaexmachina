Object.extend(String.prototype, {
  polysub: function() {
    var nu = this;
    for(var i=0; i<arguments.length;i++) {
      nu = nu.replace(arguments[i][0],arguments[i][1]);
    }
    return nu;
  }
});
"class String;def polysub(*a) a.inject(self) {|s,params| s.sub(*params)} end";

