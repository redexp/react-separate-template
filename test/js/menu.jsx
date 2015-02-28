var List = React.createClass({
    getInitialState: function () {
        return { focused: 0 };
    },
    render: function () {
        var self = this;
        return <ul>
            {this.props.items.map(function (m, index) {
            var style = '';
            if (self.state.focused == index) {
                style = 'focused';
            }
            var attr = { name: 'value' };
            return <Item className={"item " + style} {...attr} title={"Item"}>{m}</Item>;
        })}
            
            
        </ul>;
    }
});
var Item = React.createClass({
    render: function () {
        console.log('test');
        return <li>
            <input type={"text"} />
        </li>;
    }
});
var Users = {};
Users.List = React.createClass({
    render: function () {
        return <ul className={"users"}>
            {this.props.users.map(function (user) {
            return <li>
                    <h2>{user.name}</h2>
            
                    <FriendsList friends={user.friends} className={"friends"} data-id={"1"} />
            
                    
                </li>;
        })}
            
        </ul>;
    }
});
var Friends = {
    FriendsList: React.createClass({
        render: function () {
            return <ul>
                        {this.props.friends.map(function (friend) {
                return <li>
                                <h3>{friend.name}</h3>
                            </li>;
            })}
                        
                    </ul>;
        }
    })
};
var TestList = React.createClass({
    render: function () {
        var x = <TestItem />;
        return <div>
                    {x}
                    
                </div>;
    }
});
var TestItem = React.createClass({
    render: function () {
        return <li>
                        <span>{test.name}</span>
                    </li>;
    }
});
var TestWithoutRender = React.createClass({});
var TestWithoutTemplate = React.createClass({
    render: function () {
        return {
            item: function () {
                this;
            }
        };
    }
});