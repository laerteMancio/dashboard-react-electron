// backend/routes/despesas.js
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


router.get('/total', (req, res) => {
  const { dataInicio, dataFim } = req.query;

  if (!dataInicio || !dataFim) {
    return res.status(400).json({ erro: "Datas de início e fim são obrigatórias" });
  }

  Firebird.attach(firebirdOptions, (err, db) => {
    if (err) {
      console.error('Erro ao conectar no Firebird:', err);
      return res.status(500).json({ erro: err.message });
    }

    const sql = `SELECT * FROM mandespesas WHERE data >= ? AND data <= ?`;

    db.query(sql, [dataInicio, dataFim], (err, result) => {
      db.detach();
      if (err) {
        console.error('Erro na consulta:', err);
        return res.status(500).json({ erro: err.message });
      }
      
      res.json(result); 

    });
  });
});

module.exports = router;
