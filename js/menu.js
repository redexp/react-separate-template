var MenuExample = React.createClass({
    getInitialState: function() {
        return {focused: 0};
    },

    clicked: function(index) {
        this.setState({focused: index});
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
            }
        };
    }
});