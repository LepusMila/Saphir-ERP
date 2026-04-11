# 💎 Saphir ERP - Gestão Integrada para Mineração

O **Saphir ERP** é uma solução robusta desenvolvida para o gerenciamento técnico e administrativo de operações de mineração. O sistema integra desde o controle de extração mineral até a gestão contábil, garantindo a integridade dos dados através de processos automatizados.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com uma stack moderna focada em performance e portabilidade:

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Ambiente:** [Node.js](https://nodejs.org/)
* **Framework:** [Express](https://expressjs.com/)
* **Banco de Dados:** [SQLite](https://www.sqlite.org/) (Portabilidade máxima)
* **ORM:** [Prisma 6](https://www.prisma.io/) (Modelagem e segurança de dados)
* **Hospedagem:** [Render](https://render.com/)

## 🛡️ Segurança e Integridade

O sistema foi desenhado sob o princípio de **Transações Atômicas**. Através do Prisma, garantimos que fluxos críticos (como a venda de minério) só sejam concluídos se todas as etapas (baixa de estoque, registro financeiro e logística) forem bem-sucedidas. Caso ocorra um erro em qualquer etapa, o sistema realiza um *rollback* automático.

## 📊 Módulos do Sistema

O Saphir ERP cobre os seguintes setores baseados em fluxogramas técnicos:

* **Extração:** Registro de local da mina, equipe e atualização automática de estoque.
* **Vendas & Logística:** Verificação de estoque, cálculo de totais e despacho para entrega.
* **Financeiro & Contábil:** Monitoramento de entradas/saídas e geração automática de DRE.
* **RH:** Gestão de contratações, desligamentos e emissão de contracheques integrados ao financeiro.

## Como Executar o Projeto
Siga os passos abaixo para configurar o ambiente de desenvolvimento em sua máquina:

1. Clonar o Repositório
Comece baixando o projeto para o seu computador:

```Bash
git clone https://github.com/SEU_USUARIO/saphir-erp.git
cd saphir-erp
```

2. Instalar Dependências
Instale todas as bibliotecas necessárias (Express, Prisma, TypeScript, etc.):

```
Bash
npm install
```

3. Configurar o Banco de Dados (Prisma)
Prepare o motor do banco de dados e sincronize as tabelas:

# Gera o cliente do Prisma (o "cérebro" das consultas)
```npx prisma generate```

# Cria o arquivo do banco SQLite e as tabelas
```npx prisma migrate dev --name init```

# (Opcional) Popula o banco com os dados iniciais, se houver seed
```npx prisma db seed```
4. Gerenciar Dados (Interface Visual)
Para visualizar e editar os dados de Clientes e Produtos manualmente:

```Bash
npx prisma studio
```

5. Iniciar o Servidor
Com o banco configurado, abra um novo terminal e ligue o Back-end:

```
Bash
npm run dev
```
   
