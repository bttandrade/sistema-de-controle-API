const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const serviceAccount = require('./admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Obter todos os clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientesRef = db.collection('clientes');
    const snapshot = await clientesRef.get();
    const clientes = [];
    snapshot.forEach(doc => {
      clientes.push({ id: doc.id, ...doc.data() });
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao obter clientes:', error);
    res.status(500).send('Erro ao obter clientes.');
  }
});

// Obter um único cliente por ID
app.get('/clientes/:id', async (req, res) => {
  try {
    const clienteId = req.params.id;
    const clienteDoc = await db.collection('clientes').doc(clienteId).get();
    if (!clienteDoc.exists) {
      return res.status(404).send('Cliente não encontrado.');
    }
    const clienteData = clienteDoc.data();
    res.json({ id: clienteId, ...clienteData });
  } catch (error) {
    console.error('Erro ao obter cliente por ID:', error);
    res.status(500).send('Erro ao obter cliente por ID.');
  }
});

// Adicionar um novo cliente
app.post('/clientes', async (req, res) => {
  try {
    const novoCliente = req.body;
    await db.collection('clientes').add(novoCliente);
    res.status(201).send('Cliente adicionado com sucesso.');
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    res.status(500).send('Erro ao adicionar cliente.');
  }
});

// Atualizar um cliente existente
app.put('/clientes/:id', async (req, res) => {
  try {
    const clienteId = req.params.id;
    const novosDados = req.body;
    await db.collection('clientes').doc(clienteId).set(novosDados, { merge: true });
    res.send('Cliente atualizado com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).send('Erro ao atualizar cliente.');
  }
});

// Excluir um cliente
app.delete('/clientes/:id', async (req, res) => {
  try {
    const clienteId = req.params.id;
    await db.collection('clientes').doc(clienteId).delete();
    res.send('Cliente excluído com sucesso.');
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).send('Erro ao excluir cliente.');
  }
});

const PORT = process.env.PORT || 6666;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
