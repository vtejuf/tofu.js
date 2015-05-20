/*!
 * tofojs v1.0.2 (http://tofujs.goodgame.com)
 * Copyright 2015-2016 tofojs
 * MIT License (standard)
 * Author vtejuf@163.com
 */
function Tofu(single_module_name){
	var smn = single_module_name;
	var self = arguments.callee, config = self.config;
	config.async = config.async===false?config.async:true;
	config.module_base = config.module_base || "/modules";

	function Tofu(module_name, container){
		this.name = module_name;
		this.controller = config.module_base+"/"+module_name+'/js/controller.js';
		this.container = container;
		this.template;
		this.event = {
			ready:function(){}
		};
		+function Tofu(){}();
	};

	Tofu.prototype.remove = function(rmTag){
			if(rmTag){
				this.container.parentNode.removeChild(this.container);
			}
			delete self.event[this.name];
		};
	Tofu.prototype.addEventListener = function(type, callback){
			if(!callback)return false;
			self.event[this.name][type] = callback.bind(this);
		};
	Tofu.prototype.dispatchEvent = function(module_name, type, argument){
			if(arguments.length<3){
				argument = type;
				type = module_name;
				module_name = this.name;
			}
			self.event[module_name][type] && self.event[module_name][type](argument);
		};
	Tofu.prototype.removeEventListener = function(type){
			!!self.event[this.name][type] && (delete self.event[this.name][type]);
		};
	Tofu.prototype.onready = function(argument){
			self.event[this.name].isReady = true;
			this.dispatchEvent(this.name, 'ready', argument);
		};

	//加载cotroller
	function loadScript(tf){
		if(!!config.loadScript){
			var ls = config.loadScript.bind(tf);
			ls();
			return;
		}
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = tf.controller;
		script.onload = function(){
			document.head.removeChild(script);
			tf.onready();
		};
		document.head.appendChild(script);
	};

	//加载html
	function loadHtml(tf){
		var data = {
			module_url : config.module_base+"/"+tf.name
		};
		var filepath = config.module_base+"/"+tf.name+'/index.html' , xmlhttp= new XMLHttpRequest();
		xmlhttp.onreadystatechange=state_Change;
		xmlhttp.open("GET", filepath, config.async);
		xmlhttp.send(null);
		function state_Change(){
			if (xmlhttp.readyState==4){
				if (xmlhttp.status==0 || xmlhttp.status==200 || xmlhttp.status==304){
					tf.template = xmlhttp.responseText.replace(/{{Tofu.(.+?)}}/mg, function(i,o){
						return data[o] || o;
					});
					loadScript(tf);
				}
			}
		};
	};

	//遍历文档
	function scan_dom(){
		var tf;
		if(smn && !!self.event[smn]){
			return;
		}
		if(typeof smn == 'string'){
			var list = document.querySelectorAll('[data-tofu-module="'+smn+'"]');
		}else{
			var list = document.querySelectorAll('[data-tofu-module]');
		}
		for(var i=0, l=list.length; i<l; i++){
			var mn = list[i].getAttribute('data-tofu-module');
			if(mn!=''){
				tf = new Tofu(mn, list[i]);
				if(!self.event[mn]){
					self.modules[mn] = tf;
					self.event[mn]={};
					loadHtml(tf);
				}
			}
		}
	};

	scan_dom();
};
+function(){
	Tofu.event = {};
	Tofu.modules = {};
}();
Tofu.ready = function(module_name,callback){
	Tofu.event[module_name].ready = callback.bind(Tofu.modules[module_name]) || function(){};
	delete Tofu.modules[module_name];
};
Tofu.isReady = function(module_name){
	return (!!Tofu.event[module_name] && Tofu.event[module_name].isReady);
};
Tofu.config = function(cfg){
	Tofu.config = cfg;
};
window.$tf = Tofu;