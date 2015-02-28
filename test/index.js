var conv = require('../conv'),
    expect = require('chai').expect,
    fs = require('fs');

function file(path) {
    return fs.readFileSync(__dirname + '/js/' + path).toString();
}

describe('convert function', function () {
    var js = file('menu.js'),
        html = file('menu.html');

    it ('should convert js + html to jsx', function (done) {
        conv(js, html, function (err, jsx) {
            expect(err).to.be.null;
            expect(jsx).to.equal(file('menu.jsx'));
            done();
        });
    });

    it ('should throw error: "Render not found"', function (done) {
        var badHtml = html.replace('@render list', '@render test');

        conv(js, badHtml, function (err, jsx) {
            expect(err).not.to.be.null;
            expect(err.message).to.equal('Render return function "test" for class List not found');
            done();
        });
    });

    it ('should throw error: "HTML template not found"', function (done) {
        var badJs = js.replace('@jsx-tpl item', '@jsx-tpl test');

        conv(badJs, html, function (err, jsx) {
            expect(err).not.to.be.null;
            expect(err.message).to.equal('HTML template for jsx-tpl "test" not found');
            done();
        });
    });

});