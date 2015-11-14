
/*!
 * tofojs v1.1.5 (http://tofujs.goodgame.com)
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
    var self = arguments.callee, config = self.tools.json_merge({}, opt_def, self.config, single_module_config);
    var staticstamp = config.staticStamp?'?'+config.staticStamp.toLowerCase():'';

    function Tofu(module_name, container){
        this.name = module_name;
        this.controller = config.module_base+"/"+module_name+'/js/controller.js';
        this.container = container;
        this.template;
        this.config = config;
        this.config.staticstamp = staticstamp;
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

    // 模板
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

    //加载css
    function loadCss(tf){
        tf.template = tf.template.replace(/(?:\/\/[\s\S]*?\n|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\t|[\n\r])/mg,'');
        var cssarr = peelCss(tf),
            links = cssarr[0],
            pagestyle = cssarr[1];

        var urlloaded={}, count=0, styles='', dom = document.createElement('style');

        if(links.length > 0){
            links.forEach(function(url){
                self.tools.doAsync({url: url}, function(cssstr){
                    urlloaded[url] = cssScope(cssstr, tf.name);
                    count++;
                });
            });

            setTimeout(function(){
                if(count == links.length){
                    links.forEach(function(url){
                        styles += urlloaded[url];
                    });
                    dom.innerHTML = styles + pagestyle;
                    dom.setAttribute('data-tofu-depend-css',tf.name);
                    document.head.appendChild(dom);
                    return;
                }
                setTimeout(arguments.callee,100);
            },100);
        }else if(pagestyle != ''){
            dom.innerHTML = pagestyle;
            dom.setAttribute('data-tofu-depend-css',tf.name);
            document.head.appendChild(dom);
        }
    }
    //剥离link and style
    function peelCss(tf){
        var tpl = tf.template;
        var reg = /<link [\s\S]*?href=[\'\"]([ \S]+?)[\'\"][\s\S]*?>/mg;
        var links = [];
        tpl = tpl.replace(reg, function(){
            var url = self.tools.resolve(RegExp.$1, config.module_base+"/"+tf.name+'/');
            links.push(url);
            return '';
        });

        var pagestyle = '';
        reg = /<style[\s\S]*?>([\s\S]*?)<\/style>/mg;
        tpl = tpl.replace(reg, function(){
            pagestyle += cssScope(RegExp.$1, tf.name);
            return '';
        });

        tf.template = tpl;

        return [links, pagestyle];
    }
    //css绑定作用域
    function cssScope(cssstr, modelname){
        var _atstr = '';
        cssstr = cssstr
            .replace(/(?:\/\/[\s\S]*?\n|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\t|[\n\r])/mg,'')
            .replace(/@[\s\S]+?\}\}/g,function(str){
                _atstr += str;
                return '';
            })
            .replace(/(^|\})(\s|\})*([^@\d\}\s][\s\S]*?)\{/g,function(){
            var liststr = RegExp.$3, pre = RegExp.$1, prea = RegExp.$2;
            if(liststr.indexOf(',')>-1){
                liststr = liststr.replace(/,/g, ','+modelname+' ');
            }
            return pre + (prea.trim()?'}':'') + "[data-tofu-module="+modelname+'] ' + liststr + '{';

        });
        return _atstr + cssstr;
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
                    loadCss(tf);
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


/**
 * 事件
 *
 * 
 */
Tofu.event = {};
Tofu.ready = function(module_name, depends, callback){
    if(typeof depends == 'function'){
        callback = depends;
        depends = [];
    }
    var $tofu = Tofu.event[module_name].$tofu;
    delete Tofu.event[module_name].$tofu;
    var l = depends.length;
    if(l==0){
        Tofu.event[module_name].isReady = true;
        Tofu.event[module_name].ready = callback.bind($tofu) || function(){};
        Tofu.event[module_name].ready();
        Tofu.event[module_name].onready && Tofu.event[module_name].onready($tofu.name,$tofu.container,$tofu.template);
    }else{
        var count = 0;
        do{
            +function(i){
                var u = Tofu.tools.getDepsUri(depends[i], $tofu.controller),
                    uri = u.uri + $tofu.config.staticstamp,
                    type = u.type;
                if(type=='js'){
                    var tag = document.createElement('script');
                    tag.setAttribute('data-tofu-depend-js',module_name);
                    tag.type = 'text/javascript';
                    tag.src = uri;
                }else if(type=='css'){
                    var tag = document.createElement('link');
                    tag.setAttribute('data-tofu-depend-css',module_name);
                    tag.type = 'text/css';
                    tag.rel = 'stylesheet';
                    tag.href = uri;
                }
                tag.onload = function(){
                    if(type != 'css') document.head.removeChild(tag);
                    if(i >= l-1){
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
            }(count);
        }while(++count < l);
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
    var css = document.querySelectorAll('[data-tofu-depend-css="'+module_name+'"]');
    for(var l = css.length-1;l>=0;l--){
        document.head.removeChild(css[l]);
    }
};
Tofu.on = function(module_name, type, argument){
    this.event[module_name][type] && this.event[module_name][type](argument);
};
Tofu.onReady = function(module_name, callback){
    this.event[module_name].onready = callback.bind(null);
};


/**
 * 工具函数
 *
 * 
 */
Tofu.tools = {
    json_merge : function(){
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

    ,doAsync : function(opt,callback){
        var opt_def = {
            method : 'GET',
            async : true,
            dataType:'text',
            url : null,
            header : null
        };
        var method_list = ['POST', 'GET', 'PUT' ,'DELETE'],
            dataType_list = ['text', 'json'];
        opt = this.json_merge(opt_def, opt);

        if(opt.url == null){
            return false;
        }

        typeof opt.dataType!='string' && (opt.dataType = 'text');
        opt.dataType = opt.dataType.toLowerCase();

        typeof opt.method!='string' && (opt.method = 'GET');
        opt.method = opt.method.toUpperCase();
        method_list.indexOf(opt.method)<0 && (opt.method = "GET");

        var xmlhttp= new XMLHttpRequest();
        xmlhttp.open(opt.method, opt.url, opt.async);

        if(opt.header !== null){
            for( var i in opt.header){
                xmlhttp.setRequestHeader(i,opt.header[i]);
            }
        }
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState==4){
                if (xmlhttp.status==0 || xmlhttp.status==200 || xmlhttp.status==304){
                    switch(opt.dataType){
                    case 'json':
                        callback(JSON.parse(xmlhttp.responseText));
                        break;
                    default:
                        callback(xmlhttp.responseText);
                        break;
                    }
                }
            }
        };
        xmlhttp.send(null);
    }

    ,loadScript : function(opt){
        var opt_def = {
            module_name:null,
            onload:function(){},
            onerror:function(){}
        };
        opt = this.json_merge(opt_def, opt);

        var tag = document.createElement('script');

        if(!!opt.module_name)
            tag.setAttribute('data-tofu-depend-js',opt.module_name);

        tag.type = 'text/javascript';
        tag.src = opt.src;

        tag.onload = function(){
            document.head.removeChild(tag);
            opt.onload();
        };
        tag.onerror = function(){
            document.head.removeChild(tag);
            opt.onerror();
        };
        document.head.appendChild(tag);
    }
    ,getCurrentScript : function() {
        if(document.currentScript) {
            return document.currentScript.src;
        }
        var stack;
        try {
            null.a;
        } catch(e) {
            stack = e.stack;
            if(!stack && window.opera){
                stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
            }
        }
        if(stack) {
            stack = stack.split( /[@ ]/g).pop();
            stack = stack[0] == "(" ? stack.slice(1,-1) : stack;
            return stack.replace(/(:\d+)?:\d+$/i, "");
        }
        var nodes = document.head.getElementsByTagName("script");
        for(var i = 0, node; node = nodes[i++];) {
            if(node.readyState === "interactive") {
                return node.className = node.src;
            }
        }
    }

    //文件目录处理
    ,resolve: function(uri, src){
        var host = location.protocol + '//' + location.host;
        var check = {
            rel:/^\./,
            abs:/^\//
        };
        var filetr = {
            host : new RegExp('^(?:'+host+'|'+location.host+')/'),
            dbs : /\/\//g,
            dots: /(?:\/\.\/|\/(?:.[^\/])\/\.\.\/)/g
        };
        uri = uri.replace(filetr.host,'/');
        switch(true){
        case check.rel.test(uri):
            src = host +'/'+ src.replace(filetr.host,'./');
            var path = src.substr(0,src.lastIndexOf('/')+1);
            uri = path + uri.replace(filetr.dbs,'/');
            uri = uri.replace(filetr.dots,'/');
            break;
        case check.abs.test(uri):
            uri = host + uri.replace(filetr.dbs,'/');
            uri = uri.replace(filetr.dots,'/');
            break;
        }
        return uri;
    }

    //控制器依赖文件处理
    ,getDepsUri: function(uri, src){
        var a = document.createElement('a');
        a.href = Tofu.tools.resolve(uri, src);
        if(!/\.(js|css)$/i.test(a.pathname)){
            a.pathname += '.js';
        }
        var out = {
            uri : a.href,
            type : a.pathname.split('.').pop()
        };
        a = null;
        return out;
    }
};


/**
 * pack
 *
 * 
 */
Tofu.version = '1.1.4';
window.$tf = Tofu;


// 修正：移除模块同时移除依赖css
// 添加：控制器依赖文件可配置时间戳


// cacheMod = {id:Mod}
// define (id,deps,factory)
//     获取当前url
//     解析依赖uri绝对地址
//     判断加载依赖文件
//     Class Mod{
//         id:id
//         uri:url
//         deps:{key,id},
//         factory : func
//         module: Class Module{
//             uri:url
//             dependencies:[uris],
//             exports:{}
//         }
//     }

//     Mod.prototype.require : function(key){
//         cacheMod[this.deps[key]].factory(this.require, this.module, this.module.exports);
//     }

//     