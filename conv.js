var htmlParser = require('./lib/parser'),
    dom = require('./lib/dom-utils'),
    sQuery = require('grasp').search('squery'),
    toHtml = require('./lib/stringify'),
    extend = require('node.extend');

module.exports = convert;

var tplAnnotations = /["']\s*@jsx\-tpl\s+([\w\-]+)\s*['"]/g,
    tplAttr = 'jsx-tpl',
    classAttr = 'jsx-class',
    instanceAttr = 'jsx-instance',
    renderAnnotation = /@render\s+([\w\-]+)/,
    renderAnnotationComments = /<!--\s*@render\s+([\w\-]+)\s*-->/g,
    spreadAttr = /jsx\-spread="([\$\w]+)"/g,
    jsxPreparedAttr = /^~~~.*~~~$/,
    dataAttr = /^data-\w+/,
    blockStartWithReturn = /^\{[\r\n\s\t]*return\s+/,
    blockEndWithSemicolon = /;[\r\n\s\t]*}$/,
    classSelector = 'call[callee.object.name="React"][callee.property.name="createClass"]',
    classPropsSelector = classSelector + ' > obj > prop',
    classReturnSelector = classPropsSelector + ' > func-exp > block > return';

function convert(js, html, callback) {
    var body = htmlParser(html);

    prepareAttrWithBrackets(body);

    removeRegularComments(body);

    var classes = dom.findNodesByAttr(body, classAttr);
    classes.forEach(function (item) {
        if (!dom.closestParentWithAttrList(item, [classAttr, tplAttr])) return;

        if (item.attr[instanceAttr] === 'true') {
            delete item.attr[instanceAttr];

            var newNode = dom.replaceWith(item, {
                type: 'tag',
                name: item.attr[classAttr],
                attr: clone(item.attr),
                children: [],
                unary: true
            });

            delete newNode.attr[classAttr];
            delete newNode.attr['className'];
            delete item.attr[tplAttr];

            for (var attr in item.attr) {
                if (!has(item.attr, attr)) continue;

                if (jsxPreparedAttr.test(item.attr[attr])) {
                    delete item.attr[attr];
                }
                else if (dataAttr.test(attr)) {
                    delete newNode.attr[attr];
                }
            }
        }
        else {
            dom.removeNode(item);
        }

        dom.appendTo(body, item);
    });

    var tplNodeList = dom.findNodesByAttr(body, tplAttr);

    var jsxTplHtml = {};
    tplNodeList.forEach(function (node) {
        var name = node.attr[tplAttr];
        delete node.attr[tplAttr];
        jsxTplHtml[name] = clearAttrWithBrackets(toHtml(node));
    });

    dom.removeNodes(tplNodeList);

    var reactClasses = [];

    search(classSelector, js).forEach(function (reactClass) {
        var name, _return;
        search(classPropsSelector, js, reactClass).forEach(function (prop) {
            if (prop.key.name === 'displayName') {
                name = prop.value.value;
            }
            else if (prop.key.name === 'render') {
                _return = search(classReturnSelector, js, prop.value.body);
            }
        });

        if (!name || !_return || !_return.length) return;

        _return = _return[0];

        var returnProps = {};

        if (_return.argument && _return.argument.type === 'ObjectExpression') {
            _return.argument.properties.forEach(function (prop) {
                returnProps[prop.key.name] = slice(js, prop.value.body)
                    .replace(blockStartWithReturn, '{')
                    .replace(blockEndWithSemicolon, '}')
                ;
            });
        }

        reactClasses.push({
            name: name,
            start: reactClass.start,
            end: reactClass.end,
            renderReturn: _return,
            returnProps: returnProps
        });
    });

    var ranges = [];

    try {
        reactClasses.forEach(function (reactClass) {
            var node = dom.findNodesByAttrValue(body, classAttr, reactClass.name);

            if (node.length === 0) {
                throw new Error('Template for class "'+ reactClass.name +'" not found');
            }
            else if (node.length > 1) {
                throw new Error('Too many templates for class "'+ reactClass.name +'"');
            }

            node = node[0];

            delete node.attr[classAttr];

            var html = clearAttrWithBrackets(toHtml(node)).replace(renderAnnotationComments, function (x, name) {
                if (!has(reactClass.returnProps, name)) {
                    throw new Error('Render "'+ name +'" not found');
                }

                return reactClass.returnProps[name];
            });

            ranges.push({
                start: reactClass.renderReturn.start,
                end: reactClass.renderReturn.end,
                str: 'return ' + html.trim() + ';'
            });
        });
    }
    catch (e) {
        return callback(e);
    }

    var jsx = replace(js, ranges);

    try {
        jsx = jsx.replace(tplAnnotations, function (x, name) {
            if (!has(jsxTplHtml, name)) {
                throw new Error('jsx-tpl "'+ name +'" not found');
            }

            return jsxTplHtml[name];
        });
    }
    catch (e) {
        return callback(e);
    }

    callback(null, jsx);
}

function has(obj, field) {
    return obj.hasOwnProperty(field);
}

function search(selector, code, scope) {
    var list = sQuery(selector, code);
    return !scope ? list : list.filter(function (item) {
        return item.start >= scope.start && item.end <= scope.end;
    });
}

function bracketsParser(str) {
    var results = [],
        level = 0,
        i = 0;

    if (str === null) {
        console.log(str);
    }

    while (i < str.length) {
        if (str.charAt(i) === '{') {
            if (level === 0) {
                results.push(i);
            }
            level++;
        }
        else if (str.charAt(i) === '}') {
            level--;
            if (level === 0) {
                results.push(i + 1);
            }
        }

        i++;
    }

    var list = [];
    for (i = 0; i < results.length; i+=2) {
        list.push({
            start: results[i],
            end: results[i + 1]
        });
    }

    return list;
}

function prepareAttrWithBrackets(node) {
    var parts, i;

    var list = node.attr;
    for (var name in list) {
        if (!has(list, name)) continue;

        parts = bracketsParser(list[name]);

        if (parts.length > 0) {
            list[name] = '~~~' + htmlAttrToJsx(list[name], parts) + '~~~';
        }
    }

    if (has(list, 'class')) {
        list['className'] = list['class'];
        delete list['class'];
    }

    if (node.children) {
        for (i = 0; i < node.children.length; i++) {
            prepareAttrWithBrackets(node.children[i]);
        }
    }
}

function htmlAttrToJsx(attr, list) {
    var parts = [],
        start = 0;

    list = list || bracketsParser(attr);

    list.forEach(function (item, i) {
        if (item.start - start > 0) {
            parts.push("'" + attr.slice(start, item.start) + "'");
        }
        parts.push(attr.slice(item.start + 1, item.end - 1));
        start = item.end;
    });

    if (start < attr.length) {
        parts.push("'" + attr.slice(start) + "'");
    }

    return "{" + parts.join(' + ') + "}";
}

function clearAttrWithBrackets(html) {
    return html
        .replace(/="~~~\{/g, '={').replace(/}~~~"/g, '}')
        .replace(spreadAttr, '{...$1}')
    ;
}

function removeRegularComments(node) {
    if (node.type === 'comment' && !renderAnnotation.test(node.data)) {
        dom.removeNode(node);
    }
    else if (node.type === 'tag' && node.children) {
        for (var i = 0; i < node.children.length; i++) {
            removeRegularComments(node.children[i]);
        }
    }
}

function slice(code, ops) {
    return code.slice(ops.start, ops.end);
}

function replace(code, ranges) {
    ranges.forEach(function (item, i) {
        code = insert(code, item.start, item.end, "||" + i + repeat("*", item.end - item.start - 4 - i.toString().length) + "||")
    });

    return code.replace(/\|\|(\d+)\**\|\|/g, function (x, index) {
        return ranges[index].str;
    });
}

function insert(str, start, end, newStr) {
    return str.slice(0, start) + newStr + str.slice(end);
}

function repeat(char, length) {
    var str = "";
    for (var i = 0; i < length; i++) {
        str += char;
    }
    return str;
}

function clone(obj) {
    return extend(true, {}, obj);
}