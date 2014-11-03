var fs = require('fs'),
    Crawler = require('crawler'),
    search = require('grasp').search('squery'),
    format = require('util').format;

var c = new Crawler();

var js = fs.readFileSync('js/menu.src.js').toString(),
    html = fs.readFileSync('js/menu.html').toString(),
    jsxComments = /\/\*+\s*@jsx\s+([\w\-]+)\s*\*\//g,
    renderComments = /<!--\s*@render\s+([\w\-]+)\s*-->/g;

c.queue({
    html: html,
    callback: function (err, res, $) {
        var templates = {},
            body = $('body');

        $('[class]').each(function (i, item) {
            item.setAttribute('className', item.getAttribute('class'));
            item.removeAttribute('class');
        });

        $('[jsx]').detach().each(function (i, item) {
            templates[item.getAttribute('jsx')] = item;
            item.removeAttribute('jsx');
        });

        //var res = search('prop[key.name=render].value.body > return > obj > prop', js);

        var _return = search('prop[key.name=render].value.body > return', js)[0],
            _props = search('prop[key.name=render].value.body > return > obj > prop', js),
            props = {};

        _props.forEach(function (prop) {
            var name = prop.key.name,
                body = prop.value.body,
                value = js.slice(body.start, body.end);

            value = value.replace(jsxComments, function (x, name) {
                return format('(%s)', templates[name].outerHTML);
            });

            props[name] = value;
        });

        var template = body.html().replace(renderComments, function (x, name) {
            return props[name];
        });

        js = insert(js, _return.start, _return.end, format('return (%s);', template));

        fs.writeFileSync('js/menu.jsx', js);
        process.exit();
    }
});

function insert(str, start, end, newStr) {
    return str.slice(0, start) + newStr + str.slice(end);
}

function fixJsxAttributes(str) {
    return str.replace(/="#\{/g, '={').replace(/}#"/g, '"');
}

function strToJsx(str) {
    var parts = str.split(/\s+/),
        jsx = [];

    parts.forEach(function (item, i) {
        if (item.charAt(0) === '{') {
            jsx.push(item.replace(/^\{/, '').replace(/}$/, ''));
        }
        else {
            jsx.push(format("'%s'", item));
        }
    });

    jsx = jsx.join(" + ' ' + ").replace(/' \+ '/g, '');

    return format('{%s}', jsx);
}