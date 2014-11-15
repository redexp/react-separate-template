var List = React.createClass({
    displayName: 'List',

    getInitialState: function() {
        return {focused: 0};
    },

    render: function() {
        var self = this;

        return <ul>
    {
                this.props.items.map(function(m, index) {
                    var style = '';

                    if (self.state.focused == index) {
                        style = 'focused';
                    }

                    var attr = {name: 'value'};

                    return <Item {...attr} title="Item" className={'item ' + style}>{m}</Item>;
                })
            }
    
    
</ul>;
    }
});

var Item = React.createClass({
    displayName: 'Item',
    render: function () {
        console.log('test');
        return <div>
    <input type="text" />
</div>;
    }
});