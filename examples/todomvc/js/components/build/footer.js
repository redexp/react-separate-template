/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React */
var app = app || {};

(function () {
	'use strict';

	app.TodoFooter = React.createClass({
		displayName: 'TodoFooter',
		render: function () {
			var activeTodoWord = app.Utils.pluralize(this.props.count, 'item');
			var clearButton = null;

			if (this.props.completedCount > 0) {
				clearButton = React.createElement("button", {id: "clear-completed", onClick: this.props.onClearCompleted}, 
                "Clear completed (", this.props.completedCount, ")"
            );
			}

			// React idiom for shortcutting to `classSet` since it'll be used often
			var cx = React.addons.classSet;
			var nowShowing = this.props.nowShowing;

			return React.createElement("footer", {id: "footer"}, 
            React.createElement("span", {id: "todo-count"}, 
                React.createElement("strong", null, this.props.count), " ", activeTodoWord, " left"
            ), 
            React.createElement("ul", {id: "filters"}, 
                React.createElement("li", null, 
                    React.createElement("a", {href: "#/", className: cx({selected: nowShowing=== app.ALL_TODOS})}, 
                        "All"
                    )
                ), 
                ' ', 
                React.createElement("li", null, 
                    React.createElement("a", {href: "#/active", className: cx({selected: nowShowing=== app.ACTIVE_TODOS})}, 
                        "Active"
                    )
                ), 
                ' ', 
                React.createElement("li", null, 
                    React.createElement("a", {href: "#/completed", className: cx({selected: nowShowing=== app.COMPLETED_TODOS})}, 
                        "Completed"
                    )
                )
            ), 

            clearButton

            
        );
		}
	});
})();
