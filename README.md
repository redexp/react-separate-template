react-separate-template
=======================

React separate templates - Proof of concept

First problem of react is HTML inside our JS files and there is no way to make them separate.

## This is my solution.

So I want to take out HTML from this class to separate file
```javascript
var MenuExample = React.createClass({
    getInitialState: function() {
        return {focused: 0};
    },
    clicked: function(index) {
        this.setState({focused: index});
    },
    render: function() {
        var self = this;

        return (
            <div>
                <ul>
                    {this.props.items.map(function(m, index) {
                        var style = '';

                        if (self.state.focused == index) {
                            style = 'focused';
                        }

                        return (<li className={style}>{m}</li>);
                    })}
                </ul>

                <p>Selected: {this.props.items[this.state.focused]}</p>
            </div>
        );
    }
});
```
But if we just take out everything after `return` it's not what I want. I need absolutely clear HTML so I can write
my CSS and see results without running whole app. I want to se template like this
```html
<div>
    <ul>
        <li class={style}>{m}</li>
    </ul>

    <p>Selected: {this.props.items[this.state.focused]}</p>
</div>
```
Okay, first of all we need to put `this.props.items.map(...)` in `ul`. I thought, annotation is good enough to make link
to some function like this
```html
<div>
    <ul>
        <!-- @render list -->
    </ul>

    <p>Selected: {this.props.items[this.state.focused]}</p>
</div>
```
But where should be that `list` function? What if it will be right after our `return`, where was this template?
```javascript
var MenuExample = React.createClass({

    //...

    render: function() {
        var self = this;

        return {
            item: function () {
                this.props.items.map(function(m, index) {
                    var style = '';

                    if (self.state.focused == index) {
                        style = 'focused';
                    }

                    return <li className={style}>{m}</li>;
                })
            }
        };
    }
});
```
But wait, not that again, HTML in code, maybe we can take out it, but it should be in same template file. Maybe we will
make some annotation which will be replaced with HTML (with some unique id) from our template?
```javascript
var MenuExample = React.createClass({

    //...

    render: function() {
        var self = this;

        return {
            item: function () {
                this.props.items.map(function(m, index) {
                    var style = '';

                    if (self.state.focused == index) {
                        style = 'focused';
                    }

                    return /* @tpl item */;
                })
            }
        };
    }
});
```
Lets call attribute with this unique id just like annotation
```html
<div>
    <ul>
        <!-- @render list -->
        <li tpl="item" class={style}>{m}</li>
    </ul>

    <p>Selected: {this.props.items[this.state.focused]}</p>
</div>
```
Lets say that all tags with attribute `tpl` will be detached from template and can be used only in classes to replace
`@tpl` annotations. So basically they can be anywhere in template.

Alright, looks good! Last thing to do is to write script to join code with template.
I already done it [conv.js](conv.js), just run `node cli.js -j test/menu.js`. It will take file [test/menu.js](test/menu.js) and
join with [test/menu.html](test/menu.html) and save to [test/menu.jsx](test/menu.jsx)

To see all options run `node cli.js -h`

## Additional features

 * All `class` attributes will renamed to `className`
 * I added syntax like this `class="item {style}"` and it will be converted to `className={"item " + style}`. Helpful for
   styling html without running js code

## Notice

All attributes with curly brackets will be converted to react jsx version. If you will write something like this
`data-bind="attr: {active: isActive}"` it will be converted to `data-bind={'attr: ' + active: isActive}`, so be careful.

## TODO

 * make npm module
 * make gulp module

## Contribute!

I will be glad if you have any suggestions, just create an issue.