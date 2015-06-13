/*!
 * tofojs v1.0.4 (http://tofujs.goodgame.com)
 * Copyright 2015-2016 tofojs.goodgame.asia
 * Author vtejuf@163.com
 * BSD License
 */
function Tofu(single_module_name, single_module_config){
    var opt_def = {
        async : true,
        staticStamp : false,
        module_base:"/modules"
    };
    var smn = single_module_name;
    var self = arguments.callee, config = json_merge({}, opt_def, self.config, single_module_config);
    var staticstamp = config.staticStamp?'?'+config.staticStamp.toLowerCase()+'='+new Date().getTime():'';

    function Tofu(module_name, container){
        this.name = module_name;
        this.controller = config.module_base+"/"+module_name+'/js/controller.js';
        this.container = container;
        this.template;
        +function Tofu(_self){
        }(this);
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
            self.event[module_name][type] && self.event[module_name][type](argument);
        };
    Tofu.prototype.removeEventListener = function(type){
            !!self.event[this.name][type] && (delete self.event[this.name][type]);
        };

    //合并config
    function json_merge(){
        var l = arguments.length, i=0, out=arguments[0];
        while(++i<l){
            var o = arguments[i];
            if(typeof o != 'object'){
                continue;
            }
            for(var j in o){
                out[j] = o[j];
            }
        }
        return out;
    }

    //加载cotroller
    function loadScript(tf){
        if(!!config.loadScript){
            config.loadScript(tf.name,tf.container,tf.template);
            return;
        }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = tf.controller+staticstamp;
        script.onload = function(){
            document.head.removeChild(script);
        };
        document.head.appendChild(script);
    };

    //加载html
    function loadHtml(tf){
        var data = {
            module_url : config.module_base+"/"+tf.name
        };
        var filepath = config.module_base+"/"+tf.name+'/index.html'+staticstamp , xmlhttp= new XMLHttpRequest();
        xmlhttp.onreadystatechange=state_Change;
        xmlhttp.open("GET", filepath, config.async);
        xmlhttp.setRequestHeader("Content-Type","text/html");
        xmlhttp.setRequestHeader("charset","utf-8");
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
                    self.event[mn]={};
                    self.event[mn].$tofu = tf;
                    loadHtml(tf);
                }
            }
        }
    };

    scan_dom();
};
+function(){
    Tofu.event = {};
}();
Tofu.ready = function(module_name, depends, callback){
    if(typeof depends == 'function'){
        callback = depends;
        depends = [];
    }
    if(l = depends.length, l==0){
        Tofu.event[module_name].isReady = true;
        Tofu.event[module_name].ready = callback.bind(Tofu.event[module_name].$tofu) || function(){};
        delete Tofu.event[module_name].$tofu;
        Tofu.event[module_name].ready();
    }else{
        var count = l;
        var a = document.createElement('a');
        for(var j=0;j<l;j++){
            +function(i){
                a.href= depends[i];
                var type = a.pathname.split('.').pop();
                if(type=='js'){
                    var tag = document.createElement('script');
                    tag.type = 'text/javascript';
                    tag.src = depends[i];
                }else if(type=='css'){
                    var tag = document.createElement('link');
                    tag.type = 'text/css';
                    tag.rel = 'stylesheet';
                    tag.href = depends[i];
                }
                tag.onload = function(){
                    if(type != 'css') document.head.removeChild(tag);
                    if(--count==0){
                        Tofu.event[module_name].isReady = true;
                        Tofu.event[module_name].ready = callback.bind(Tofu.event[module_name].$tofu) || function(){};
                        delete Tofu.event[module_name].$tofu;
                        Tofu.event[module_name].ready();
                    }
                };
                document.head.appendChild(tag);
            }(j)
        }
        delete a;
    }
};
Tofu.isReady = function(module_name){
    return (!!Tofu.event[module_name] && Tofu.event[module_name].isReady);
};
Tofu.config = function(cfg){
    Tofu.config = cfg;
};
window.$tf = Tofu;