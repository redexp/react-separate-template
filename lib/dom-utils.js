module.exports = {
    findNodes: findNodes,
    findNodesByAttr: findNodesByAttr,
    findNodesByAttrValue: findNodesByAttrValue,
    removeNodes: removeNodes,
    removeNode: removeNode
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
}