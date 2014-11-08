var List = React.createClass({
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

                    return /* @tpl item */;
                })
            },
            foo: function () {
                self.state
            }
        };
    }
});