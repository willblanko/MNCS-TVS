# MNCS TVs — Sistema de Gerenciamento de Telas

Sistema web para gerenciar TVs, playlists e agendamentos de exibição de conteúdo.

## Stack

- **React 19** + **Vite** + **TypeScript**
- **Shadcn UI** + **Tailwind CSS**
- **React Router** (SPA com roteamento client-side)
- **Supabase** — autenticação, banco de dados, storage e realtime

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (para deploy)
- Conta no [Resend](https://resend.com) (para e-mails de redefinição de senha)

## Configuração

### 1. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

No Vercel, configure essas mesmas variáveis em **Settings → Environment Variables**.

### 2. Banco de dados (Supabase)

Execute as migrations da pasta `supabase/migrations/` no **SQL Editor** do seu projeto Supabase, em ordem cronológica.

### 3. Storage (Supabase)

Crie dois buckets públicos no Supabase Storage:
- `media` — para imagens enviadas pela biblioteca
- `avatars` — para fotos de perfil dos usuários

### 4. Redefinição de senha via Resend

No painel do Supabase, vá em **Authentication → Settings → SMTP**:

| Campo    | Valor                      |
|----------|----------------------------|
| Host     | `smtp.resend.com`          |
| Port     | `465`                      |
| Username | `resend`                   |
| Password | sua API Key do Resend      |
| Sender   | `noreply@seudominio.com`   |

Também configure em **Authentication → URL Configuration**:
- **Site URL**: URL do seu app no Vercel (ex: `https://mncs-tvs.vercel.app`)
- **Redirect URLs**: `https://mncs-tvs.vercel.app/redefinir-senha`

### 5. Edge Function

Faça deploy da Edge Function de gerenciamento de usuários:

```bash
npx supabase functions deploy manage-users
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse em [http://localhost:5173](http://localhost:5173).

## Deploy (Vercel)

O repositório está integrado ao Vercel. Cada push para `main` aciona um deploy automático. O arquivo `vercel.json` configura o roteamento SPA para evitar erros 404 ao recarregar páginas.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run preview    # visualizar build localmente
npm run lint       # linter
npm run format     # formatação de código
```

## Estrutura

```
src/
  components/     # Componentes reutilizáveis
  hooks/          # Hooks (auth, realtime)
  lib/supabase/   # Cliente Supabase e utilitários
  pages/          # Páginas da aplicação
  services/       # Serviços de acesso a dados
supabase/
  functions/      # Edge Functions
  migrations/     # Migrations SQL
```

## Funcionalidades

- **Biblioteca** — upload de imagens e links do YouTube
- **Playlists** — criação e edição de sequências de mídia
- **TVs** — cadastro e controle de dispositivos com player web
- **Agendamentos** — programação de playlists por horário e dia da semana
- **Usuários** — gestão de usuários (somente admin)
- **Perfil** — atualização de nome, foto e senha
- **Redefinição de senha** — por e-mail via Resend + Supabase
