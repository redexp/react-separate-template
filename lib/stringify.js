module.exports = getOuterHTML;

function getOuterHTML (node) {
    if (node.type === 'text') {
        return node.data;
    }

    if (node.type === 'comment') {
        return "<!--" + node.data + "-->";
    }

    if (node.type !== 'tag') return '';

    var ret = "<" + node.name;

    for (var attr in node.attr) {
        if (!node.attr.hasOwnProperty(attr)) continue;

        ret += " " + attr + '="' + (node.attr[attr] || '') + '"';
    }

    return ret + (node.unary ? " />" : ">" + getInnerHTML(node) + "</" + node.name + ">");
}

function getInnerHTML (elem) {
    return elem.children.length ? elem.children.map(getOuterHTML).join("") : "";
}