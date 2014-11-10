var htmlParser = require('htmlparser2'),
    domUtils = htmlParser.DomUtils,
    search = require('grasp').search('squery'),
    format = require('util').format;

module.exports = convert;

var tplAnnotations = /["']\s*@jsx\-tpl\s+([\w\-]+)\s*['"]/g,
    tplAttr = 'jsx-tpl',
    renderAnnotation = /@render\s+([\w\-]+)/,
    renderAnnotationComments = /<!--\s*@render\s+([\w\-]+)\s*-->/g,
    spreadAttr = /jsx\-spread="([\$\w]+)"/g,
    renderReturnSelector =
        'call[callee.object.name="React"][callee.property.name="createClass"]'+
        ' > obj > prop[key.name="render"] > func-exp > block > return';

function convert(js, html, callback) {
    parseHtml(html, function (err, body) {
        if (err) {
            return callback(err);
        }

        prepareAttr(body);

        removeComments(body);

        var tplList = findNodesByAttr(body, tplAttr);

        var templates = {};
        tplList.forEach(function (node) {
            var name = node.attribs[tplAttr];
            delete node.attribs[tplAttr];
            templates[name] = clearAttrQuotes(domUtils.getOuterHTML(node));
        });

        removeNodes(tplList);

        var _return = search(renderReturnSelector, js),
            _props = search(renderReturnSelector + ' > obj > prop', js),
            props = {};

        try {
            _props.forEach(function (prop) {
                var name = prop.key.name,
                    body = prop.value.body,
                    value = js.slice(body.start, body.end);

                value = value.replace(tplAnnotations, function (x, name) {
                    if (!templates.hasOwnProperty(name)) {
                        throw new Error('JSX template "' + name + '" not exists');
                    }

                    return format('(%s)', templates[name]);
                });

                props[name] = value;
            });
        }
        catch (e) {
            return callback(e);
        }

        var template = clearAttrQuotes(domUtils.getOuterHTML(body));

        try {
            template = template
                .replace(renderAnnotationComments, function (x, name) {
                    if (!props.hasOwnProperty(name)) {
                        throw new Error('Render template "' + name + '" not exists');
                    }

                    return props[name];
                })
            ;
        }
        catch (e) {
            return callback(e);
        }

        if (_return.length === 0) {
            return callback(new Error('React.createClass return: option not found'));
        }
        else if (_return.length > 1) {
            return callback(new Error('More then one React.createClass return: option found, should be only one'));
        }
        else {
            js = insert(js, _return[0].start, _return[0].end, format('return (%s);', template));
        }

        return callback(err, js);
    });
}

function parseHtml(html, callback) {
    var handler = new htmlParser.DomHandler(function (err, dom) {
        if (err) {
            callback(err);
            return;
        }

        var body;
        if (dom.type === 'tag') {
            body = dom;
        }
        else {
            for (var i = 0; i < dom.length; i++) {
                if (dom[i].type === 'tag') {
                    body = dom[i];
                    break;
                }
            }
        }

        callback(err, body);
    });

    var parser = new htmlParser.Parser(handler, {
        lowerCaseTags: false,
        lowerCaseAttributeNames: false
    });

    parser.write(html);
    parser.done();
}

function insert(str, start, end, newStr) {
    return str.slice(0, start) + newStr + str.slice(end);
}

function bracketsParser(str) {
    var results = [],
        level = 0,
        i = 0;

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

function prepareAttr(node) {
    var parts, i;

    var list = node.attribs || {};
    for (var name in list) {
        if (!list.hasOwnProperty(name)) continue;

        parts = bracketsParser(list[name]);

        if (parts.length > 0) {
            list[name] = '~~~' + htmlAttrToJsx(list[name], parts) + '~~~';
        }
    }

    if (list.hasOwnProperty('class')) {
        list['className'] = list['class'];
        delete list['class'];
    }

    if (node.children) {
        for (i = 0; i < node.children.length; i++) {
            prepareAttr(node.children[i]);
        }
    }
}

function htmlAttrToJsx(attr, list) {
    var parts = [],
        start = 0;

    list = list || bracketsParser(attr);

    list.forEach(function (item, i) {
        parts.push("'" + attr.slice(start, item.start) + "'");
        parts.push(attr.slice(item.start + 1, item.end - 1));
        start = item.end;
    });

    if (start < attr.length) {
        parts.push("'" + attr.slice(start) + "'");
    }

    return "{" + parts.join(' + ') + "}";
}

function clearAttrQuotes(html) {
    return html
        .replace(/="~~~\{/g, '={').replace(/}~~~"/g, '}')
        .replace(spreadAttr, '{...$1}')
    ;
}

function findNodesByAttr(body, attrName) {
    return domUtils.findAll(function (node) {
        return domUtils.hasAttrib(node, attrName);
    }, body.children);
}

function removeNodes(nodeArray) {
    nodeArray.forEach(function (node) {
        domUtils.removeElement(node);
    });
}

function removeComments(node) {
    if (node.type === 'comment' && !renderAnnotation.test(node.data)) {
        domUtils.removeElement(node);
    }
    else if (node.type === 'tag' && node.children) {
        for (var i = 0; i < node.children.length; i++) {
            removeComments(node.children[i]);
        }
    }
}