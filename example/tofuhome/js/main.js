
define(function(require, exports, module) {
	require('materialize');
	Tofu.config({
		loadScript:function(module_name, container, template){
			container.innerHTML = template; //静态页面直接载入模板，无需constoller.js
			// seajs.use('/Modules/'+module_name+'/js/controller.js');
		},
        staticStamp:'staticstamp'
	});
	Tofu();
});