module.exports = getOuterHTML;

function getOuterHTML (node) {
    if (node.type === 'text') {
        return node.data;
    }

    if (node.type === 'verbatim') {
        return node.data;
    }

    if (node.type !== 'tag') return '';

    var ret = "<" + node.name;

    for (var attr in node.attr) {
        if (!has(node.attr, attr)) continue;

        var value = node.attr[attr];

        if (attr === 'class') {
            attr = 'className';
        }
        else if (attr === 'jsx-spread') {
            ret += " {..." + value + "}";
            continue;
        }

        ret += " " + attr + '=' + htmlAttrToJsx(value);
    }

    return ret + (node.unary ? " />" : ">" + getInnerHTML(node) + "</" + node.name + ">");
}

function getInnerHTML (elem) {
    return elem.children.length ? elem.children.map(getOuterHTML).join("") : "";
}

function bracketsParser(str) {
    var results = [],
        level = 0,
        i = 0,
        len,
        char;

    len = str.length;
    while (i < len) {
        char = str.charAt(i);
        if (char === '{') {
            if (level === 0) {
                results.push(i);
            }
            level++;
        }
        else if (char === '}') {
            level--;
            if (level === 0) {
                results.push(i + 1);
            }
        }

        i++;
    }

    var list = [];
    for (i = 0, len = results.length; i < len; i += 2) {
        list.push({
            start: results[i],
            end: results[i + 1]
        });
    }

    return list;
}

function htmlAttrToJsx(attr, list) {
    var parts = [],
        start = 0;

    list = list || bracketsParser(attr);

    var q = '"';

    var i, len, item;

    for (i = 0, len = list.length; i < len; i++) {
        item = list[i];

        if (item.start - start > 0) {
            parts.push(q + attr.slice(start, item.start) + q);
        }

        parts.push(attr.slice(item.start + 1, item.end - 1));
        start = item.end;
    }

    if (start < attr.length) {
        parts.push(q + attr.slice(start) + q);
    }

    return "{" + parts.join(' + ') + "}";
}

function has(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
}