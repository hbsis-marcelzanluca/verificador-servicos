var config = require("./Config");
var request = require('sync-request');

var http = require('http'),
  express = require('express');

var app = express();
app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
  varreServicos(function (msg) {
    res.status(201).send(msg)
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function varreServicos(callback) {
  var msg = '';

  for (var i = 0; i < config.servidores.length; i++) {
    servidor = config.servidores[i];

    var statusServicos = '';
    for (var y = 0; y < servidor.servicos.length; y++) {
      var urlCompleta = 'http://' + servidor.url + '/wms/new/' + servidor.servicos[y] + '/heath-check';
      var res = request('GET', urlCompleta, {headers:{'Content-type': 'application/json'}});

      var retorno = JSON.parse(res.getBody('utf8'));
      retorno = retorno.data == 'OK' ? 'OK' : 'NOK'

      statusServicos += (statusServicos.length > 0 ? ',' :'');
      statusServicos += '{"'+servidor.servicos[y]+'":"'+retorno+'"}';


    }
    msg  += (msg .length > 0 ? ',' :'');
    msg += '"'+servidor.nome+'":['+statusServicos+']';
  }

  msg = '{'+msg+'}'

  console.log(msg);
  callback(msg);
}