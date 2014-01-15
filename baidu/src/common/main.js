define(
    function (require) {
        // AJAX扩展是登录时要用的，其它的扩展都确认用户登录成功后再说
        require('common/extension/ajax');

        var startDependencies = [
            'common/global/user', 'common/global/system',
            'er/config', 'er/permission', 'er', 'esui', 'common/accounts',
            'common/navigator', 'ui/ToolBox',
            'common/extension', 'common/config'
        ];
        // 有些接口是JSON格式的，因此如果没有`JSON`实现的话，要用上json2
        if (typeof JSON !== 'object') {
            startDependencies.push('js!common/json2');
        }

        var toolBoxItems = [
            // {
            //     id: 0,
            //     text: '流量预估工具',
            //     type: 'flow-estimate',
            //     url: ''
            // },

            {
                id: 1,
                text: '广告位排期表',
                type: 'slot-schedule',
                url: '/schedule',
                permission: 'CLB_SCHEDULE_LIST'
            },

            // {
            //     id: 2,
            //     text: '广告位刊例表',
            //     type: 'slot-card'
            // },

            {
                id: 3,
                text: '创意库',
                type: 'creative',
                url: '/tool/creative/list',
                permission: 'CLB_AD_NEW'
            },

            // {
            //     id: 4,
            //     text: '创意库模板',
            //     type: 'creative-template'
            // },
            // {
            //     id: 5,
            //     text: '自定义定向',
            //     type: 'orient'
            // },
            {
                id: 6,
                text: '历史查询工具',
                type: 'history-query',
                url: '/history',
                permission: 'CLB_OPLOG_VIEW'
            }
        ];

        /**
         * 开始初始化系统，此时已经获取用户的全部信息
         *
         * @param {Object} userInfo 用户信息
         * @param {Object} systemInfo 系统信息
         * @inner
         */
        function initializeApplication(userInfo, systemInfo) {
            require(
                startDependencies,
                function (user, system, config,
                    permission, er, ui, accounts, navigator
                ) {
                    user.init(userInfo);
                    system.init(systemInfo);
                    navigator.init();
                    config.indexURL = getIndexURL(permission);
                    er.start();

                    var MainView = require('./MainView');
                    var view = new MainView();
                    var toolBoxData = [];
                    for (var i = 0; i < toolBoxItems.length; i++) {
                        if (!toolBoxItems[i].permission
                            || (toolBoxItems[i].permission
                            && permission.isAllow(toolBoxItems[i].permission))
                        ) {
                            toolBoxData.push(toolBoxItems[i]);
                        }
                    }

                    view.uiProperties = {
                        toolbox: {
                            datasource: toolBoxData
                        }
                    };
                    view.render();

                    if (!toolBoxData.length) {
                        ui.get('toolbox').destroy();
                    }

                    accounts.init();

                    // 给toolbox绑定事件
                    ui.getSafely('toolbox').on(
                        'itemclick', 
                        function (e) {
                            popupToolLayer(view, e.item, this);
                        }
                    );
                }
            );
        }

        /**
         * 获取起始页URL
         *
         * @param {er.permission} 权限组件
         * @return {string}
         */
        function getIndexURL(permission) {
            if (permission.isAllow('CLB_ORDER_VIEW')) {
                return '/order/all';
            }
            else if (permission.isAllow('CLB_ADPOSITION_VIEW')) {
                return '/slot/all';
            }
            else if (permission.isAllow('CLB_REPORT_ORDER')) {
                return '/report/order';
            }
            else {
                return '/channel/list';
            }
        }

        /**
         * 弹出工具层
         *
         * @param {MainView} view 视图对象
         * @param {Object} item 工具信息
         * @param {ui/ToolBox} toolBox 工具箱控件实例
         * @inner
         */
        function popupToolLayer(view, item, toolBox) {
            //滚回顶部
            window.scrollTo(0, 0);
            //先把body置为overflow-y:hidden;为了去掉滚动条
            var body = document.getElementById('main').parentNode;
            var lib = require('esui/lib');
            lib.addClass(body, 'overflow-hidden');
            // 弹出
            view.waitActionDialog(
                {
                    // @FIXME 觉着工具对应的url不会这么规律，
                    // 建议在工具数据配置里增加url字段
                    url: item.url,
                    title: item.text,
                    autoClose: false,
                    draggable: false,
                    width: 'auto',
                    height: 'auto',
                    skin: 'tool',
                    top: 80,
                    bottom: 0,
                    left: 10,
                    right: 10
                }
            ).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');

                    // 结束后默认执行跳转操作
                    // @FIXME 感觉不是所有的action都要跳转吧？
                    dialogAction.on(
                        'handlefinish',
                        function (e) {
                        }
                    );

                    // 结束后默认执行跳转操作
                    // @FIXME 感觉不是所有的action都要跳转吧？
                    dialog.on(
                        'hide',
                        function (e) {
                            // 工具弹层关闭的时候恢复原有设置;
                            lib.removeClass(body, 'overflow-hidden');
                        }
                    );

                    toolBox.attach(dialog);
                },
                function (e) {
                    var dialog = e.target;
                    // 工具弹层关闭的时候恢复原有设置;
                    dialog.on(
                        'hide',
                        function (e) {
                            // 工具弹层关闭的时候恢复原有设置;
                            lib.removeClass(body, 'overflow-hidden');
                        }
                    );
                    toolBox.attach(dialog);
                }
            );
        }

        /**
         * 跳转到首页，在用户未登录的情况下执行
         *
         * @inner
         */
        function redirectToIndex() {
            var baseURL = window.DEBUG
                ? '/static/index-debug.html'
                : '/static/index.html';
            location.href = baseURL + location.hash;
            // 在`Promise`中，抛出异常会使其进入失败状态，
            // 一般来说跳转了就不会有下面的代码执行，这里就是防止进入成功状态
            throw new Error('Failed to redirect to index');
        }

        // 初始化流程：
        //
        // 1. 并行加载：
        //     - 当前用户信息，用户未登录会返回403，失败就跳回首页
        //     - 系统静态资源
        // 2. 开始系统初始化
        var ajax = require('er/ajax');
        var Deferred = require('er/Deferred');
        var loadingData = Deferred.all(
            ajax.getJSON('/api/js/users/current'),
            ajax.getJSON('/api/tool/static/sysWebInfo')
        );
        loadingData.then(initializeApplication, redirectToIndex);
    }
);
