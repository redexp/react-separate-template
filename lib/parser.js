var parser = require('html-parser');

module.exports = parse;

function parse(html) {
    var body = {
        type: 'tag',
        name: 'body',
        attr: {},
        closed: false,
        children: []
    };

    var current = body;

    parser.parse(html, {
        openElement: function(name) {
            open({
                type: 'tag',
                closed: false,
                name: name
            });
        },
        text: function (value) {
            open({
                type: 'text',
                closed: true,
                data: value
            });
        },
        comment: function(value) {
            open({
                type: 'comment',
                closed: true,
                data: value
            });
        },
        closeOpenedElement: function(name, token) {
            current.closed = current.unary = token === '/>';
        },
        closeElement: function(name) {
            if (current.closed) {
                current.parent.closed = true;
                current = current.parent;
            }
            else {
                current.closed = true;
            }
        },
        attribute: function(name, value) {
            current.attr[name] = value;
        }
    });

    return body;

    function open(tag) {
        tag.attr = {};
        tag.children = [];

        if (current.closed) {
            tag.prev = current;
            tag.parent = current.parent;
            current.next = tag;
            current.parent.children.push(tag);
            current = tag;
        }
        else {
            tag.parent = current;
            tag.prev = null;
            current.children.push(tag);
            current = tag;
        }
    }
}
