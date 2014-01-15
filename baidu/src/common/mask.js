/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 全局遮罩层
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var timer = null;

        return {
            show: function () {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(
                    function () {
                        document.getElementById('global-mask').className = '';
                    },
                    200
                );
            },
            hide: function () {
                if (timer) {
                    clearTimeout(timer);
                }

                document.getElementById('global-mask').className = 'hide';
            }
        };
    }
);