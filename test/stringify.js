var toHtml = require('../lib/stringify'),
    toDom = require('../lib/parser'),
    expect = require('chai').expect,
    fs = require('fs');

function file(path) {
    return fs.readFileSync(__dirname + '/js/' + path).toString();
}

describe('stringify', function () {

    it ('should convert dom to jsx html', function () {
        var html = fs.readFileSync(__dirname + '/stringify.html').toString();
        var jsx = fs.readFileSync(__dirname + '/stringify.jsx').toString();

        expect(toHtml(toDom(html).children[0])).to.equal(jsx);
    });

});