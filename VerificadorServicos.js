var request = require("request");
var say = require("say");

function VerificadorServicos() {
	this.urlServicos = [
		{ nome: "Google", url: "http://google.comm" }
	];
}

VerificadorServicos.prototype = {
	iniciarVerificacao: function () {
		setInterval(this._verificarServicos.bind(this), 1000);
	},

	_verificarServicos: function () {
		for (var i = 0; i < this.urlServicos.length; i++) {
			var nomeServico = this.urlServicos[i].nome;
			request
				.get(this.urlServicos[i].url)
				.on('error', this._aoNaoEncontrarServico.bind(this, nomeServico));
		}
	},

	_aoNaoEncontrarServico: function (nomeServico) {
		var frase = 'Serviço ' + nomeServico + ' não está disponível.';
		say.speak(frase);
	}
};

var verificadorServicos = new VerificadorServicos();
verificadorServicos.iniciarVerificacao();