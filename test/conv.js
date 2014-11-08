var conv = require('../conv'),
    expect = require('chai').expect,
    fs = require('fs');

function file(path) {
    return fs.readFileSync(__dirname + '/' + path).toString();
}

describe('convert function', function () {

    it ('should convert js + html to jsx', function (done) {
        conv(file('menu.js'), file('menu.html'), function (jsx) {
            expect(jsx).to.equal(file('menu.jsx'));
            done();
        });
    });

});