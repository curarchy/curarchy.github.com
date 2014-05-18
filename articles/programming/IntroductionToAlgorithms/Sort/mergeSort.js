/**
 * 归并排序
 * @param {Array} array 待排序的数组
 * @return {Array} 排序后的数组
 *
 */
function MergeSort(array) {
    var result = [];

    if (array.length > 2) {
        var flag = array.length / 2;
        var array1 = array.splice(flag, array.length - flag);
        result = Merge(MergeSort(array), MergeSort(array1));
    }
    else if (array.length === 2) {
        if (array[0] > array[1]) {
            result = [array[1], array[0]];
        }
        else {
            result = array;
        }
    }
    else if (array.length === 1) {
        result = array;
    }

    return result;
}

/**
 * 合并数组
 * @param {Array} array1 待合并的数组1
 * @param {Array} array2 待合并的数组2
 * @return {Array} 合并后的数组
 *
 */
function Merge(array1, array2) {
    var result = [];
    array1.push(Infinity);
    array2.push(Infinity);

    var b = array2.shift();

    while (array1.length) {
        var a = array1.shift();
        while (a > b) {
            result.push(b);
            b = array2.shift();
        }
        result.push(a);
    }

    result.pop();
    return result;
}