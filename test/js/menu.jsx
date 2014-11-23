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
        return <li>
    <input type="text" />
</li>;
    }
});

var UsersList = React.createClass({
    displayName: 'UsersList',
    render: function () {
        return <ul className="users">
    {
                this.props.users.map(function (user) {
                    return <li>
        <h2>{user.name}</h2>

        <FriendsList friends={user.friends} />

        
    </li>;
                })}
    
</ul>;
    }
});

var FriendsList = React.createClass({
    displayName: 'FriendsList',
    render: function () {
        return <ul data-id="1" className="friends">
            {
                this.props.friends.map(function (friend) {
                    return <li>
                <h3>{friend.name}</h3>
            </li>;
                })}
            
        </ul>;
    }
});

var TestList = React.createClass({
    displayName: 'TestList',
    render: function () {
        var x = <TestItem />;
        return <div>
            {x}
            
        </div>;
    }
});

var TestItem = React.createClass({
    displayName: 'TestItem',
    render: function () {
        return <li>
                <span>{test.name}</span>
            </li>;
    }
});

var TestWithoutRender = React.createClass({
    displayName: 'TestWithoutRender'
});

var TestWithoutDisplayName = React.createClass({
    render: function () {
        return {
            item: function () {
                this;
            }
        };
    }
});