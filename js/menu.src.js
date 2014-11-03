var MenuExample = React.createClass({

    getInitialState: function() {
        return {focused: 0};
    },

    clicked: function(index) {

        // Обработчик клика обновит состояние
        // изменив индекс на сфокусированный элемент меню

        this.setState({focused: index});
    },

    render: function() {

        // Здесь мы читаем свойство items, которое было передано
        // атрибутом, при создании компонента

        var self = this;

        // Метод map пройдется по массиву элементов меню,
        // и возвратит массив с <li> элементами.

        return {
            list: function () {
                this.props.items.map(function(m, index) {

                    var style = '';

                    if (self.state.focused == index) {
                        style = 'focused';
                    }

                    return /* @jsx item */;
                })
            }
        };
    }
});