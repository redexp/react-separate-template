var fs = require('fs'),
    Crawler = require('crawler'),
    search = require('grasp').search('squery'),
    format = require('util').format;

var c = new Crawler();

var fileJs = process.argv[2],
    fileHtml = fileJs.replace(/\.js$/, '.html'),
    fileJsx = fileJs.replace(/\.js$/, '.jsx');

var js = fs.readFileSync(fileJs).toString(),
    html = fs.readFileSync(fileHtml).toString(),
    tplAnnotations = /\/\*+\s*@tpl\s+([\w\-]+)\s*\*\//g,
    renderAnnotations = /<!--\s*@render\s+([\w\-]+)\s*-->/g,
    renderReturnSelector =
        'call[callee.object.name="React"][callee.property.name="createClass"]'+
        ' > obj > prop[key.name="render"] > func-exp > block > return';

c.queue({
    html: html,
    callback: function (err, res, $) {
        var templates = {},
            body = $('body');

        prepareAttr(body.get(0));

        $('[class]').each(function (i, item) {
            item.setAttribute('className', item.getAttribute('class'));
            item.removeAttribute('class');
        });

        $('[tpl]').detach().each(function (i, item) {
            var name = item.getAttribute('tpl');
            item.removeAttribute('tpl');
            templates[name] = clearAttrQuotes(item.outerHTML);
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

        var template = clearAttrQuotes(body.html()).replace(renderAnnotations, function (x, name) {
            return props[name];
        });

        js = insert(js, _return.start, _return.end, format('return (%s);', template));

        fs.writeFileSync(fileJsx, js);
        process.exit();
    }
});

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

function prepareAttr(node) {
    var list, attr, parts, i;

    if (node.hasAttributes()) {
        list = node.attributes;
        for (i = 0; i < list.length; i++) {
            attr = list.item(i);
            parts = bracketsParser(attr.value);

            if (parts.length > 0) {
                attr.value = '~~~' + htmlAttrToJsx(attr.value, parts) + '~~~';
            }
        }
    }

    if (node.hasChildNodes()) {
        for (i = 0; i < node.children.length; i++) {
            prepareAttr(node.children[i]);
        }
    }
}

function clearAttrQuotes(html) {
    return html.replace(/="~~~\{/g, '={').replace(/}~~~"/g, '}');
}