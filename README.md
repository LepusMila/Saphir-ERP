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

## ⚙️ Como executar

1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/saphir-erp.git](https://github.com/SEU_USUARIO/saphir-erp.git)