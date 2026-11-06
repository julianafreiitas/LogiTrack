const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// CADASTRAR
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    res.status(201).json({ id: resultado.insertId, mensagem: 'Usuário cadastrado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ENTRAR (LOGIN)
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const [rows] = await db.query(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ? AND ativo = TRUE',
      [email]
    );
    const usuario = rows[0];

    // Mesma mensagem para e-mail inexistente ou senha errada
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ESQUECEU A SENHA
router.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: 'Informe o e-mail.' });
    }

    const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ? AND ativo = TRUE', [email]);

    if (rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      await db.query(
        'INSERT INTO recuperacao_senha (usuario_id, token, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
        [rows[0].id, token]
      );
      // Sem envio de e-mail por enquanto: o link aparece no terminal
      console.log(`Link de recuperação: ${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`);
    }

    // Resposta igual exista ou não o e-mail
    res.json({ mensagem: 'Se o e-mail existir, enviaremos as instruções de recuperação.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// REDEFINIR SENHA
router.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'Token e nova senha (mín. 6 caracteres) são obrigatórios.' });
    }

    const [rows] = await db.query(
      'SELECT id, usuario_id FROM recuperacao_senha WHERE token = ? AND usado = FALSE AND expira_em > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ erro: 'Token inválido ou expirado.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await db.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senhaHash, rows[0].usuario_id]);
    await db.query('UPDATE recuperacao_senha SET usado = TRUE WHERE id = ?', [rows[0].id]);

    res.json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

module.exports = router;
