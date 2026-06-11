# Guia de Migração — PocketHost (backend gratuito) + novo repositório

Este projeto usa **PocketBase** como backend de login **e** de dados (TVs, playlists,
mídia, agendamentos). Este guia mostra como sair do backend hospedado pelo Skip e
rodar tudo gratuitamente no [PocketHost.io](https://pockethost.io), além de mover o
código para o novo repositório.

## 1. Criar a instância no PocketHost

1. Crie uma conta gratuita em https://pockethost.io
2. Crie uma nova instância (ex.: `mnvs-tvs`). Você receberá uma URL do tipo
   `https://mnvs-tvs.pockethost.io`
3. Acesse o painel admin do PocketBase da instância
   (`https://mnvs-tvs.pockethost.io/_/`) e crie o usuário superadmin.

## 2. Enviar migrações e hooks

O PocketBase carrega migrações de `pb_migrations/` e hooks de `pb_hooks/`.
O PocketHost dá acesso a esses diretórios via **FTP** (veja a aba *FTP* no painel
da instância — usuário e senha são os da sua conta PocketHost).

1. Conecte via FTP (ex.: FileZilla) no host indicado pelo painel.
2. Envie todo o conteúdo de `pocketbase/migrations/` deste repo para `pb_migrations/`.
3. Envie todo o conteúdo de `pocketbase/hooks/` deste repo para `pb_hooks/`.
4. Reinicie a instância pelo painel do PocketHost (Power Off/On) para aplicar
   migrações e carregar os hooks.

## 3. Configurar o segredo do Cloudinary

O hook de upload (`cloudinary_signature.js`) lê `CLOUDINARY_API_SECRET` de uma
variável de ambiente (`$os.getenv`). No painel do PocketHost, abra a seção
**Secrets** da instância e adicione:

```
CLOUDINARY_API_SECRET=<seu segredo do Cloudinary>
```

> ⚠️ **Importante:** o segredo antigo estava commitado no código deste repositório
> (histórico do git). Gere um **novo** API Secret no painel do Cloudinary
> (Settings → Access Keys → Regenerate) e use o novo valor — considere o antigo
> comprometido.

## 4. Apontar o frontend para a nova instância

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edite `.env`:
   ```
   VITE_POCKETBASE_URL=https://mnvs-tvs.pockethost.io
   ```
3. Rode localmente para testar o login:
   ```bash
   npm install
   npm run dev
   ```

Para publicar o frontend gratuitamente, qualquer host estático serve
(Vercel, Netlify, Cloudflare Pages). Configure a variável de ambiente
`VITE_POCKETBASE_URL` no painel do host antes do build.

## 5. Migrar os dados existentes (opcional)

As migrações recriam o schema e alguns dados iniciais (seeds). Dados criados
depois (uploads, playlists novas, usuários reais) existem só no banco antigo.
Se você tiver acesso ao painel admin do PocketBase antigo:

- **Backup completo:** no painel antigo, Settings → Backups → baixe o `.zip`,
  e restaure na nova instância (Settings → Backups → Upload/Restore).
- **Por coleção:** exporte os registros via API ou painel e re-importe na nova
  instância.

## 6. Pós-migração — segurança

- As migrações criam usuários admin com senhas padrão (`Skip@Pass`,
  `Skip@2026`, `Skip@Pass123`). **Troque essas senhas** no primeiro acesso.
- Confirme as regras de acesso das coleções no painel admin
  (elas são definidas pelas migrações `0012`–`0020`).

## 7. Mover o código para o novo repositório

Com o novo repositório criado no GitHub, rode na sua máquina:

```bash
git clone -b claude/nice-faraday-gleeno https://github.com/willblanko/MNVS-TVS-SKIP.git mnvs-tvs
cd mnvs-tvs
git remote set-url origin https://github.com/willblanko/MNVS-TVS.git
git push -u origin claude/nice-faraday-gleeno:main
```

Isso publica este branch como `main` do novo repositório, preservando o histórico.
