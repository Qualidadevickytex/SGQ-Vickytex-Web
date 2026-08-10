# Histórico do Esquema de Banco de Dados — Transição para Firebase Firestore

> ⚠️ **AVISO DE MIGRAÇÃO E TRANSIÇÃO**
> O SGQ WEB VICKYTEX evoluiu sua arquitetura de dados a partir da versão v1.2.0 para utilizar **Firebase Firestore** como fonte principal de persistência relacional e em nuvem com fallback gracioso para `localStorage`.
> 
> 👉 **Acesse a especificação oficial atualizada em [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md)**.

---

## 1. Visão Geral do Histórico do Esquema (Prisma / SQLite Legacy)

Nas versões anteriores (v1.1.0), o sistema operava com Prisma ORM e SQLite local (`prisma/sgq.db`). A modelagem relacional de 22 entidades foi adaptada de forma 1:1 para as coleções do Firestore no repositório Firebase (`src/services/firebase/repositories/`).

Para detalhes completos sobre a arquitetura ativa de banco de dados NoSQL e repositórios em nuvem, consulte o documento oficial [`/docs/FIRESTORE_SCHEMA.md`](/docs/FIRESTORE_SCHEMA.md).

