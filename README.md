# Du problème au projet — Hector DEGLA

Application Next.js qui transforme un problème exprimé par l'utilisateur en projet structuré (idée, cadre logique, budget, chronogramme) via l'API Gemini gratuite.

## Étapes pour déployer sur Vercel — 30 minutes max

### 1. Récupère ta clé Gemini gratuite

- Va sur https://aistudio.google.com/apikey
- Connecte-toi avec ton compte Google
- Clique sur "Create API Key" → "Create API key in new project"
- Copie la clé qui commence par AIza... (garde-la en sécurité)

Cette clé donne 1000 générations gratuites par jour, sans carte bancaire.

### 2. Crée un compte GitHub

- Va sur https://github.com → Sign up
- Choisis un nom d'utilisateur (ex: hector-degla)

### 3. Pousse le code sur GitHub

Option simple : utilise GitHub Desktop (gratuit, télécharge sur desktop.github.com)
- Crée un nouveau repository : "projet-ia-benin"
- Glisse tous les fichiers de ce dossier dedans
- Commit + Push

Option ligne de commande :
```bash
cd projet-vercel
git init
git add .
git commit -m "Premier commit"
git remote add origin https://github.com/TON-USERNAME/projet-ia-benin.git
git push -u origin main
```

### 4. Déploie sur Vercel

- Va sur https://vercel.com → Sign up avec GitHub
- Clique "Add New Project"
- Sélectionne ton repo "projet-ia-benin"
- Avant de cliquer Deploy, va dans "Environment Variables" et ajoute :
  - Name: `GEMINI_API_KEY`
  - Value: ta clé Gemini (AIza...)
- Clique Deploy
- Attends 2 minutes
- Ton site est en ligne sur une URL du type : `projet-ia-benin.vercel.app`

### 5. (Optionnel) Domaine personnalisé

- Achète un domaine sur Namecheap ou Hostinger (environ 6000 FCFA/an)
- Dans Vercel → Settings → Domains → Add Domain
- Suis les instructions DNS

### 6. Surveille l'usage

- Console Gemini : https://aistudio.google.com/app/apikey pour voir ta consommation
- Vercel Analytics : voir combien de personnes visitent ton site

## Protections déjà en place

- Clé API jamais exposée côté client (route API Next.js)
- Limite de 3 générations par adresse IP par jour
- Validation : minimum 30 caractères pour le problème

## Pour modifier le numéro WhatsApp ou le texte

- Numéro : cherche `2290162917191` dans `pages/index.js`
- Textes : tout est dans `pages/index.js`
- Prompt IA : dans `pages/api/generate.js`

## Test local avant déploiement

```bash
npm install
cp .env.local.example .env.local
# ajoute ta clé dans .env.local
npm run dev
```

Va sur http://localhost:3000
