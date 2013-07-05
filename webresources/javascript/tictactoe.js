(function () {
    var area = $("#gameArea");
    var flag = 1;
    var baseMatrix = [];
    var matrix = [];
    for (var i = 1; i < 10; i++) {
        matrix.push([]);
        var bigDiv = $("<div class='bigDiv off'></div>");
        for (var j = 1; j < 10; j++) {
            var smallDiv = $("<div class='smallDiv off'></div>");
            smallDiv.attr("sKey", j);
            smallDiv.attr("bKey", i);
            bigDiv.append(smallDiv);
            matrix[i - 1][j - 1] = 0;
        }
        area.append(bigDiv);
    }
    var success = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9],
        [3, 5, 7]
    ];
    var judgeMatrix = function (matrix) {
        for (var i = 0; i < success.length; i++) {
            var num = success[i][0];
            if (matrix[num - 1] !== 0) {
                var flag = matrix[num - 1];
                if (flag === matrix[success[i][1] - 1] && flag === matrix[success[i][2] - 1]) {
                    return [flag, success[i]];
                }
            }
        }
        return 0;
    };
    var judgeSuccess = function (matrix, type) {
        if (type === "threeLine") {
            var result = judgeMatrix(matrix);
            if (result === 0) {
                return;
            } else {
                win(result[0]);
            }
        } else {
            var red = 0;
            var blue = 0;
            for (var i = 0; i < matrix.length; i++) {
                if (matrix[i] !== undefined && matrix[i] > 0) {
                    red++;
                } else if (matrix[i] !== undefined && matrix[i] < 0) {
                    blue++;
                }
            }
            if (type === "one") {
                if (red > 0) win(1);
                else if (blue > 0) win(-1);
            } else if (type === "two") {
                if (red > 1) win(1);
                else if (blue > 1) win(-1);
            } else if (type === "three") {
                if (red > 2) win(1);
                else if (blue > 2) win(-1);
            }
        }
    };
    var win = function (flag) {
        alert(flag > 0 ? "red win" : "blue win");
        $(".smallDiv").off("click.game");
        $("#turn").html(flag > 0 ? "red win" : "blue win")
            .removeClass("alert-info alert-error")
            .addClass(flag > 0 ? "alert-error" : "alert-info");
    };
    $(".smallDiv").on("click.game", function () {
        var div = $(this);
        var bigDiv = $(this).parent();
        if (div.is(".off") && !bigDiv.is(".shadow")) {
            var sKey = +div.attr("sKey");
            var bKey = +div.attr("bKey");
            matrix[bKey - 1][sKey - 1] = flag;
            div.addClass(flag > 0 ? "circle" : "cross").addClass("on").removeClass("off");
            flag *= -1;
            $("#turn").removeClass("alert-info alert-error")
                .addClass(flag === 1 ? "alert-error" : "alert-info")
                .html(flag === 1 ? "red turn" : "blue turn");
            setShadow(sKey);
            if (bigDiv.is(".on")) {
                return;
            } else {
                var result = judgeMatrix(matrix[bKey - 1]);
                if (result === 0)
                    return;
                else {
                    bigDiv.removeClass("off").addClass("on");
                    bigDiv.addClass(result[0] < 0 ? "cross" : "circle");
                    var smalldivs = bigDiv.find(".smallDiv");
                    for (var i = 0; i < 3; i++) {
                        $(smalldivs.get(result[1][i] - 1)).addClass("line");
                    }
                    baseMatrix[bKey - 1] = result[0];
                    var type = $("[name=success]:checked").attr("id");
                    judgeSuccess(baseMatrix, type);
                }
            }
        } else {
            return;
        }
    });
    var setShadow = function (index) {
        $(".shadow").removeClass("shadow");
        var div = $(".bigDiv:eq(" + (index - 1) + ")");

        if (div.find(".on").length === 9) {
            return;
        } else {
            $(".bigDiv").addClass("shadow");
            div.removeClass("shadow");
        }
    };
})();