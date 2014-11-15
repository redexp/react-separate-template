var List = React.createClass({
    displayName: 'List',

    getInitialState: function() {
        return {focused: 0};
    },

    render: function() {
        var self = this;

        return {
            list: function () {
                this.props.items.map(function(m, index) {
                    var style = '';

                    if (self.state.focused == index) {
                        style = 'focused';
                    }

                    var attr = {name: 'value'};

                    return "@jsx-tpl item";
                })
            },
            foo: function () {
                self.state
            }
        };
    }
});

var Item = React.createClass({
    displayName: 'Item',
    render: function () {
        console.log('test');
        return;
    }
});