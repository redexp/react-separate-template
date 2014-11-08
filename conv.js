var htmlParser = require('htmlparser2'),
    domUtils = htmlParser.DomUtils,
    search = require('grasp').search('squery'),
    format = require('util').format;

module.exports = convert;

var tplAnnotations = /\/\*+\s*@tpl\s+([\w\-]+)\s*\*\//g,
    renderAnnotations = /<!--\s*@render\s+([\w\-]+)\s*-->/g,
    renderReturnSelector =
        'call[callee.object.name="React"][callee.property.name="createClass"]'+
        ' > obj > prop[key.name="render"] > func-exp > block > return';

function convert(js, html, callback) {
    parseHtml(html, function (err, body) {
        if (err) {
            callback(err);
            return;
        }

        var templates = {};

        prepareAttr(body);

        domUtils.findAll(function (node) {
            return domUtils.hasAttrib(node, 'tpl');
        }, body.children).forEach(function (node) {
            var name = node.attribs['tpl'];
            delete node.attribs['tpl'];

            templates[name] = clearAttrQuotes(domUtils.getOuterHTML(node));

            domUtils.removeElement(node);
        });

        var _return = search(renderReturnSelector, js)[0],
            _props = search(renderReturnSelector + ' > obj > prop', js),
            props = {};

        _props.forEach(function (prop) {
            var name = prop.key.name,
                body = prop.value.body,
                value = js.slice(body.start, body.end);

            value = value.replace(tplAnnotations, function (x, name) {
                return format('(%s)', templates[name]);
            });

            props[name] = value;
        });

        var template = clearAttrQuotes(domUtils.getOuterHTML(body))
            .replace(renderAnnotations, function (x, name) {
                return props[name];
            });

        js = insert(js, _return.start, _return.end, format('return (%s);', template));

        callback(js);
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
    return html.replace(/="~~~\{/g, '={').replace(/}~~~"/g, '}');
}