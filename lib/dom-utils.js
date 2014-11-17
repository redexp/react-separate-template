module.exports = {
    findNodes: findNodes,
    findNodesByAttr: findNodesByAttr,
    findNodesByAttrValue: findNodesByAttrValue,
    removeNodes: removeNodes,
    removeNode: removeNode,
    replaceWith: replaceWith,
    appendTo: appendTo,
    closestParentWithAttrList: closestParentWithAttrList
};

function findNodes(node, test) {
    var result = [];

    if(test(node)) {
        result.push(node);
    }

    for(var i = 0, len = node.children.length; i < len; i++){
        result = result.concat(findNodes(node.children[i], test));
    }

    return result;
}

function findNodesByAttr(body, name) {
    return findNodes(body, function (node) {
        return node.attr.hasOwnProperty(name);
    });
}

function findNodesByAttrValue(body, name, value) {
    return findNodes(body, function (node) {
        return node.attr[name] === value;
    });
}

function removeNodes(nodeArray) {
    nodeArray.forEach(removeNode);
}

function removeNode(node) {
    if(node.prev) {
        node.prev.next = node.next;
    }
    if(node.next) {
        node.next.prev = node.prev;
    }

    if(node.parent){
        var children = node.parent.children;
        children.splice(children.lastIndexOf(node), 1);
    }

    node.prev = null;
    node.next = null;
    node.parent = null;
}

function replaceWith(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node.next;
    newNode.parent = node.parent;
    if (node.prev) {
        node.prev.next = newNode;
    }
    if (node.next) {
        node.next.prev = newNode;
    }
    if (node.parent) {
        var list = node.parent.children;
        list.splice(list.indexOf(node), 1, newNode);
    }

    return newNode;
}

function lastChild(node) {
    return node.children.length > 0 ? node.children[node.children.length - 1] : null;
}

function appendTo(target, node) {
    var last = lastChild(target);
    target.children.push(node);
    node.parent = target;
    if (last) {
        last.next = node;
        node.prev = last;
        node.next = null;
    }
}

function closestParentWithAttrList(node, names) {
    if (node.parent) {
        for (var i = 0; i < names.length; i++) {
            if (node.parent.attr.hasOwnProperty(names[i])) {
                return node.parent;
            }
        }

        return closestParentWithAttrList(node.parent, names);
    }

    return null;
}