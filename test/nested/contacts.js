var Contacts = React.createClass({
    displayName: 'Contacts',

    getInitialState: function() {
        return {focused: 0};
    },

    render: function () {
        return {
            list: function () {
                this.props.list.map(function (item) {
                    return "@jsx-tpl item";
                })
            }
        };
    }
});

var ContactPhotos = React.createClass({
    displayName: 'ContactPhotos',

    render: function () {
        return {
            list: function () {
                this.props.list.map(function () {
                    return "@jsx-tpl photo";
                })
            }
        }
    }
});