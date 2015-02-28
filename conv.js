var toDom = require('./lib/parser'),
    dom = require('./lib/dom-utils'),
    q = require('simple-object-query'),
    find = q.find,
    replace = q.replace,
    where = q.where,
    toHtml = require('./lib/stringify'),
    gen = require('escodegen'),
    toAst = require('esprima').parse,
    extend = require('node.extend');

module.exports = convert;

var tplAttr = 'jsx-tpl',
    classAttr = 'jsx-class',
    instanceAttr = 'jsx-instance',
    renderAnnotation = /^\s*@render\s+([\w\-\$]+)/,
    renderAnnotationCommentSelector = {
        type: 'comment',
        data: renderAnnotation
    },
    tplAnnotation = /^\s*@jsx\-tpl\s+([\w\-\$]+)/,
    tplAnnotationSelector = {
        "type": "Literal",
        "value": tplAnnotation
    },
    classSelectors = [
        {
            selector: {
                'id.type': 'Identifier',
                'init.callee.object.name': 'React',
                'init.callee.property.name': 'createClass'
            },
            map: function (item) {
                return {
                    name: item.id.name,
                    body: item.init
                }
            }
        },
        {
            selector: {
                'key.type': 'Identifier',
                'value.callee.object.name': 'React',
                'value.callee.property.name': 'createClass'
            },
            map: function (item) {
                return {
                    name: item.key.name,
                    body: item.value
                }
            }
        },
        {
            selector: {
                'left.type': 'MemberExpression',
                'right.callee.object.name': 'React',
                'right.callee.property.name': 'createClass'
            },
            map: function (item) {
                return {
                    name: item.left.object.name + '.' + item.left.property.name,
                    body: item.right
                }
            }
        }
    ],
    renderReturnSelector = [
        {
            'key.name': 'render'
        },
        'value.body.body',
        q.flatten,
        {
            'type': 'ReturnStatement'
        }
    ],
    startWithReturn = /^\s*return\s+/,
    endWithSemicolon = /\s*;\s*$/;

function convert(js, html, callback) {
    js = toAst(js);

    var body = toDom(html);

    var htmlClasses = {};

    var classes = dom.findNodesByAttr(body, classAttr);
    classes.forEach(function (item) {
        htmlClasses[item.attr[classAttr]] = item;

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

                delete item.attr[attr];
            }
        }
        else {
            dom.removeNode(item);
        }

        dom.appendTo(body, item);

        delete item.attr[classAttr];
    });

    var tplNodeList = dom.findNodesByAttr(body, tplAttr);

    var htmlTemplates = {};
    tplNodeList.forEach(function (node) {
        var name = node.attr[tplAttr];
        delete node.attr[tplAttr];

        htmlTemplates[name] = toHtml(node);
    });

    dom.removeNodes(tplNodeList);

    try {
        replace(js, tplAnnotationSelector, function (tpl) {
            var name = tpl.value.match(tplAnnotation)[1];
            if (!htmlTemplates[name]) {
                throw new Error('HTML template for jsx-tpl "'+ name +'" not found');
            }
            return verbatimLiteral(htmlTemplates[name]);
        });
    }
    catch (e) {
        return callback(e, null);
    }

    var reactClasses = classSelectors.map(function (item) {
        return find(js, item.selector).map(item.map);
    });

    reactClasses = Array.prototype.concat.apply([], reactClasses);

    try {
        reactClasses.forEach(function(reactClass) {
            var name = reactClass.name,
                _return = where(reactClass.body.arguments[0].properties, renderReturnSelector);

            if (!name || _return.length === 0) return;

            _return = _return[0];

            var htmlDom = htmlClasses[name];

            if (!htmlDom) return;

            var returnProps = {};

            if (_return.argument && _return.argument.type === 'ObjectExpression') {
                _return.argument.properties.forEach(function(prop) {
                    var name = prop.key.name,
                        body = prop.value.body;

                    returnProps[name] = body.body;
                });
            }

            replace({
                source: htmlDom,
                query: renderAnnotationCommentSelector,
                exclude: ['parent', 'next', 'prev'],
                callback: function(comment) {
                    var name = comment.data.match(renderAnnotation)[1];

                    if (!returnProps[name]) {
                        throw new Error('Render return function "' + name + '" for class ' + reactClass.name + ' not found');
                    }

                    var data = toJs({type: 'Program', body: returnProps[name]})
                        .replace(startWithReturn, '')
                        .replace(endWithSemicolon, '');

                    return {
                        type: 'verbatim',
                        data: '{' + data + '}'
                    };
                }
            });

            _return.argument = verbatimLiteral(toHtml(htmlDom));
        });
    }
    catch (e) {
        return callback(e, null);
    }

    callback(null, toJs(js));
}

function toJs(ast) {
    return gen.generate(ast, {verbatim: 'x-verbatim-property'});
}

function has(obj, field) {
    return Object.prototype.hasOwnProperty.call(obj, field);
}

function clone(obj) {
    return extend(true, Array.isArray(obj) ? [] : {}, obj);
}

function verbatimLiteral(str) {
    return {
        type: 'Literal',
        value: 0,
        'x-verbatim-property': {
            content: str,
            precedence : gen.Precedence.Primary
        }
    }
}