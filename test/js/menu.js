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
    render: function () {
        console.log('test');
        return;
    }
});
var Users = {};
Users.List = React.createClass({
    render: function () {
        return {
            users: function () {
                this.props.users.map(function (user) {
                    return "@jsx-tpl user";
                });
            }
        };
    }
});

var Friends = {
    FriendsList: React.createClass({
        render: function () {
            return {
                friends: function () {
                    this.props.friends.map(function (friend) {
                        return "@jsx-tpl friend";
                    });
                }
            };
        }
    })
};

var TestList = React.createClass({
    render: function () {
        var x = "@jsx-tpl test-item";
        return {
            item: function () {
                return x;
            }
        };
    }
});

var TestItem = React.createClass({
    render: function () {
        return;
    }
});

var TestWithoutRender = React.createClass({

});

var TestWithoutTemplate = React.createClass({
    render: function () {
        return {
            item: function () {
                this;
            }
        };
    }
});