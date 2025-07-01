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
   const { dataConta } = req.query;

  if (!dataConta) {
    return res.status(400).json({ erro: "A data é obrigatória" });
  }

  Firebird.attach(firebirdOptions, (err, db) => {
    if (err) {
      console.error('Erro na conexão com o banco de dados:', err);
      return res.status(500).json({ erro: "Erro de conexão com o banco de dados" });
    }

    const sql = `SELECT cod_titulo, valor, descricao  FROM MANCONTASAPAGAR where datavencimento = ?`;

    db.query(sql, [dataConta], (err, result) => {
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
