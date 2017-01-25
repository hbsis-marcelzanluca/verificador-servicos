var config = require("./Config");
//var request = require('sync-request');
var async = require("async");
var request = require('request');
var http = require('http'),
  express = require('express');

var servicoStatus = '';
var indMensagemCaiuEnviada = 0;
var arrServicoNok = [];
var webhookUri = "https://hooks.slack.com/services/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";

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  var msg = varreServicos(res);
  //res.status(201).send(msg);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function varreServicos(res) {
  var urlCompleta = [];
  for (var i = 0; i < config.servidores.length; i++) {
    servidor = config.servidores[i];
    for (var y = 0; y < servidor.servicos.length; y++) {
      urlCompleta.push('http://' + servidor.url + '/wms/new/' + servidor.servicos[y] + '/health-check?'+servidor.nome+'&'+ servidor.servicos[y]);
    }
  }

  var fetch = function(url, callback){
    var arrayUrl = url.split('?');
    var parametros = arrayUrl[1].split('&');
    var servidor = parametros[0];
    var servico = parametros[1];

    request(
      { url: url, method: 'GET', timeout: 10000, headers: {'Content-Type': 'application/json'} } ,
      function (error, response, body) {
        var retorno;

        if (!error && response.statusCode == 200) {
          var parametro = decodeURI(response.request.uri.query);
          parametro = parametro.split('&');
          retorno = JSON.parse(body);
          retorno = retorno.data == 'OK' ? 'OK' : 'NOK';

          enviarMensagemServicosReestabelecidos(servidor+servico);
        }else{
          retorno = 'NOK';
          enviarMensagemServicosParados(servidor+servico);
        }

        callback(null, servidor+'|{"'+servico+'":"'+retorno+'"}');
      }
    )
  };

  servicoStatus = '';
  async.map(urlCompleta, fetch, function(err, results){
    if ( err){
      servicoStatus = '{erro}';
      enviarMensagemServicosParados('Geral'+'Geral');
    } else {
      var nomeServidor = '';
      for (var i = 0; i < results.length; i++) {
        var resultado = results[i].split('|');
        if(resultado[0] !=  nomeServidor){
          if(nomeServidor != ''){
            servicoStatus = servicoStatus.substr(0, servicoStatus.length-1);
            servicoStatus += '],';
          }

          nomeServidor = resultado[0];
          servicoStatus += '"'+nomeServidor+'":[';
        }

        servicoStatus += resultado[1]+','
      }
      servicoStatus = servicoStatus.substr(0, servicoStatus.length-1);
      servicoStatus += ']';

      res.status(201).send("{"+servicoStatus+"}");
    }
  });

  return "{"+servicoStatus+"}"; //JSON.stringify(arrServicoStatus);
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
    enviaMensagemSlack(strMensagem)
    console.log("Enviado")
  }
}

function enviaMensagemSlack(strMensagem) {
  console.log("EnviadoSlack");

  request(
    { url: webhookUri, method: 'POST', timeout: 10000, headers: {'Content-Type': 'application/json'},
      json: {
        "channel":"#testesservicos",
        "username": "Services",
        "text": strMensagem
      }
    } ,
    function (error, response, body) {

    }
  );
}
