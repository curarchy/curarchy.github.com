/**
 * 插入排序
 * @param {Array} array 待排序的数组
 * @return {Array} 排序后的数组
 *
 */
function InsertionSort (array) {
    console.info(array);
    var result = [];
    if (array instanceof Array) {
        if (array.length <= 1) {
            result = array;
        }
        else {
            for (var i = 1; i < array.length; i++) {
                var key = array[i];
                for (var j = i -1; j >= 0; j--) {
                    if (array[j] > key) {
                        array[j + 1] = array[j];
                    }
                    else {
                        array[j + 1] = key;
                        break;
                    }
                }
            }
            result = array;
        }
    }
    else {
        console.info('input data error');
    }
    console.info(result);
    return result;
}