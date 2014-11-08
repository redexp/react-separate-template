var fs = require('fs'),
    convert = require('./conv'),
    app = require('commander'),
    react = require('react-tools');

app
    .version('0.3.0')
    .usage('-j <file> [options]')
    .option('-j, --js <path>', 'Input js file path')
    .option('-x, --html [path]', 'Input html file path, default is js file path but with .html extension')
    .option('-o, --out [path]', 'Output file path, default is js file path but with .jsx extension')
    .option('-t, --type [jsx|js]', 'Type of output file, default is jsx. If you will specify js then jsx code will be converted to js with react-tools')
    .parse(process.argv);

var fileJs = app.js,
    fileHtml = app.html || fileJs.replace(/\.js$/, '.html'),
    fileJsx = app.out || fileJs.replace(/\.js$/, '.jsx'),
    js = fs.readFileSync(fileJs).toString(),
    html = fs.readFileSync(fileHtml).toString();

convert(js, html, function (jsx) {
    if (app.type === 'js') {
        jsx = react.transform(jsx);
    }

    fs.writeFileSync(fileJsx, jsx);
});