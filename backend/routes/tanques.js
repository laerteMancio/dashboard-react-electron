// backend/routes/tanques.js
const express = require('express');
const Firebird = require('node-firebird');
//const { firebirdOptions } = require('../config/firebird.js');

const router = express.Router();

const firebirdOptions = {
  host: '127.0.0.1',
  port: 3050,
  database: 'C:/agil/agil.fdb',
  user: 'SYSDBA',
  password: 'masterkey',
};


// Quantidade por data
router.get('/dia', (req, res) => {
  const { data } = req.query;

  console.log(data);

  if (!data) {
    return res.status(400).json({ erro: "A data é obrigatória" });
  }

  console.log("FIREBIRD_HOST:", process.env.FIREBIRD_HOST);

  Firebird.attach(firebirdOptions, (err, db) => {
    if (err) {
      console.error('Erro na conexão com o banco de dados:', err);
      return res.status(500).json({ erro: "Erro de conexão com o banco de dados" });
    }

    const sql = `SELECT cod_tanque as tanque, qtd_final as quantidade FROM manmvtan WHERE data = ?`;

    db.query(sql, [data], (err, result) => {
      db.detach();

      if (err) {
        console.error('Erro na consulta:', err);
        return res.status(500).json({ erro: "Erro ao executar a consulta" });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ mensagem: "Nenhum resultado encontrado para a data informada" });
      }

      res.json(result);
    });
  });
});

module.exports = router;
