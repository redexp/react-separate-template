var MenuExample = React.createClass({
    getInitialState: function() {
        return {focused: 0};
    },

    clicked: function(index) {
        this.setState({focused: index});
    },

    render: function() {
        var self = this;

        return (<div>
    <ul>
        {
                this.props.items.map(function(m, index) {
                    var style = '';

                    if (self.state.focused == index) {
                        style = 'focused';
                    }

                    return (<li title="Item" className={'item ' + style}>{m}</li>);
                })
            }
        
    </ul>

    <p>Selected: {this.props.items[this.state.focused]}</p>
</div>);
    }
});