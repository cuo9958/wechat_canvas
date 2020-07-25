function splitStringByte(str, len) {
    let cur = 0;

    for (var i = 0; i < str.length; i++) {
        var a = str.charAt(i);
        if (a.match(/[^\x00-\xff]/gi) != null) {
            cur += 2;
        } else {
            cur += 1;
        }
        if (cur >= len) {
            return [str.substring(0, i), str.substr(i)];
        }
    }
    return [str, ""];
}
module.exports = {
    splitStringByte,
};
