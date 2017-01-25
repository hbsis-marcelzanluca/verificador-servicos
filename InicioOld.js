var config = require("./Config");
var request = require('sync-request');

var http = require('http'),
  express = require('express');


var webhookUri = "https://hooks.slack.com/services/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";

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  var msg = varreServicos();
  res.status(201).send(JSON.parse(msg));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var indMensagemCaiuEnviada = 0;
var teste = 0;
var arrServicoNok = [];
function varreServicos() {
  var msg = '';
  for (var i = 0; i < config.servidores.length; i++) {
    servidor = config.servidores[i];
    var statusServicos = '';
    for (var y = 0; y < servidor.servicos.length; y++) {
      if(arrServicoNok[servidor.nome+servidor.servicos[y]] != 1){
        arrServicoNok[servidor.nome+servidor.servicos[y]] = 0;
      }

      var urlCompleta = 'http://' + servidor.url + '/wms/new/' + servidor.servicos[y] + '/health-check';
      try {
        var res = request('GET', urlCompleta, {headers:{'Content-type': 'application/json'}});
        var retorno = JSON.parse(res.getBody('utf8'));
        retorno = retorno.data == 'OK' ? 'OK' : 'NOK';
        statusServicos += (statusServicos.length > 0 ? ',' :'');
        statusServicos += '{"'+servidor.servicos[y]+'":"'+retorno+'"}';

        if(servidor.servicos.length == (y + 1)){
          var strStatusUltimo = statusServicos;
          msg  += (msg .length > 0 ? ',' :'');
          msg += '"'+servidor.nome+'":['+strStatusUltimo+']';
        }


        enviarMensagemServicosReestabelecidos(servidor.nome+servidor.servicos[y]);

      } catch (e) {

        enviarMensagemServicosParados(servidor.nome+servidor.servicos[y]);

        statusServicos += (statusServicos.length > 0 ? ',' :'');
        statusServicos += '{"'+servidor.servicos[y]+'":"NOK"}';

        if(servidor.servicos.length == (y + 1)){
          var strStatusUltimo = statusServicos;
          msg  += (msg.length > 0 ? ',' :'');
          msg += '"'+servidor.nome+'":['+strStatusUltimo+']';
        }
      }
    }
  }

  msg = '{'+msg+'}';
  //console.log(msg);
  return(msg);

}

function enviarMensagemServicosParados(strServico){
  /*VERIFICA SE A MENSAGEM PARA O SLACK JA FOI ENVIADA, PARA NAO GERAR SPAM*/
  if(indMensagemCaiuEnviada == 0) {
    console.log("Enviando mensagem servico parado");
    var strMensagem = "Existem serviços que não estão respondendo. Favor verificar o painel de serviços WMS.";
    indMensagemCaiuEnviada = 1;
    arrServicoNok[strServico] = 1;
    enviaMensagemSlack(strMensagem);
    console.log("Enviado");
  }
}

function enviarMensagemServicosReestabelecidos(strServico) {
  if(indMensagemCaiuEnviada > 0 && arrServicoNok[strServico] > 0) {
    console.log("Enviando mensagem servico reestabelecido");
    var strMensagem = "Os serviços foram reestabilizados.";
    indMensagemCaiuEnviada = 0;
    arrServicoNok[strServico] = 0
    enviaMensagemSlack(strMensagem);
    console.log("Enviado")
  }
}

function enviaMensagemSlack(strMensagem) {
  console.log("EnviadoSlack");
  var res = request(
      'POST',
    webhookUri,
    {
      headers:{'Content-type': 'application/json'},
      json: {
        "channel":"#testesservicos",
        "username": "Services",
        "text": strMensagem
      }
    }
  );
  console.log(res.getBody('utf8'));
}


