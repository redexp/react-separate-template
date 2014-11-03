var fs = require('fs'),
    Crawler = require('crawler'),
    search = require('grasp').search('squery'),
    format = require('util').format;

var c = new Crawler();

var js = fs.readFileSync('js/menu.js').toString(),
    html = fs.readFileSync('js/menu.html').toString(),
    tplAnnotations = /\/\*+\s*@tpl\s+([\w\-]+)\s*\*\//g,
    renderAnnotations = /<!--\s*@render\s+([\w\-]+)\s*-->/g;

c.queue({
    html: html,
    callback: function (err, res, $) {
        var templates = {},
            body = $('body');

        $('[class]').each(function (i, item) {
            item.setAttribute('className', item.getAttribute('class'));
            item.removeAttribute('class');
        });

        $('[tpl]').detach().each(function (i, item) {
            templates[item.getAttribute('tpl')] = item;
            item.removeAttribute('tpl');
        });

        var _return = search('prop[key.name=render].value.body > return', js)[0],
            _props = search('prop[key.name=render].value.body > return > obj > prop', js),
            props = {};

        _props.forEach(function (prop) {
            var name = prop.key.name,
                body = prop.value.body,
                value = js.slice(body.start, body.end);

            value = value.replace(tplAnnotations, function (x, name) {
                return format('(%s)', templates[name].outerHTML);
            });

            props[name] = value;
        });

        var template = body.html().replace(renderAnnotations, function (x, name) {
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