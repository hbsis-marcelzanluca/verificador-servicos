/** @jsx React.DOM */
var Card = React.createClass({
	render: function () {
    return (
    	<div id="card" className={this.props.className}>
    		<h1>{this.props.strNomeServidor}</h1>
    	</div>
    );
  }
});