import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do Saphir ERP...');

  // ==================== USUÁRIOS ====================
  console.log('📝 Criando usuários...');
  
  // Verificar se usuários já existem
  const existingUsers = await prisma.usuario.findMany();
  const existingEmails = existingUsers.map(u => u.email);
  
  const usuariosParaCriar = [
    { nome: 'Administrador Sistema', email: 'admin@saphirerp.com', senha: 'admin123' },
    { nome: 'Carlos Silva', email: 'carlos.silva@saphirerp.com', senha: 'senha123' },
    { nome: 'Ana Oliveira', email: 'ana.oliveira@saphirerp.com', senha: 'vendas123' },
    { nome: 'Roberto Santos', email: 'roberto.santos@saphirerp.com', senha: 'estoque123' },
    { nome: 'José Pereira', email: 'jose.pereira@saphirerp.com', senha: 'rh123' }
  ].filter(u => !existingEmails.includes(u.email));
  
  for (const usuario of usuariosParaCriar) {
    await prisma.usuario.create({ data: usuario });
  }
  console.log(`✅ ${usuariosParaCriar.length} usuários criados`);

  // Buscar usuários criados
  const usuariosList = await prisma.usuario.findMany();
  const adminUser = usuariosList.find(u => u.email === 'admin@saphirerp.com');
  const carlosUser = usuariosList.find(u => u.email === 'carlos.silva@saphirerp.com');
  const anaUser = usuariosList.find(u => u.email === 'ana.oliveira@saphirerp.com');
  const joseUser = usuariosList.find(u => u.email === 'jose.pereira@saphirerp.com');

  // ==================== RH ====================
  console.log('👥 Criando RH e Funcionários...');
  
  let rh = await prisma.rh.findFirst();
  if (!rh) {
    rh = await prisma.rh.create({ data: {} });
  }

  // Criar projetos
  const projetosExistentes = await prisma.projeto.findMany();
  if (projetosExistentes.length === 0) {
    await prisma.projeto.createMany({
      data: [
        { nome: 'Expansão Mina Norte', status: 'EM_ANDAMENTO', dataInicio: new Date('2024-01-15') },
        { nome: 'Modernização Britadores', status: 'PLANEJADO', dataInicio: new Date('2024-03-01') },
        { nome: 'Implantação Sistema de Gestão', status: 'CONCLUIDO', dataInicio: new Date('2023-06-01'), dataFim: new Date('2023-12-20') }
      ]
    });
  }

  const projetosList = await prisma.projeto.findMany();
  
  // Criar funcionários
  const funcionariosExistentes = await prisma.funcionario.findMany();
  if (funcionariosExistentes.length === 0 && carlosUser && anaUser && joseUser) {
    await prisma.funcionario.createMany({
      data: [
        { cargo: 'Gerente de Mina', equipe: 'Operações', endereco: 'Rua das Minas, 123 - BH/MG', salario: 15000, usuarioId: carlosUser.id, rhId: rh.id, projetoId: projetosList[0]?.id },
        { cargo: 'Analista de Vendas', equipe: 'Comercial', endereco: 'Av. Paulista, 500 - SP', salario: 7800, usuarioId: anaUser.id, rhId: rh.id, projetoId: projetosList[2]?.id },
        { cargo: 'Coordenador de RH', equipe: 'Recursos Humanos', endereco: 'Rua dos Direitos, 45 - BH/MG', salario: 9500, usuarioId: joseUser.id, rhId: rh.id, projetoId: projetosList[1]?.id }
      ]
    });
  }

  // ==================== CLIENTES ====================
  console.log('🏢 Criando clientes...');
  
  const clientesExistentes = await prisma.cliente.findMany();
  if (clientesExistentes.length === 0) {
    await prisma.cliente.createMany({
      data: [
        { cpfCnpj: '33.750.098/0001-01', telefone: '(11) 3333-1000' },
        { cpfCnpj: '02.538.526/0001-80', telefone: '(31) 3222-9000' },
        { cpfCnpj: '60.894.730/0001-05', telefone: '(31) 3499-8000' },
        { cpfCnpj: '33.611.500/0001-91', telefone: '(51) 3323-2000' },
        { cpfCnpj: '60.763.111/0001-38', telefone: '(12) 3101-5000' }
      ]
    });
  }

  // Buscar clientes
  const clientesList = await prisma.cliente.findMany();
  
  // Adicionar CRM para clientes
  console.log('📊 Criando CRM para clientes...');
  
  for (const cliente of clientesList) {
    const crmExistente = await prisma.crm.findUnique({ where: { clienteId: cliente.id } });
    if (!crmExistente) {
      await prisma.crm.create({
        data: {
          historicoInteracoes: JSON.stringify([{ data: new Date().toISOString(), tipo: 'CONTATO_INICIAL', observacao: 'Cliente cadastrado via seed' }]),
          clienteId: cliente.id
        }
      });
    }
  }

  // ==================== MINÉRIOS ====================
  console.log('⛏️ Criando minérios...');
  
  const mineriosExistentes = await prisma.minerio.findMany();
  if (mineriosExistentes.length === 0) {
    await prisma.minerio.createMany({
      data: [
        { tipoMinerio: 'Minério de Ferro - Alta Pureza', pureza: 65.0 },
        { tipoMinerio: 'Minério de Ferro - Médio Teor', pureza: 58.0 },
        { tipoMinerio: 'Minério de Cobre', pureza: 40.0 },
        { tipoMinerio: 'Minério de Ouro', pureza: 85.0 }
      ]
    });
  }

  const mineriosList = await prisma.minerio.findMany();

  // ==================== PRODUTOS ====================
  console.log('📦 Criando produtos...');
  
  const produtosExistentes = await prisma.produto.findMany();
  if (produtosExistentes.length === 0) {
    await prisma.produto.createMany({
      data: [
        { nome: 'Minério de Ferro Premium', descricao: 'Minério de alta pureza', preco: 450.00, minerioId: mineriosList[0]?.id },
        { nome: 'Minério de Ferro Standard', descricao: 'Minério de médio teor', preco: 320.00, minerioId: mineriosList[1]?.id },
        { nome: 'Concentrado de Cobre', descricao: 'Minério de cobre', preco: 5200.00, minerioId: mineriosList[2]?.id },
        { nome: 'Pelotas de Minério', descricao: 'Pelotas sinterizadas', preco: 580.00, minerioId: null }
      ]
    });
  }

  const produtosList = await prisma.produto.findMany();

  // ==================== EXTRAÇÕES ====================
  console.log('⛏️ Registrando extrações...');
  
  const extracoesExistentes = await prisma.extracao.findMany();
  if (extracoesExistentes.length === 0) {
    for (const minerio of mineriosList) {
      await prisma.extracao.createMany({
        data: [
          { quantidade: 5000, minerioId: minerio.id, data: new Date('2024-01-15') },
          { quantidade: 4500, minerioId: minerio.id, data: new Date('2024-01-30') },
          { quantidade: 6000, minerioId: minerio.id, data: new Date('2024-02-15') }
        ]
      });
    }
  }

  // ==================== ESTOQUE ====================
  console.log('📦 Criando estoque...');
  
  let estoque = await prisma.estoque.findFirst();
  if (!estoque) {
    estoque = await prisma.estoque.create({ data: {} });
  }

  // Adicionar itens ao estoque
  const itensEstoqueExistentes = await prisma.itemEstoque.findMany();
  if (itensEstoqueExistentes.length === 0) {
    for (const produto of produtosList) {
      const quantidadeInicial = produto.nome.includes('Ferro') ? 15000 : produto.nome.includes('Cobre') ? 8000 : produto.nome.includes('Pelotas') ? 10000 : 5000;
      await prisma.itemEstoque.create({
        data: { quantidade: quantidadeInicial, produtoId: produto.id, estoqueId: estoque.id }
      });
    }
  }

  // ==================== VENDAS ====================
  console.log('💰 Criando vendas...');
  
  const vendasExistentes = await prisma.venda.findMany();
  if (vendasExistentes.length === 0 && clientesList.length > 0 && produtosList.length > 0) {
    // Venda 1
    const venda1 = await prisma.venda.create({
      data: { valorTotal: 450000.00, data: new Date('2024-01-20'), clienteId: clientesList[0].id }
    });
    await prisma.itemVenda.create({ data: { quantidade: 1000, precoUnitario: 450.00, produtoId: produtosList[0].id, vendaId: venda1.id } });

    // Venda 2
    const venda2 = await prisma.venda.create({
      data: { valorTotal: 640000.00, data: new Date('2024-02-10'), clienteId: clientesList[1].id }
    });
    await prisma.itemVenda.create({ data: { quantidade: 2000, precoUnitario: 320.00, produtoId: produtosList[1].id, vendaId: venda2.id } });

    // Venda 3
    const venda3 = await prisma.venda.create({
      data: { valorTotal: 1160000.00, data: new Date('2024-02-25'), clienteId: clientesList[2].id }
    });
    await prisma.itemVenda.create({ data: { quantidade: 2000, precoUnitario: 580.00, produtoId: produtosList[3].id, vendaId: venda3.id } });

    // ==================== LOGÍSTICA ====================
    console.log('🚛 Criando logística...');
    await prisma.logistica.createMany({
      data: [
        { statusEntrega: 'ENTREGUE', enderecoEntrega: 'Av. Paulista, 1000 - SP', vendaId: venda1.id },
        { statusEntrega: 'EM_TRANSITO', enderecoEntrega: 'Rua Minas Gerais, 500 - BH', vendaId: venda2.id },
        { statusEntrega: 'PENDENTE', enderecoEntrega: 'Av. do Contorno, 6594 - BH', vendaId: venda3.id }
      ]
    });
  }

  // ==================== FINANCEIRO ====================
  console.log('💰 Criando registros financeiros...');
  
  const financeiroExistentes = await prisma.financeiro.findMany();
  if (financeiroExistentes.length === 0) {
    await prisma.financeiro.createMany({
      data: [
        { tipo: 'entrada', valor: 450000.00, data: new Date('2024-01-20') },
        { tipo: 'entrada', valor: 640000.00, data: new Date('2024-02-10') },
        { tipo: 'entrada', valor: 1160000.00, data: new Date('2024-02-25') },
        { tipo: 'saida', valor: 150000.00, data: new Date('2024-01-31') },
        { tipo: 'saida', valor: 120000.00, data: new Date('2024-01-15') },
        { tipo: 'saida', valor: 85000.00, data: new Date('2024-02-28') }
      ]
    });
  }

  // ==================== CONTÁBIL ====================
  console.log('📊 Criando registros contábeis...');
  
  const contabilExistentes = await prisma.contabil.findMany();
  if (contabilExistentes.length === 0) {
    await prisma.contabil.createMany({
      data: [
        { tipoRelatorio: 'DRE_MENSAL', data: new Date('2024-01-31') },
        { tipoRelatorio: 'BALANCETE', data: new Date('2024-02-29') },
        { tipoRelatorio: 'DRE_TRIMESTRAL', data: new Date('2024-03-31') }
      ]
    });
  }

  // ==================== LOGS ====================
  console.log('📝 Criando logs do sistema...');
  
  const logsExistentes = await prisma.log.findMany();
  if (logsExistentes.length === 0 && adminUser) {
    await prisma.log.createMany({
      data: [
        { tipo: 'SISTEMA', desc: 'Sistema inicializado', usuarioId: adminUser.id },
        { tipo: 'VENDA', desc: 'Primeiras vendas registradas', usuarioId: adminUser.id },
        { tipo: 'ESTOQUE', desc: 'Estoque inicial configurado', usuarioId: adminUser.id }
      ]
    });
  }

  // Estatísticas finais
  const stats = {
    usuarios: await prisma.usuario.count(),
    funcionarios: await prisma.funcionario.count(),
    clientes: await prisma.cliente.count(),
    projetos: await prisma.projeto.count(),
    minerios: await prisma.minerio.count(),
    produtos: await prisma.produto.count(),
    extracoes: await prisma.extracao.count(),
    vendas: await prisma.venda.count(),
    financeiro: await prisma.financeiro.count()
  };
  
  console.log('\n✅ Seed concluído com sucesso!');
  console.table(stats);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });