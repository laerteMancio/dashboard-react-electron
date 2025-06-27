// backend/backend.js
const express = require('express');
const cors = require('cors');
const despesasRoutes = require('./routes/despesas.js');
const tanquesRoutes = require('./routes/tanques.js');

const app = express();
app.use(cors());
app.use(express.json());




app.use('/despesas', despesasRoutes);
app.use('/tanques', tanquesRoutes);

const port = 3001;
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
