# Cadastro de Faturamento — Silva & Silva

Formulário web que grava faturamentos (êxitos, sucumbências, extrajudiciais, partido mensal, honorários avulsos) direto numa planilha do Google, com apuração automática do **centro de receita** conforme a Tabela 14.2 e registro de vencimento, forma de pagamento e parcelamento.

- **Formulário:** `index.html`
- **Código do servidor:** `Codigo-AppScript.gs`
- **Planilha de destino:** https://docs.google.com/spreadsheets/d/1pRvYAFNb62663B6rL_MHX-sI2VlRL4itYdupgqCUrhI/edit

---

## Como funciona (a arquitetura)

```
Formulário (GitHub Pages, link fixo)  ──POST──►  Apps Script (Web App, URL fixa)  ──►  Planilha Google
```

O link do formulário nunca "morre" e pode rodar quantas vezes quiser. O Apps Script fica ligado à SUA planilha, na SUA conta Google — só você autoriza.

---

## Parte 1 — Publicar o Apps Script (pega a URL fixa)

1. Abra a planilha: https://docs.google.com/spreadsheets/d/1pRvYAFNb62663B6rL_MHX-sI2VlRL4itYdupgqCUrhI/edit
2. Menu **Extensões → Apps Script**.
3. Apague qualquer código que aparecer e **cole todo o conteúdo de `Codigo-AppScript.gs`**.
4. Clique no disquete (**Salvar projeto**).
5. Botão azul **Implantar → Nova implantação**.
6. No ícone de engrenagem (⚙️ "Selecionar tipo"), escolha **App da Web**.
7. Configure:
   - **Descrição:** Cadastro de Faturamento
   - **Executar como:** *Eu (seu e-mail)*
   - **Quem pode acessar:** **Qualquer pessoa** ← importante, senão o form não grava.
8. **Implantar**. O Google vai pedir autorização → **Autorizar acesso** → escolha sua conta → em "app não verificado" clique **Avançado → Acessar (nome do projeto)** → **Permitir**.
9. Copie a **URL do app da Web** (termina em `/exec`). É essa que vai no formulário.

> Teste rápido: cole essa URL no navegador. Deve aparecer `{"ok":true,"status":"online"...}`.

---

## Parte 2 — Ligar o formulário à URL

1. Abra `index.html`.
2. No topo do `<script>`, cole a URL na linha:
   ```js
   const APPS_SCRIPT_URL = "COLE_A_URL_/exec_AQUI";
   ```
3. Salve.

Enquanto essa variável estiver vazia (`""`), o formulário roda em **MODO TESTE**: mostra sucesso mas **não grava** (útil para testar o visual). Assim que colar a URL, passa a gravar de verdade.

---

## Parte 3 — Hospedar no GitHub Pages (link fixo do formulário)

1. Crie um repositório no GitHub (ex.: `cadastro-exitos`) — pode ser **público** (só HTML, sem segredo) ou privado com Pages.
2. Suba o arquivo `index.html` (arraste no site do GitHub em **Add file → Upload files**, ou por git).
3. No repositório: **Settings → Pages**.
4. Em **Source**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**. Salve.
5. Em ~1 min o GitHub mostra o link, algo como:
   `https://SEU-USUARIO.github.io/cadastro-exitos/`
6. Esse é o link que você compartilha e usa sempre. ✅

> **Importante:** o `index.html` que você sobe no GitHub já tem que estar com a `APPS_SCRIPT_URL` preenchida (Parte 2).

### Sobre o comando git (se preferir terminal)

```bash
cd "C:/Users/SNOT017/Documents/projetos claude/Exitos"
git init
git add index.html
git commit -m "Formulário de cadastro de êxitos"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/cadastro-exitos.git
git push -u origin main
```

---

## Regras da Tabela 14.2 embutidas

| Área Jurídica | % Centro Primário |
|---|---|
| Contencioso | 8,33% |
| Trabalhista | 8,33% |
| Bancário | 4,17% |
| Criminal | 2,92% |
| Público | 8,33% |
| Tributário | 8,33% |
| Extrajudicial | 8,33% |

- **Florianópolis ou Sinop:** Centro **Primário = Cidade** (o % da área) / **Secundário = Área** (o restante). Ex.: Contencioso em Florianópolis → Primário Fln 8,33% / Secundário Contencioso 91,67%.
- **Outras cidades:** Centro Primário = a própria Área Jurídica.
- **Assessoria mensal:** o toggle desliga o centro de receita ("Não se aplica"), salvo indicação dos sócios.
- **Extrajudicial** como tipo → nº de processo vira opcional.
- **Observações** é sempre opcional (ex.: casos que só cadastram e não cobram).

---

## Dúvidas comuns

- **"Alterei o código do Apps Script, e agora?"** → **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão → Implantar.** A URL continua a mesma.
- **"O form não grava"** → confira se em "Quem pode acessar" está **Qualquer pessoa** e se a `APPS_SCRIPT_URL` termina em `/exec`.
- **"Quero mais campos"** → adicione no `CABECALHO` e no `appendRow` (Apps Script) e o campo correspondente no `index.html`.
