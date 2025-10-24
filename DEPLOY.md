# Deploy till Scalingo

## Steg-för-steg guide

### 1. Installera dependencies lokalt (valfritt, för att testa)
```bash
npm install
```

### 2. Testa lokalt (valfritt)
```bash
npm start
# Öppna http://localhost:8080
```

### 3. Commit alla filer
```bash
git add .
git commit -m "Add Scalingo deployment configuration"
```

### 4. Pusha till Scalingo
```bash
git push scalingo main
```

Om din branch heter `master` istället:
```bash
git push scalingo master:main
```

## Troubleshooting

### Om du får fel om att Scalingo remote inte finns:
```bash
scalingo git-setup --app ditt-app-namn --remote scalingo
```

### Om du behöver skapa en ny app:
```bash
scalingo create utbytenkarta
git push scalingo main
```

### Om du vill se logs:
```bash
scalingo --app ditt-app-namn logs
```

### Om du vill öppna appen:
```bash
scalingo --app ditt-app-namn open
```

## Vad händer vid deployment?

1. Scalingo upptäcker `package.json` och identifierar det som en Node.js-app
2. `npm install` körs automatiskt
3. `Procfile` talar om att köra `npm start`
4. `http-server` startar och servar alla statiska filer
5. Appen blir tillgänglig på din Scalingo URL

## Viktiga filer

- `package.json` - Definierar Node.js-projekt och dependencies
- `Procfile` - Talar om hur appen ska startas
- `scalingo.json` - Scalingo-specifik konfiguration
- `.gitignore` - Filer som inte ska committas

## Efter deployment

Din app kommer vara tillgänglig på:
`https://ditt-app-namn.osc-fr1.scalingo.io`

eller den custom domain du konfigurerat.
