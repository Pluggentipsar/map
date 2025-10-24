# Interaktiv Kartapp för Internationella Utbyten

En modern och interaktiv webbapplikation för att visualisera och hantera internationella utbytesprogram på en karta över Europa.

## Funktioner

### Kartvisning
- **Interaktiv karta** över Europa med Leaflet.js och OpenStreetMap
- **Färgkodade markers** baserat på kategori:
  - 🔵 Blå - Erasmus
  - 🟢 Grön - Nordplus
  - 🟠 Orange - TCA
  - 🔴 Röd - Atlas
- **Klickbara markers** med detaljerad information om varje utbyte
- **Gruppering** av flera utbyten på samma plats

### Filtrering & Sökning
- Filtrera per kategori (Erasmus, Nordplus, TCA, Atlas)
- Filtrera per aktivitetstyp (Kurs, Jobbskugga, Elevresa, etc.)
- Filtrera per skola/enhet
- Realtidssökning i alla fält
- Statistik som uppdateras i realtid

### Admin-panel
- **Lägg till** nya utbyten med formulär
- **Redigera** befintliga utbyten
- **Ta bort** utbyten
- **Importera** CSV-filer med nya utbyten
- **Exportera** data till CSV
- Live-tabell med alla utbyten

### Design
- **Modern UI/UX** med glassmorphism-effekter
- **Dark/Light mode** som sparas i webbläsaren
- **Responsiv design** - fungerar på desktop, tablet och mobil
- **Smooth animationer** och hover-effekter

## Kom igång

### 1. Öppna applikationen

Öppna `index.html` i en webbläsare:
- Dubbelklicka på filen, eller
- Högerklicka och välj "Öppna med" → din webbläsare, eller
- Använd en lokal server (rekommenderas)

### 2. Använd en lokal server (rekommenderat)

För bästa resultat, kör applikationen via en lokal webbserver:

**Med Python:**
```bash
# Python 3
python -m http.server 8000

# Öppna sedan: http://localhost:8000
```

**Med Node.js (http-server):**
```bash
npx http-server

# Öppna sedan adressen som visas
```

**Med VS Code:**
Installera "Live Server" extension och högerklicka på index.html → "Open with Live Server"

### 3. Första gången

När du öppnar appen första gången kommer den att:
1. Läsa in data från `Utbyten.csv`
2. Geocoda alla destinationer (konvertera adresser till koordinater)
3. Spara data i webbläsarens localStorage för snabbare laddning nästa gång

**OBS:** Geocoding kan ta 1-2 minuter första gången pga rate limiting (1 sekund per destination). Därefter laddas datan direkt från localStorage.

## Användning

### Huvudkarta

1. **Navigera kartan:**
   - Zooma: Mushjul eller +/- knappar
   - Panorera: Dra med musen
   - Klicka på marker för detaljer

2. **Filtrera:**
   - Använd checkboxes för kategorier
   - Välj aktivitetstyp i dropdown
   - Välj skola i dropdown
   - Sök i sökfältet

3. **Återställ filter:**
   - Klicka på "Återställ filter"

4. **Byt tema:**
   - Klicka på måne/sol-ikonen

### Admin-panel

Öppna admin-panelen genom att klicka på "Admin Panel" i headern.

#### Lägg till utbyte
1. Klicka på "➕ Lägg till utbyte"
2. Fyll i formuläret (fält med * är obligatoriska)
3. Klicka "Spara"

#### Redigera utbyte
1. Hitta utbytet i tabellen
2. Klicka på ✏️ (edit-ikonen)
3. Uppdatera fälten
4. Klicka "Spara"

#### Ta bort utbyte
1. Hitta utbytet i tabellen
2. Klicka på 🗑️ (delete-ikonen)
3. Bekräfta borttagning

#### Importera CSV
1. Klicka på "📥 Importera CSV"
2. Välj en CSV-fil med samma format som `Utbyten.csv`
3. Bekräfta import
4. Data läggs till befintlig data

**CSV-format:**
```
Destination;Aktivitet;Kurs/besökande skola;Enhet;
Stockholm, Sverige;Kurs;Leadership Training;Junedalskolan;Erasmus
```

#### Exportera CSV
1. Klicka på "📤 Exportera CSV"
2. Filen laddas ner automatiskt

#### Rensa all data
1. Klicka på "🗑️ Rensa all data"
2. Bekräfta dubbelt (detta kan inte ångras!)
3. Ladda om sidan för att återställa från `Utbyten.csv`

## Projektstruktur

```
map/
├── index.html              # Huvudsida med karta
├── admin.html             # Admin-panel
├── Utbyten.csv            # Källdata (CSV)
├── README.md              # Denna fil
├── css/
│   ├── style.css          # Huvudstyles
│   └── admin.css          # Admin-panel styles
├── js/
│   ├── map.js             # Kartlogik och huvudapp
│   ├── data.js            # Datahantering och localStorage
│   ├── filters.js         # Filtreringsfunktioner
│   ├── geocoding.js       # Geocoding av adresser
│   └── admin.js           # Admin-panel funktionalitet
└── data/                  # (skapas automatiskt för cache)
```

## Teknisk information

### Teknologier
- **Leaflet.js 1.9.4** - Kartbibliotek
- **OpenStreetMap** - Kartdata
- **PapaParse 5.4.1** - CSV-parser
- **Nominatim API** - Geocoding (gratis)
- **Vanilla JavaScript** - Ingen ramverk
- **CSS3** - Modern styling med custom properties
- **LocalStorage** - Persistent datalagring

### Dataflöde
1. CSV läses in med PapaParse
2. Data struktureras och valideras
3. Destinationer geocodas till koordinater
4. Data sparas i localStorage
5. Markers visas på kartan
6. Ändringar i admin-panel uppdaterar localStorage

### Geocoding
- Använder Nominatim API (gratis, OpenStreetMap)
- Rate limit: 1 request per sekund
- Många destinationer är förhandsdefinierade för snabbhet
- Cache i localStorage för snabbare omladdning

### Browser-kompatibilitet
- Chrome/Edge (rekommenderat)
- Firefox
- Safari
- Kräver JavaScript aktiverat
- Kräver localStorage aktiverat

## Anpassning

### Lägg till fler kategorier

1. Uppdatera CSS i `style.css`:
```css
:root {
    --ny-kategori: #färgkod;
}
```

2. Lägg till i filter i `index.html`

3. Uppdatera `getMarkerColor()` i `map.js`

### Ändra standardkarta

I `map.js`, ändra `initializeMap()`:
```javascript
// Byt till dark mode karta
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '...'
}).addTo(this.map);
```

### Ändra standardposition

I `map.js`, ändra koordinater i `initializeMap()`:
```javascript
this.map = L.map('map').setView([latitude, longitude], zoomLevel);
```

## Felsökning

### Kartan laddas inte
- Kontrollera internetanslutning
- Öppna Developer Tools (F12) och kolla Console för fel
- Kontrollera att alla JS-filer laddas korrekt

### CSV importeras inte
- Kontrollera att CSV har rätt format med semikolon (;) som separator
- Kontrollera att encoding är UTF-8
- Se till att det finns en header-rad

### Geocoding fungerar inte
- Nominatim API kan vara temporärt nere
- Rate limiting kan kräva längre väntetid
- Lägg till manuella koordinater i `geocoding.js`

### Data försvinner
- Kontrollera att localStorage är aktiverat i webbläsaren
- Rensa inte webbläsarens cache/localStorage
- Exportera data regelbundet till CSV som backup

## Support & Utveckling

### Kommande funktioner
- Exportera till Excel
- Bulk-redigering
- Mer avancerad statistik
- Utskriftsfunktion
- Delning av filtrerade vyer

### Rapportera problem
Om du hittar buggar eller har förslag på förbättringar, kontakta utvecklaren.

## Licens

Denna applikation är utvecklad för internt bruk för att visualisera internationella utbytesprogram.

---

**Version:** 1.0.0
**Senast uppdaterad:** 2025-01-24
