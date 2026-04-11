import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do Saphir ERP...');

  // ==================== USUÁRIOS ====================
  console.log('📝 Criando usuários...');
  
  const usuarios = await prisma.usuario.createMany({
    data: [
      {
        nome: 'Administrador Sistema',
        email: 'admin@saphirerp.com',
        senha: 'admin123' // Em produção, use hash!
      },
      {
        nome: 'Carlos Silva',
        email: 'carlos.silva@saphirerp.com',
        senha: 'senha123'
      },
      {
        nome: 'Ana Oliveira',
        email: 'ana.oliveira@saphirerp.com',
        senha: 'vendas123'
      },
      {
        nome: 'Roberto Santos',
        email: 'roberto.santos@saphirerp.com',
        senha: 'estoque123'
      },
      {
        nome: 'José Pereira',
        email: 'jose.pereira@saphirerp.com',
        senha: 'rh123'
      }
    ],
    skipDuplicates: true
  });

  // Buscar usuários criados
  const usuariosList = await prisma.usuario.findMany();
  const adminUser = usuariosList.find(u => u.email === 'admin@saphirerp.com');
  const carlosUser = usuariosList.find(u => u.email === 'carlos.silva@saphirerp.com');
  const anaUser = usuariosList.find(u => u.email === 'ana.oliveira@saphirerp.com');
  const joseUser = usuariosList.find(u => u.email === 'jose.pereira@saphirerp.com');

  // ==================== RH ====================
  console.log('👥 Criando RH e Funcionários...');
  
  const rh = await prisma.rh.create({
    data: {}
  });

  // Criar projetos primeiro
  const projetos = await prisma.projeto.createMany({
    data: [
      {
        nome: 'Expansão Mina Norte',
        status: 'EM_ANDAMENTO',
        dataInicio: new Date('2024-01-15')
      },
      {
        nome: 'Modernização Britadores',
        status: 'PLANEJADO',
        dataInicio: new Date('2024-03-01')
      },
      {
        nome: 'Implantação Sistema de Gestão',
        status: 'CONCLUIDO',
        dataInicio: new Date('2023-06-01'),
        dataFim: new Date('2023-12-20')
      }
    ],
    skipDuplicates: true
  });

  const projetosList = await prisma.projeto.findMany();
  
  // Criar funcionários com relação a usuários e projetos
  const funcionarios = await prisma.funcionario.createMany({
    data: [
      {
        cargo: 'Gerente de Mina',
        equipe: 'Operações',
        endereco: 'Rua das Minas, 123 - Belo Horizonte/MG',
        salario: 15000.00,
        usuarioId: carlosUser!.id,
        rhId: rh.id,
        projetoId: projetosList[0]?.id
      },
      {
        cargo: 'Analista de Vendas',
        equipe: 'Comercial',
        endereco: 'Av. Paulista, 500 - São Paulo/SP',
        salario: 7800.00,
        usuarioId: anaUser!.id,
        rhId: rh.id,
        projetoId: projetosList[2]?.id
      },
      {
        cargo: 'Coordenador de RH',
        equipe: 'Recursos Humanos',
        endereco: 'Rua dos Direitos, 45 - Belo Horizonte/MG',
        salario: 9500.00,
        usuarioId: joseUser!.id,
        rhId: rh.id,
        projetoId: projetosList[1]?.id
      }
    ],
    skipDuplicates: true
  });

  // ==================== CLIENTES ====================
  console.log('🏢 Criando clientes...');
  
  const clientes = await prisma.cliente.createMany({
    data: [
      {
        cpfCnpj: '33.750.098/0001-01',
        telefone: '(11) 3333-1000'
      },
      {
        cpfCnpj: '02.538.526/0001-80',
        telefone: '(31) 3222-9000'
      },
      {
        cpfCnpj: '60.894.730/0001-05',
        telefone: '(31) 3499-8000'
      },
      {
        cpfCnpj: '33.611.500/0001-91',
        telefone: '(51) 3323-2000'
      },
      {
        cpfCnpj: '60.763.111/0001-38',
        telefone: '(12) 3101-5000'
      }
    ],
    skipDuplicates: true
  });

  // Buscar clientes
  const clientesList = await prisma.cliente.findMany();
  
  // Adicionar CRM para clientes
  console.log('📊 Criando CRM para clientes...');
  
  for (const cliente of clientesList) {
    await prisma.crm.upsert({
      where: { clienteId: cliente.id },
      update: {},
      create: {
        historicoInteracoes: JSON.stringify([
          {
            data: new Date().toISOString(),
            tipo: 'CONTATO_INICIAL',
            observacao: 'Cliente cadastrado via seed do sistema'
          }
        ]),
        clienteId: cliente.id
      }
    });
  }

  // ==================== MINÉRIOS ====================
  console.log('⛏️ Criando minérios...');
  
  const minerios = await prisma.minerio.createMany({
    data: [
      {
        tipoMinerio: 'Minério de Ferro - Alta Pureza',
        pureza: 65.0
      },
      {
        tipoMinerio: 'Minério de Ferro - Médio Teor',
        pureza: 58.0
      },
      {
        tipoMinerio: 'Minério de Cobre',
        pureza: 40.0
      },
      {
        tipoMinerio: 'Minério de Ouro',
        pureza: 85.0
      }
    ],
    skipDuplicates: true
  });

  const mineriosList = await prisma.minerio.findMany();

  // ==================== PRODUTOS ====================
  console.log('📦 Criando produtos...');
  
  const produtos = await prisma.produto.createMany({
    data: [
      {
        nome: 'Minério de Ferro Premium',
        descricao: 'Minério de alta pureza para siderurgia',
        preco: 450.00,
        minerioId: mineriosList[0]?.id
      },
      {
        nome: 'Minério de Ferro Standard',
        descricao: 'Minério de médio teor',
        preco: 320.00,
        minerioId: mineriosList[1]?.id
      },
      {
        nome: 'Concentrado de Cobre',
        descricao: 'Minério de cobre concentrado',
        preco: 5200.00,
        minerioId: mineriosList[2]?.id
      },
      {
        nome: 'Pelotas de Minério',
        descricao: 'Pelotas sinterizadas para alto-forno',
        preco: 580.00
      }
    ],
    skipDuplicates: true
  });

  const produtosList = await prisma.produto.findMany();

  // ==================== EXTRAÇÕES ====================
  console.log('⛏️ Registrando extrações...');
  
  for (let i = 0; i < mineriosList.length; i++) {
    await prisma.extracao.createMany({
      data: [
        {
          quantidade: 5000,
          minerioId: mineriosList[i].id,
          data: new Date('2024-01-15')
        },
        {
          quantidade: 4500,
          minerioId: mineriosList[i].id,
          data: new Date('2024-01-30')
        },
        {
          quantidade: 6000,
          minerioId: mineriosList[i].id,
          data: new Date('2024-02-15')
        }
      ]
    });
  }

  // ==================== ESTOQUE ====================
  console.log('📦 Criando estoque...');
  
  const estoque = await prisma.estoque.create({
    data: {}
  });

  // Adicionar itens ao estoque
  for (const produto of produtosList) {
    const quantidadeInicial = produto.nome.includes('Ferro') ? 15000 : 
                              produto.nome.includes('Cobre') ? 8000 : 
                              produto.nome.includes('Pelotas') ? 10000 : 5000;
    
    await prisma.itemEstoque.create({
      data: {
        quantidade: quantidadeInicial,
        produtoId: produto.id,
        estoqueId: estoque.id
      }
    });
  }

  // ==================== VENDAS ====================
  console.log('💰 Criando vendas...');
  
  // Venda 1 - Vale S.A.
  const venda1 = await prisma.venda.create({
    data: {
      valorTotal: 450000.00,
      data: new Date('2024-01-20'),
      clienteId: clientesList[0].id
    }
  });

  await prisma.itemVenda.create({
    data: {
      quantidade: 1000,
      precoUnitario: 450.00,
      produtoId: produtosList[0].id,
      vendaId: venda1.id
    }
  });

  // Venda 2 - Anglo American
  const venda2 = await prisma.venda.create({
    data: {
      valorTotal: 640000.00,
      data: new Date('2024-02-10'),
      clienteId: clientesList[1].id
    }
  });

  await prisma.itemVenda.create({
    data: {
      quantidade: 2000,
      precoUnitario: 320.00,
      produtoId: produtosList[1].id,
      vendaId: venda2.id
    }
  });

  // Venda 3 - Usiminas
  const venda3 = await prisma.venda.create({
    data: {
      valorTotal: 1160000.00,
      data: new Date('2024-02-25'),
      clienteId: clientesList[2].id
    }
  });

  await prisma.itemVenda.create({
    data: {
      quantidade: 2000,
      precoUnitario: 580.00,
      produtoId: produtosList[3].id,
      vendaId: venda3.id
    }
  });

  // ==================== LOGÍSTICA ====================
  console.log('🚛 Criando logística...');
  
  await prisma.logistica.createMany({
    data: [
      {
        statusEntrega: 'ENTREGUE',
        enderecoEntrega: 'Av. Paulista, 1000 - São Paulo/SP',
        vendaId: venda1.id
      },
      {
        statusEntrega: 'EM_TRANSITO',
        enderecoEntrega: 'Rua Minas Gerais, 500 - Belo Horizonte/MG',
        vendaId: venda2.id
      },
      {
        statusEntrega: 'PENDENTE',
        enderecoEntrega: 'Av. do Contorno, 6594 - Belo Horizonte/MG',
        vendaId: venda3.id
      }
    ]
  });

  // ==================== COMPRAS ====================
  console.log('🛒 Criando compras...');
  
  const compra1 = await prisma.compra.create({
    data: {
      valorTotal: 180000.00,
      data: new Date('2024-01-05')
    }
  });

  await prisma.itemCompra.create({
    data: {
      quantidade: 1000,
      precoUnitario: 180.00,
      produtoId: produtosList[2]?.id || produtosList[0].id,
      compraId: compra1.id
    }
  });

  // ==================== FINANCEIRO ====================
  console.log('💰 Criando registros financeiros...');
  
  await prisma.financeiro.createMany({
    data: [
      {
        tipo: 'entrada',
        valor: 450000.00,
        data: new Date('2024-01-20')
      },
      {
        tipo: 'entrada',
        valor: 640000.00,
        data: new Date('2024-02-10')
      },
      {
        tipo: 'entrada',
        valor: 1160000.00,
        data: new Date('2024-02-25')
      },
      {
        tipo: 'saida',
        valor: 150000.00,
        data: new Date('2024-01-31')
      },
      {
        tipo: 'saida',
        valor: 120000.00,
        data: new Date('2024-01-15')
      },
      {
        tipo: 'saida',
        valor: 180000.00,
        data: new Date('2024-01-05')
      },
      {
        tipo: 'saida',
        valor: 85000.00,
        data: new Date('2024-02-28')
      }
    ]
  });

  // ==================== CONTÁBIL ====================
  console.log('📊 Criando registros contábeis...');
  
  await prisma.contabil.createMany({
    data: [
      {
        tipoRelatorio: 'DRE_MENSAL',
        data: new Date('2024-01-31')
      },
      {
        tipoRelatorio: 'BALANCETE',
        data: new Date('2024-02-29')
      },
      {
        tipoRelatorio: 'DRE_TRIMESTRAL',
        data: new Date('2024-03-31')
      }
    ]
  });

  // ==================== LOGS ====================
  console.log('📝 Criando logs do sistema...');
  
  await prisma.log.createMany({
    data: [
      {
        tipo: 'SISTEMA',
        desc: 'Sistema inicializado',
        usuarioId: adminUser?.id
      },
      {
        tipo: 'VENDA',
        desc: `Venda #${venda1.id} criada para cliente ${clientesList[0].cpfCnpj}`,
        usuarioId: anaUser?.id
      },
      {
        tipo: 'ESTOQUE',
        desc: 'Atualização de estoque realizada',
        usuarioId: carlosUser?.id
      },
      {
        tipo: 'FINANCEIRO',
        desc: 'Registros financeiros importados',
        usuarioId: adminUser?.id
      }
    ]
  });

  console.log('✅ Seed concluído com sucesso!');
  
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
    compras: await prisma.compra.count(),
    financeiro: await prisma.financeiro.count(),
    logs: await prisma.log.count()
  };
  
  console.log('\n📊 Estatísticas do sistema:');
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