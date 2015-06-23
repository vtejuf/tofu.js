/*!
 * tofojs v1.1.3 (http://tofujs.goodgame.com)
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
    var staticstamp = config.staticStamp?'?'+config.staticStamp.toLowerCase():'';

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
    //别名 根据参数判断调用 add/dispatch
    Tofu.prototype.on = function(){
        if(typeof arguments[1] === 'function'){
            this.addEventListener.apply(this,arguments);
        }else{
            this.dispatchEvent.apply(this,arguments);
        }
    };
    //别名 removeEvent
    Tofu.prototype.off = function(){
        this.removeEventListener.apply(this,arguments);
    };
    Tofu.prototype.render = function(data, tpl){
            var escapeMap = {
                "&":"&amp;",
                "<":"&lt;",
                ">":"&gt;",
                '"':"&quot;",
                "'":"&#x27;",
                "`":"&#x60;"
            };

            var createEscaper = function(map) {
                var escaper = function(match) {
                    return map[match];
                };
                var source = "(?:" + Object.keys(map).join("|") + ")";
                var testRegexp = RegExp(source);
                var replaceRegexp = RegExp(source, "g");
                return function(string) {
                    string = string == null ? "" :"" + string;
                    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) :string;
                };
            };

            var escape = createEscaper(escapeMap);

            var settings = {
                evaluate:/<%([\s\S]+?)%>/g,
                interpolate:/<%=([\s\S]+?)%>/g,
                escape:/<%-([\s\S]+?)%>/g
            };

            var noMatch = /(.)^/;

            var escapes = {
                "'":"'",
                "\\":"\\",
                "\r":"r",
                "\n":"n",
                "\u2028":"u2028",
                "\u2029":"u2029"
            };

            var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

            var escapeChar = function(match) {
                return "\\" + escapes[match];
            };

            var template = function(text) {
                var matcher = RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g");
                var index = 0;
                var source = "__p+='";
                text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
                    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
                    index = offset + match.length;
                    if (escape) {
                        source += "'+\n((__t=(typeof " + escape + "!='undefined'?" + escape + ":null))==null?'':escape(__t))+\n'";
                    } else if (interpolate) {
                        source += "'+\n((__t=(typeof " + interpolate + "!='undefined'?" + interpolate + ":null))==null?'':__t)+\n'";
                    } else if (evaluate) {
                        source += "';\n" + evaluate + "\n__p+='";
                    }
                    return match;
                });
                source += "';\n";
                if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
                source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
                var render;
                try {
                    render = new Function(settings.variable || "obj", source);
                } catch (e) {
                    e.source = source;
                    throw e;
                }
                var template = function(data) {
                    return render.call(this, data);
                };
                var argument = settings.variable || "obj";
                template.source = "function(" + argument + "){\n" + source + "}";
                return template;
            };

            if(typeof data == 'string' || typeof data == 'undefined'){
                tpl = data;
                data = undefined;
                return template(tpl || this.template);
            }else{
                return template(tpl || this.template)(data);
            }
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
    var $tofu = Tofu.event[module_name].$tofu;
    delete Tofu.event[module_name].$tofu;
    if(l = depends.length, l==0){
        Tofu.event[module_name].isReady = true;
        Tofu.event[module_name].ready = callback.bind($tofu) || function(){};
        Tofu.event[module_name].ready();
        Tofu.event[module_name].onready && Tofu.event[module_name].onready($tofu.name,$tofu.container,$tofu.template);
    }else{
        var count = l;
        var a = document.createElement('a');
        for(var j=0;j<l;j++){
            +function(i){
                if(!/\.(js|css)$/i.test(depends[i]))
                    depends[i] += '.js';
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
                        Tofu.event[module_name].ready = callback.bind($tofu) || function(){};
                        Tofu.event[module_name].ready();
                        Tofu.event[module_name].onready && Tofu.event[module_name].onready($tofu.name,$tofu.container,$tofu.template);
                    }
                };
                tag.onerror = function(){
                    document.head.removeChild(tag);
                }
                document.head.appendChild(tag);
            }(j);
        }
        delete a;
    }
};
Tofu.isReady = function(module_name){
    return (!!this.event[module_name] && this.event[module_name].isReady);
};
Tofu.config = function(cfg){
    this.config = cfg;
};
Tofu.removeModule = function(module_name, rmTag){
    var ele = document.querySelector('[data-tofu-module="'+module_name+'"]');
    if(rmTag){
        ele && ele.parentNode.removeChild(ele);
    }
    ele && delete this.event[module_name];
};
Tofu.on = function(module_name, type, argument){
    this.event[module_name][type] && this.event[module_name][type](argument);
};
Tofu.onReady = function(module_name, callback){
    this.event[module_name].onready = callback.bind(null);
};
window.$tf = Tofu;