# My RSS Reader

Un lettore RSS personale moderno e completo, costruito con Next.js 14 e Tailwind CSS.

## 🚀 Funzionalità

### Funzionalità Base
- ✅ Aggiungere e rimuovere feed RSS
- ✅ Organizzare feed in categorie personalizzate
- ✅ Visualizzare articoli in ordine cronologico
- ✅ Segnare articoli come letti/non letti
- ✅ Salvare articoli nei preferiti
- ✅ Filtrare per: Tutti, Non letti, Preferiti
- ✅ Ricerca e filtri avanzati
- ✅ Dark mode automatico
- ✅ Interfaccia responsive

### Caratteristiche Avanzate
- 📊 Conteggio articoli non letti per feed
- 🎨 Categorie con colori personalizzati
- ⏰ Timestamp relativi (es. "2 ore fa")
- 🔄 Aggiornamento manuale di tutti i feed
- 📱 Design mobile-friendly
- 💾 Persistenza locale con localStorage

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **Icone**: Lucide React
- **Parser RSS**: rss-parser
- **Date**: date-fns
- **Database**: Vercel Postgres
- **Storage**: Postgres (sincronizzato tra dispositivi)

## 📦 Installazione

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Account GitHub (già ce l'hai ✓)
- Account Vercel (già ce l'hai ✓)

### Setup Locale

1. **Clona o crea il progetto nella tua directory locale**

2. **Installa le dipendenze**
```bash
npm install
```

3. **Avvia il server di sviluppo**
```bash
npm run dev
```

4. **Apri il browser**
Vai su [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy su Vercel

### Opzione 1: Deploy da GitHub (Raccomandato)

1. **Carica il codice su GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/my-rss-reader.git
git push -u origin main
```

2. **Vai su [Vercel](https://vercel.com)**
   - Accedi con il tuo account GitHub
   - Clicca "Add New Project"
   - Importa il repository `my-rss-reader`
   - Vercel rileverà automaticamente Next.js
   - Clicca "Deploy"

3. **Setup Database** ⚠️ IMPORTANTE
   - Dopo il primo deploy, devi configurare il database
   - Segui la guida completa: **[DATABASE_SETUP.md](../DATABASE_SETUP.md)**
   - In breve:
     1. Vai su Vercel Dashboard > tuo progetto > Storage
     2. Crea un database Postgres (gratuito)
     3. Esegui lo script `schema.sql` nel Query Editor di Vercel
     4. Redeploy il progetto

4. **Fatto!** 🎉
   Il tuo RSS reader sarà disponibile e funzionante con database persistente!

### Opzione 2: Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📖 Come Usare

### Aggiungere un Feed RSS

1. Clicca sul pulsante "Aggiungi Feed" nella sidebar
2. Incolla l'URL del feed RSS (es: `https://techcrunch.com/feed/`)
3. Seleziona una categoria
4. Clicca "Aggiungi Feed"

### Feed RSS Popolari da Provare

**Tecnologia**
- TechCrunch: `https://techcrunch.com/feed/`
- Hacker News: `https://hnrss.org/frontpage`
- The Verge: `https://www.theverge.com/rss/index.xml`

**News Italiane**
- Il Post: `https://www.ilpost.it/feed/`
- ANSA: `https://www.ansa.it/sito/ansait_rss.xml`
- Wired Italia: `https://www.wired.it/feed/rss`

**GitHub**
- Attività personale: `https://github.com/TUO-USERNAME.atom`
- Repository specifico: `https://github.com/OWNER/REPO/commits.atom`

**Blog e Altro**
- Medium: `https://medium.com/feed/@username`
- Dev.to: `https://dev.to/feed/username`

### Gestire gli Articoli

- **Leggere**: Clicca sul titolo o sul pulsante "Apri"
- **Segnare come letto**: Clicca su "Segna come letto"
- **Aggiungere ai preferiti**: Clicca su "Preferito"
- **Filtrare**: Usa i pulsanti nella sidebar (Tutti/Non letti/Preferiti)

### Aggiornare i Feed

- Clicca su "Aggiorna tutti" nell'header per recuperare nuovi articoli

## 🎨 Personalizzazione

### Aggiungere Categorie

Modifica il file `lib/storage.ts` alla riga 72:

```typescript
return [
  { id: '1', name: 'Tecnologia', color: '#3b82f6' },
  { id: '2', name: 'News', color: '#ef4444' },
  { id: '3', name: 'La Mia Categoria', color: '#10b981' },
];
```

### Cambiare i Colori

I colori sono gestiti da Tailwind CSS. Modifica `tailwind.config.js` per personalizzare la palette.

## 🔧 Sviluppo Futuro

### Miglioramenti Possibili

**Storage & Performance**
- [ ] Migrazione a database (Vercel Postgres/KV)
- [ ] Cache intelligente degli articoli
- [ ] Sincronizzazione cross-device

**UI/UX**
- [ ] Vista compatta/espansa
- [ ] Scorciatoie da tastiera (j/k per navigare)
- [ ] Temi personalizzati
- [ ] Export articoli (PDF/Markdown)

**Funzionalità**
- [ ] Ricerca full-text negli articoli
- [ ] Tag personalizzati
- [ ] Statistiche di lettura
- [ ] Import/Export OPML
- [ ] Notifiche per nuovi articoli

**Mobile**
- [ ] PWA (Progressive Web App)
- [ ] Installazione su home screen
- [ ] Modalità offline

## 🐛 Troubleshooting

### Il feed non si carica
- Verifica che l'URL sia corretto e sia un feed RSS valido
- Alcuni siti potrebbero bloccare le richieste (problema CORS)
- Prova a cercare "feed RSS [nome sito]" su Google

### Gli articoli non si salvano
- Verifica che localStorage sia abilitato nel browser
- Controlla la console del browser per errori

### Dark mode non funziona
- Il dark mode si basa sulle preferenze del sistema operativo
- Su macOS: Preferenze > Generali > Aspetto
- Su Windows: Impostazioni > Personalizzazione > Colori

## 📝 Note Tecniche

- **Storage**: Attualmente usa localStorage (limite ~5-10MB)
- **Limiti**: Nessun limite sul numero di feed, dipende dallo storage del browser
- **CORS**: L'API `/api/fetch-feed` fa da proxy per evitare problemi CORS
- **Performance**: Ottimizzato per ~100 feed e ~1000 articoli

## 📄 Licenza

MIT - Sentiti libero di usare, modificare e distribuire questo progetto!

## 🤝 Contribuire

Questo è un progetto personale, ma se vuoi estenderlo:
1. Fork il repository
2. Crea una branch per la tua feature
3. Commit le modifiche
4. Push e crea una Pull Request

---

**Fatto con ❤️ usando Next.js e Tailwind CSS**
