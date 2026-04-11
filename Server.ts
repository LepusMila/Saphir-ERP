import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// ==========================================
// 1. MÓDULO DE AUTENTICAÇÃO
// ==========================================
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (usuario && usuario.senha === senha) {
        res.json({ mensagem: "Login realizado com sucesso!", usuario: { nome: usuario.nome, email: usuario.email, id: usuario.id } });
    } else {
        res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }
});

// ==========================================
// 2. MÓDULO DE VENDAS
// ==========================================
app.post('/vendas', async (req, res) => {
    const { clienteId, produtoId, quantidade } = req.body;
    try {
        const resultado = await prisma.$transaction(async (tx) => {
            // Buscar produto e estoque
            const produto = await tx.produto.findUnique({
                where: { id: Number(produtoId) }
            });
            
            if (!produto) {
                throw new Error("Produto não encontrado!");
            }
            
            const estoque = await tx.itemEstoque.findFirst({
                where: { 
                    produtoId: Number(produtoId),
                    estoque: { id: { not: undefined } }
                }
            });

            if (!estoque || estoque.quantidade < quantidade) {
                throw new Error("Quantidade insuficiente em estoque!");
            }

            const total = produto.preco * quantidade;
            
            // Criar venda
            const venda = await tx.venda.create({
                data: {
                    valorTotal: total,
                    clienteId: Number(clienteId),
                }
            });
            
            // Criar item da venda
            await tx.itemVenda.create({
                data: {
                    quantidade: Number(quantidade),
                    precoUnitario: produto.preco,
                    produtoId: Number(produtoId),
                    vendaId: venda.id
                }
            });

            // Atualizar estoque
            await tx.itemEstoque.update({
                where: { id: estoque.id },
                data: { quantidade: { decrement: Number(quantidade) } }
            });

            // Registrar no financeiro
            await tx.financeiro.create({
                data: { 
                    tipo: "entrada", 
                    valor: total,
                    data: new Date()
                }
            });
            
            // Registrar log
            await tx.log.create({
                data: {
                    tipo: "VENDA",
                    desc: `Venda #${venda.id} criada - Total: R$ ${total}`,
                    usuarioId: req.body.usuarioId
                }
            });

            // Criar logística
            await tx.logistica.create({
                data: {
                    statusEntrega: "PENDENTE",
                    enderecoEntrega: "A definir",
                    vendaId: venda.id
                }
            });

            return venda;
        });
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
});

// ==========================================
// 3. MÓDULO DE EXTRAÇÃO
// ==========================================
app.post('/extracao', async (req, res) => {
    const { minerioId, quantidade, produtoId } = req.body;
    try {
        const registro = await prisma.$transaction(async (tx) => {
            // Registrar extração
            const extracao = await tx.extracao.create({
                data: {
                    quantidade: Number(quantidade),
                    minerioId: Number(minerioId)
                }
            });
            
            // Buscar ou criar produto relacionado ao minério
            let produto = await tx.produto.findFirst({
                where: { minerioId: Number(minerioId) }
            });
            
            if (!produto && produtoId) {
                produto = await tx.produto.findUnique({
                    where: { id: Number(produtoId) }
                });
            }
            
            if (produto) {
                // Atualizar estoque
                const estoque = await tx.estoque.findFirst();
                if (estoque) {
                    const itemEstoque = await tx.itemEstoque.findFirst({
                        where: { produtoId: produto.id, estoqueId: estoque.id }
                    });
                    
                    if (itemEstoque) {
                        await tx.itemEstoque.update({
                            where: { id: itemEstoque.id },
                            data: { quantidade: { increment: Number(quantidade) } }
                        });
                    } else {
                        await tx.itemEstoque.create({
                            data: {
                                quantidade: Number(quantidade),
                                produtoId: produto.id,
                                estoqueId: estoque.id
                            }
                        });
                    }
                }
            }
            
            // Registrar log
            await tx.log.create({
                data: {
                    tipo: "EXTRACAO",
                    desc: `Extração de ${quantidade} toneladas do minério ID ${minerioId}`,
                    usuarioId: req.body.usuarioId
                }
            });
            
            return extracao;
        });
        res.json({ mensagem: "Extração registrada com sucesso!", registro });
    } catch (e) {
        res.status(400).json({ erro: "Erro ao processar extração." });
    }
});

// ==========================================
// 4. MÓDULO DE COMPRAS
// ==========================================
app.post('/compras', async (req, res) => {
    const { produtoId, quantidade, precoUnitario } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            const total = precoUnitario * quantidade;
            
            // Criar compra
            const compra = await tx.compra.create({
                data: {
                    valorTotal: total,
                    data: new Date()
                }
            });
            
            // Criar item da compra
            await tx.itemCompra.create({
                data: {
                    quantidade: Number(quantidade),
                    precoUnitario: Number(precoUnitario),
                    produtoId: Number(produtoId),
                    compraId: compra.id
                }
            });
            
            // Atualizar estoque
            const estoque = await tx.estoque.findFirst();
            if (estoque) {
                const itemEstoque = await tx.itemEstoque.findFirst({
                    where: { produtoId: Number(produtoId), estoqueId: estoque.id }
                });
                
                if (itemEstoque) {
                    await tx.itemEstoque.update({
                        where: { id: itemEstoque.id },
                        data: { quantidade: { increment: Number(quantidade) } }
                    });
                } else {
                    await tx.itemEstoque.create({
                        data: {
                            quantidade: Number(quantidade),
                            produtoId: Number(produtoId),
                            estoqueId: estoque.id
                        }
                    });
                }
            }
            
            // Registrar no financeiro (saída)
            await tx.financeiro.create({
                data: { 
                    tipo: "saida", 
                    valor: total,
                    data: new Date()
                }
            });
            
            // Registrar log
            await tx.log.create({
                data: {
                    tipo: "COMPRA",
                    desc: `Compra de ${quantidade} unidades do produto ID ${produtoId} - Total: R$ ${total}`,
                    usuarioId: req.body.usuarioId
                }
            });
        });
        res.json({ mensagem: "Compra realizada com sucesso!" });
    } catch (e) {
        res.status(400).json({ erro: "Erro na compra." });
    }
});

// ==========================================
// 5. MÓDULO DE RH
// ==========================================
app.post('/rh/contratar', async (req, res) => {
    const { nome, email, senha, cargo, equipe, salario, endereco } = req.body;
    try {
        const resultado = await prisma.$transaction(async (tx) => {
            // Criar usuário
            const usuario = await tx.usuario.create({
                data: {
                    nome,
                    email,
                    senha
                }
            });
            
            // Buscar RH existente ou criar
            let rh = await tx.rh.findFirst();
            if (!rh) {
                rh = await tx.rh.create({ data: {} });
            }
            
            // Criar funcionário
            const funcionario = await tx.funcionario.create({
                data: {
                    cargo,
                    equipe,
                    salario: Number(salario),
                    endereco,
                    usuarioId: usuario.id,
                    rhId: rh.id
                }
            });
            
            // Registrar log
            await tx.log.create({
                data: {
                    tipo: "RH",
                    desc: `Funcionário ${nome} contratado para o cargo de ${cargo}`,
                    usuarioId: req.body.usuarioId
                }
            });
            
            return funcionario;
        });
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
});

app.post('/rh/pagamento/:id', async (req, res) => {
    const func = await prisma.funcionario.findUnique({ 
        where: { id: Number(req.params.id) },
        include: { usuario: true }
    });
    
    if (func) {
        await prisma.$transaction(async (tx) => {
            await tx.financeiro.create({
                data: { 
                    tipo: "saida", 
                    valor: func.salario,
                    data: new Date()
                }
            });
            
            await tx.log.create({
                data: {
                    tipo: "FOLHA_PAGAMENTO",
                    desc: `Pagamento de salário para ${func.usuario.nome} - R$ ${func.salario}`,
                    usuarioId: req.body.usuarioId
                }
            });
        });
        res.json({ mensagem: "Folha de pagamento processada com sucesso." });
    } else {
        res.status(404).json({ erro: "Funcionário não encontrado." });
    }
});

// ==========================================
// 6. MÓDULO FINANCEIRO & CONTÁBIL
// ==========================================
app.get('/contabil/dre', async (req, res) => {
    const movimentacoes = await prisma.financeiro.findMany();
    const entradas = movimentacoes.filter(m => m.tipo === "entrada").reduce((acc, m) => acc + m.valor, 0);
    const saidas = movimentacoes.filter(m => m.tipo === "saida").reduce((acc, m) => acc + m.valor, 0);

    res.json({
        relatorio: "DRE - Demonstrativo de Resultados",
        periodo: "Até a data atual",
        receitaBruta: entradas,
        despesas: saidas,
        lucroLiquido: entradas - saidas,
        margemLucro: ((entradas - saidas) / entradas * 100).toFixed(2) + "%"
    });
});

app.get('/financeiro/extrato', async (req, res) => {
    const movimentacoes = await prisma.financeiro.findMany({
        orderBy: { data: 'desc' }
    });
    res.json(movimentacoes);
});

// ==========================================
// 7. MÓDULO DE ESTOQUE
// ==========================================
app.get('/estoque', async (req, res) => {
    const itens = await prisma.itemEstoque.findMany({
        include: { 
            produto: {
                include: {
                    minerio: true
                }
            }
        }
    });
    res.json(itens);
});

app.get('/estoque/baixo', async (req, res) => {
    const limite = Number(req.query.limite) || 1000;
    const itensBaixos = await prisma.itemEstoque.findMany({
        where: {
            quantidade: { lt: limite }
        },
        include: { produto: true }
    });
    res.json(itensBaixos);
});

// ==========================================
// 8. MÓDULO DE LOGÍSTICA
// ==========================================
app.get('/logistica/entregas', async (req, res) => {
    const entregas = await prisma.logistica.findMany({
        include: {
            venda: {
                include: {
                    cliente: true,
                    itens: {
                        include: { produto: true }
                    }
                }
            }
        }
    });
    res.json(entregas);
});

app.put('/logistica/atualizar/:id', async (req, res) => {
    const { statusEntrega } = req.body;
    try {
        const logistica = await prisma.logistica.update({
            where: { id: Number(req.params.id) },
            data: { statusEntrega }
        });
        res.json(logistica);
    } catch (error) {
        res.status(404).json({ erro: "Registro de logística não encontrado." });
    }
});

// ==========================================
// 9. RELATÓRIOS E DASHBOARD
// ==========================================
app.get('/dashboard/resumo', async (req, res) => {
    const [
        totalClientes,
        totalProdutos,
        totalFuncionarios,
        totalVendas,
        vendasUltimoMes,
        estoqueTotal
    ] = await Promise.all([
        prisma.cliente.count(),
        prisma.produto.count(),
        prisma.funcionario.count(),
        prisma.venda.count(),
        prisma.venda.count({
            where: {
                data: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
            }
        }),
        prisma.itemEstoque.aggregate({
            _sum: { quantidade: true }
        })
    ]);
    
    const financeiro = await prisma.financeiro.findMany();
    const receitaTotal = financeiro.filter(f => f.tipo === "entrada").reduce((acc, f) => acc + f.valor, 0);
    const despesaTotal = financeiro.filter(f => f.tipo === "saida").reduce((acc, f) => acc + f.valor, 0);
    
    res.json({
        clientes: totalClientes,
        produtos: totalProdutos,
        funcionarios: totalFuncionarios,
        vendas: {
            total: totalVendas,
            ultimoMes: vendasUltimoMes
        },
        estoque: {
            totalItens: estoqueTotal._sum.quantidade || 0
        },
        financeiro: {
            receitaTotal,
            despesaTotal,
            saldo: receitaTotal - despesaTotal
        }
    });
});

// ==========================================
// 10. LOGS DO SISTEMA
// ==========================================
app.get('/logs', async (req, res) => {
    const logs = await prisma.log.findMany({
        take: 100,
        orderBy: { data: 'desc' },
        include: { usuario: true }
    });
    res.json(logs);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Saphir ERP rodando na porta ${PORT}`);
    console.log(`📊 Dashboard disponível em: http://localhost:${PORT}/dashboard/resumo`);
});