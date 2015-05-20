
define(function(require, exports, module) {
	require('materialize');
	Tofu.config({
		loadScript:function(){
			var self = this;
			seajs.use(this.controller, function(a,b){
				self.onready();
			});
		}
	});
	Tofu();
});
