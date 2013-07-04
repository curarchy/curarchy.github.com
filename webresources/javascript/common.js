$(document).ready(function () {
    $("#favorite").click(function () {
        try {
            if (document.all)
                window.external.addFavorite('http://curarchy.github.io', '水心云影の个人站点');
            else if (window.sidebar)
                window.sidebar.addPanel('水心云影の个人站点', 'http://curarchy.github.io', "");
        } catch (e) {
            alert('加入收藏失败，请使用Ctrl+D进行添加');
        }
    });
});