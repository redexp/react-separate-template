var UsersList = React.createClass({
    displayName: 'UsersList',
    render: function () {
        return {
            users: function () {
                this.props.users.map(function (user) {
                    return "@jsx-tpl user";
                })
            }
        };
    }
});

var FriendsList = React.createClass({
    displayName: 'FriendsList',
    render: function () {
        return {
            friends: function () {
                this.props.friends.map(function (friend) {
                    return "@jsx-tpl friend";
                })
            }
        };
    }
});
