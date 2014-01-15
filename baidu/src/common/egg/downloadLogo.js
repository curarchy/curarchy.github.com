/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 右键点击LOGO提供下载LOGO功能的彩蛋
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        function addEvent(element, type, handler) {
            if (!element) {
                return;
            }

            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            }
            else {
                element.attachEvent('on' + type, handler);
            }
        }

        if ('download' in document.createElement('a')) {
            var logoLayer = document.createElement('div');
            logoLayer.id = 'logo-layer';
            logoLayer.style.backgroundColor = '#fff';
            logoLayer.style.padding = '10px 40px';
            logoLayer.style.border = '1px solid #1c6da7';
            logoLayer.style.borderTop = '0';
            logoLayer.style.borderLeft = '0';
            logoLayer.style.position = 'absolute';
            logoLayer.style.top = '70px';
            logoLayer.style.left = '0';
            logoLayer.style.zIndex = '10001';
            logoLayer.style.display = 'none';
            var logoPath = 'src/common/img/logo.png';
            var logoLayerHTML = [
                '<h2>听说你要下载LOGO？</h2>',
                '<p>点击下面的图标直接下就好啦～</p>',
                '<p>',
                    '<a href="' + logoPath + '" '
                        + 'target="_blank" download="download">',
                        '<img src="' + logoPath + '" alt="LOGO" '
                            + 'width="193" height="70" '
                            + 'style="box-shadow: 0 0 3px 2px #aaa;" />',
                    '</a>',
                '</p>'
            ];
            logoLayer.innerHTML = logoLayerHTML.join('\n');
            document.body.appendChild(logoLayer);

            addEvent(
                logo,
                'contextmenu',
                function (e) {
                    logoLayer.style.display = '';
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    else {
                        e.returnValue = false;
                    }
                }
            );
            addEvent(
                document,
                'mousedown',
                function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    while (target && target.id !== 'logo-layer') {
                        target = target.parentNode;
                    }
                    if (!target || target.id !== 'logo-layer') {
                        logoLayer.style.display = 'none';
                    }
                }
            );
        }
    }
);        
