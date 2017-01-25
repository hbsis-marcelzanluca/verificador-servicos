/** @jsx React.DOM */
var Painel = React.createClass({
	render: function() {
		return(
			<div className="centralizaConteudo">
				<Card className="greenCard" strCaminhoServidor="52.67.35.220" strNomeServidor="Guarulhos" />
				<Card className="redCard" strCaminhoServidor="52.67.35.220" strNomeServidor="SUL" />
				<Card className="yellowCard" strCaminhoServidor="52.67.35.220" strNomeServidor="SP" />
				<Card className="greenCard" strCaminhoServidor="52.67.35.220" strNomeServidor="MG" />
				<Card className="redCard" strCaminhoServidor="52.67.35.220" strNomeServidor="Revenda" />
			</div>
		);
	}
});