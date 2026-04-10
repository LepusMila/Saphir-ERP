import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// ==========================================
// 1. MÓDULO DE AUTENTICAÇÃO (fluxogramaSaphir_Login)
// ==========================================
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (usuario && usuario.senha === senha) {
        res.json({ mensagem: "Login realizado com sucesso!", usuario: { nome: usuario.nome, email: usuario.email } });
    } else {
        res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }
});

// ==========================================
// 2. MÓDULO DE VENDAS & LOGÍSTICA (fluxoVendas e fluxoLogistica)
// ==========================================
app.post('/vendas', async (req, res) => {
    const { clienteId, produtoId, quantidade } = req.body;
    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const estoque = await tx.itemEstoque.findFirst({
                where: { produtoId: Number(produtoId) },
                include: { produto: true }
            });

            if (!estoque || estoque.quantidade < quantidade) {
                throw new Error("Quantidade insuficiente em estoque!");
            }

            const total = estoque.produto.preco * quantidade;
            const venda = await tx.venda.create({
                data: {
                    clienteId: Number(clienteId),
                    valorTotal: total,
                    itens: { create: { produtoId: Number(produtoId), quantidade, precoUnitario: estoque.produto.preco } }
                }
            });

            await tx.itemEstoque.update({
                where: { id: estoque.id },
                data: { quantidade: { decrement: quantidade } }
            });

            await tx.financeiro.create({
                data: { tipo: "ENTRADA", valor: total, descricao: `Venda #${venda.id}` }
            });

            await tx.logistica.create({
                data: { vendaId: venda.id, statusEntrega: "EM_ANDAMENTO" }
            });

            return venda;
        });
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
});

// ==========================================
// 3. MÓDULO DE EXTRAÇÃO (fluxoExtracao)
// ==========================================
app.post('/extracao', async (req, res) => {
    const { produtoId, quantidade, equipe, local } = req.body;
    try {
        const registro = await prisma.$transaction(async (tx) => {
            const extrair = await tx.minerio.create({
                data: { 
                    tipoMinerio: "Bruto", 
                    pureza: 100, 
                    produtos: { connect: { id: Number(produtoId) } } 
                }
            });
            await tx.itemEstoque.updateMany({
                where: { produtoId: Number(produtoId) },
                data: { quantidade: { increment: Number(quantidade) } }
            });
            return extrair;
        });
        res.json({ mensagem: "Extração concluída e estoque atualizado!", registro });
    } catch (e) {
        res.status(400).json({ erro: "Erro ao registrar extração." });
    }
});

// ==========================================
// 4. MÓDULO DE COMPRAS (fluxoCompras)
// ==========================================
app.post('/compras', async (req, res) => {
    const { produtoId, quantidade, precoCusto } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.itemEstoque.updateMany({
                where: { produtoId: Number(produtoId) },
                data: { quantidade: { increment: Number(quantidade) } }
            });
            await tx.financeiro.create({
                data: { tipo: "SAIDA", valor: precoCusto * quantidade, descricao: "Compra de Insumos" }
            });
        });
        res.json({ mensagem: "Compra realizada!" });
    } catch (e) {
        res.status(400).json({ erro: "Erro na compra." });
    }
});

// ==========================================
// 5. MÓDULO DE RH (fluxoRH)
// ==========================================
app.post('/rh/contratar', async (req, res) => {
    const { nome, cargo, salario } = req.body;
    const funcionario = await prisma.funcionario.create({
        data: { nome, cargo, salario, status: "ATIVO" }
    });
    res.json(funcionario);
});

app.post('/rh/pagamento/:id', async (req, res) => {
    const func = await prisma.funcionario.findUnique({ where: { id: Number(req.params.id) } });
    if (func) {
        await prisma.financeiro.create({
            data: { tipo: "SAIDA", valor: func.salario, descricao: `Salário: ${func.nome}` }
        });
        res.json({ mensagem: "Folha de pagamento enviada ao financeiro." });
    }
});

// ==========================================
// 6. MÓDULO FINANCEIRO & CONTÁBIL (fluxoFinanceiro e fluxoContabil)
// ==========================================
app.get('/contabil/dre', async (req, res) => {
    const mov = await prisma.financeiro.findMany();
    const entradas = mov.filter(m => m.tipo === "ENTRADA").reduce((acc, m) => acc + m.valor, 0);
    const saidas = mov.filter(m => m.tipo === "SAIDA").reduce((acc, m) => acc + m.valor, 0);

    res.json({
        relatorio: "DRE - Demonstrativo de Resultados",
        receitaBruta: entradas,
        despesas: saidas,
        lucroLiquido: entradas - saidas
    });
});

// ==========================================
// 7. MÓDULO DE ESTOQUE (fluxoEstoque)
// ==========================================
app.get('/estoque', async (req, res) => {
    const itens = await prisma.itemEstoque.findMany({ include: { produto: true } });
    res.json(itens);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Saphir ERP rodando na porta ${PORT}`);
});