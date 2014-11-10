var conv = require('../conv'),
    expect = require('chai').expect,
    fs = require('fs');

function file(path) {
    return fs.readFileSync(__dirname + '/' + path).toString();
}

describe('convert function', function () {
    var js = file('menu.js'),
        html = file('menu.html');

    it ('should convert js + html to jsx', function (done) {
        conv(js, html, function (err, jsx) {
            expect(jsx).to.equal(file('menu.jsx'));
            done();
        });
    });

    it ('should throw error: "Render not found"', function (done) {
        var badHtml = html.replace('@render list', '@render test');

        conv(js, badHtml, function (err, jsx) {
            expect(err).not.to.be.null;
            done();
        });
    });

    it ('should throw error: "JSX template not found"', function (done) {
        var badJs = js.replace('@jsx-tpl item', '@jsx-tpl test');

        conv(badJs, html, function (err, jsx) {
            expect(err).not.to.be.null;
            done();
        });
    });

    it ('should throw error: "Too many render:"', function (done) {
        var badJs = js + js;

        conv(badJs, html, function (err, jsx) {
            expect(err).not.to.be.null;
            done();
        });
    });

    it ('should throw error: "No render:"', function (done) {
        var badJs = js.replace('render:', 'list:');

        conv(badJs, html, function (err, jsx) {
            expect(err).not.to.be.null;
            done();
        });
    });

});