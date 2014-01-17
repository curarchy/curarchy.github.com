/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 简易信息提示控件
 * @author zhanglili(otakustay@gmail.com) , chenhaoyin(curarchy@163.com)
 * @date 2014-01-13
 */
 define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * Toast控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function Toast(options) {
            Control.apply(this, arguments);
        }

        /**
         * @cfg defaultProperties
         *
         * 默认属性值
         *
         * @cfg {number} [defaultProperties.duration=3000] 显示时间
         * @cfg {boolean} [defaultProperties.disposeOnHide=true] 隐藏后是否立即销毁
         * @cfg {string} [defaultProperties.msgType='normal'] 消息类型
         *      normal info alert error success
         * @cfg {boolean} [defaultProperties.isStack=false] 是否堆叠
         *      false: 顶部显示
         *      true：右下角堆叠
         * @static
         */
        Toast.defaultProperties = {
            duration: 3000,
            disposeOnHide: true,
            msgType: 'normal',
            isStack: false
        };

        /**
         * 控件类型
         * 
         * @type {string}
         */
        Toast.prototype.type = 'Toast';

        /**
         * 创建主元素
         *
         * @override
         * @protected
         */
        Toast.prototype.createMain = function () {
            //检查缓存队列，如果有，直接从缓存中取出
            if (Toast.prototype.cache && Toast.prototype.cache.length){
                return Toast.prototype.cache.pop();
            }
            else {
                return document.createElement('aside');
            }
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Toast.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, Toast.defaultProperties, options);
            if (properties.content == null) {
                properties.content = this.main.innerHTML;
            }
            this.setProperties(properties);
        };

        var tempalte = '<p id="${id}" class="${classes}"></p>';

        /**
         * 初始化结构
         *
         * @override
         * @protected
         */
        Toast.prototype.initStructure = function () {
            helper.addPartClasses(this, this.msgType);
            if(this.main.isStack) {
                helper.addPartClasses(this, 'stack');
            }
            if(!this.main.innerHTML) {
                this.main.innerHTML = lib.format(
                    tempalte,
                    {
                        id: helper.getId(this, 'content'),
                        classes: helper.getPartClasses(this, 'content').join(' ')
                    }
                );
            }
        };

        /**
         * 重渲染
         *
         * @protected
         * @override
         */
        Toast.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'content',
                paint: function (toast, content) {
                    var container = toast.main.firstChild;
                    container.innerHTML = content;
                    toast.show();
                }
            }
        );

        /**
         * 显示提示信息
         *
         * @override
         * @public
         */
        Toast.prototype.show = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }

            // 如果已经移出DOM了，要移回来
            if (!this.main.parentNode || !this.main.parentElement) {
                document.body.appendChild(this.main);
            }

            Control.prototype.show.apply(this, arguments);
            this.fire('show');
            clearTimeout(this.timer);
            if (!isNaN(this.duration) && this.duration !== Infinity) {
                this.timer = setTimeout(
                    lib.bind(this.hide, this), 
                    this.duration
                );
            }
        };

        /**
         * 隐藏提示信息
         *
         * @override
         * @public
         */
        Toast.prototype.hide = function () {
            Control.prototype.hide.apply(this, arguments);
            clearTimeout(this.timer);
            this.fire('hide');
            //销毁自身
            if (this.disposeOnHide) {
                this.dispose();
            }
            //不销毁自身，脱离DOM树，加入缓存队列，复用
            else {
                this.detach();
                this.helper.setAttribute('class', '');
                Toast.prototype.cache = Toast.prototype.cache || [];
                Toast.prototype.cache.push(this.main);
            }
        };

        /**
         * 让当前控件和DOM脱离但暂不销毁，可以单例时用
         *
         * @public
         */
        Toast.prototype.detach = function () {
            lib.removeNode(this.main);
        };

        /**
         * 销毁控件，同时移出DOM树
         *
         * @override
         * @protected
         */
        Toast.prototype.dispose = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            Control.prototype.dispose.apply(this, arguments);
            this.detach();
        };

        /**
         * Toast控件
         *
         * 获取堆叠时的容器
         * @private
         */
        function getContainer (){
            // 因为container是多个toast公用的，所以不能标记为特定id
            var element = document.getElementById('ui-toast-collection-area');
            if(!element) {
                element = document.createElement('div');
                element.id = 'ui-toast-collection-area';
                this.helper.addPartClasses('collection-area', element);
                document.body.appendChild(element);
            }
            return element;
        }

        /**
         * 快捷显示信息的方法
         *
         * @parma {string} content 显示的内容
         * @param {Object} options 其它配置项
         *
         * @public
         */
        var allType = ['show', 'info', 'alert', 'error', 'success'];
        for (var key in allType) {
            (function(msgType) {
                Toast[msgType] = function(content, options) {
                    if (msgType === 'show') {
                        msgType = 'normal';
                    }
                    options.msgType = options.msgType || msgType;
                    options = lib.extend({ content:content }, options);
                    var toast = new Toast(options);
                    if(options.isStack) {
                        toast.appendTo(getContainer.call(toast));
                    }
                    else {
                        toast.appendTo(document.body);
                    }
                    return toast;
                };
            }) (allType[key]);
        };

        lib.inherits(Toast, Control);
        require('esui').register(Toast);
        return Toast;
    }
);