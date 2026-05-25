module.exports = function (arr, start, end) {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr.slice(start, end);
};
