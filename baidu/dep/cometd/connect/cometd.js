
/**
 * cometd 接口封装
 * 
 * @file 获取长链接对象cometd
 * @author wangyaqiong
 */
define(
    function (require) {
        var cometd = {};

        var orgCometd = require("./org/cometd");

        /**
          存储jsonp传输方式的callback函数
         */
        window.cometdJsonpCallback = {};

        if (typeof JSON !== 'object') {
            var JSON = require("./json");
        }

        orgCometd.JSON.toJSON = JSON.stringify;
        orgCometd.JSON.fromJSON = JSON.parse;
       
       

       /**
        * 获取随机值，生成随机jsonp call函数的配置信息
        *
        * @return {object} jsonp callback函数的配置
        */
        function getRandomConfig() {
            var randomId = '';
            var randomName = '';

            do {
                 randomId = 'jsonp' + Math.floor(Math.random()*10000);
            } while(window.cometdJsonpCallback[randomId]);

            return {
                id: randomId,
                name: 'window.cometdJsonpCallback.' + randomId
            }
        }

        /**
         * 获取发送jsonp请求的script元素对象
         *
         * @param null
         * @return {object} 新创建的script dom
         */
        function getJsopScriptElement() {
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');

                script.type = "text/javascript";
                script.charset = 'utf-8';
                script.id = "cometd-jsop-element";

                if (head) {
                    head.appendChild(script);
                }
                else {
                    document.body.appendChild(script);
                }
                
                return script;
        }

        /**
         * 发送jsonp请求函数
         *
         * @param {string} url 希望通过jsonp方式获取对象的url
         * @param {object} param 需要传递的参数
         * @param {function} callback 数据成功返回之后的回调函数
         */
        function myJsonpSend(url, param, callback) {  
            var random = Math.floor(Math.random()*1000);
            var jsonpScriptElement = getJsopScriptElement();
            
            var jsonpParams = "";

            for (var i in param) {
                if (jsonpParams == "") {
                    jsonpParams = i + "=" + param[i];
                }
                else {
                    param += "&" + i + "=" + param[i];
                }
            };

            // 每次随机生成一个回调函数
            var randomConfig = getRandomConfig();
            window.cometdJsonpCallback[randomConfig.id] = function(data) {
                callback(data);

                setTimeout(
                    function (){
                        delete window.cometdJsonpCallback[randomConfig.id];
                        jsonpScriptElement.parentNode.removeChild(jsonpScriptElement);
                    }, 100
                );
            }

            jsonpScriptElement.src = url + "?jsonp=" + randomConfig.name + "&" + jsonpParams + "&_=" + random;
        }

        /**
         * 重写cometd的 callback-polling 形式的数据发送函数
         * @param null
         * new cometd extend from org cometd CallbackPollingTransport
         */
        function CallbackPollingTransport() {
            var superTransport = new orgCometd.CallbackPollingTransport();
            var that = org.cometd.Utils.derive(superTransport);

            that.jsonpSend = function (packet) {
                var url = packet.url;
                myJsonpSend(url, {message: packet.body}, packet.onSuccess);
            };

            return that;
        }

        var cometdGenerator = function (name) {
            var fakeCOM = new orgCometd.Cometd(name);
            
            fakeCOM.registerTransport('callback-polling', new CallbackPollingTransport());
            return fakeCOM;

        }
        cometd = new cometdGenerator();
        return cometd;
    }
 );


