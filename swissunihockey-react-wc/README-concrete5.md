# Swiss Unihockey React Web Components – Concrete5 Einbau

Dieses Projekt registriert React-Komponenten als echte Custom Elements / Web Components.

## Build erstellen

```bash
npm install
npm run build
```

Danach liegen die fertigen Dateien hier:

```text
dist/swissunihockey-webcomponents.css
dist/swissunihockey-webcomponents.js
```

## In Concrete5 hochladen

Kopiere den kompletten `dist`-Ordner auf den Server, zum Beispiel nach:

```text
/application/files/swissunihockey-webcomponents/
```

Dann liegen die Dateien zum Beispiel unter:

```text
/application/files/swissunihockey-webcomponents/swissunihockey-webcomponents.css
/application/files/swissunihockey-webcomponents/swissunihockey-webcomponents.js
```

## In Concrete5 einbinden

### Variante 1: Direkt im Theme

CSS in den `<head>` deines Themes, zum Beispiel in:

```text
/application/themes/dein_theme/elements/header.php
```

```html
<link rel="stylesheet" href="/application/files/swissunihockey-webcomponents/swissunihockey-webcomponents.css">
```

JavaScript vor `</body>`, zum Beispiel in:

```text
/application/themes/dein_theme/elements/footer.php
```

```html
<script type="module" src="/application/files/swissunihockey-webcomponents/swissunihockey-webcomponents.js"></script>
```

### Variante 2: Nur auf einer einzelnen Seite

In einem HTML-Block / Custom HTML Block:

```html
<link rel="stylesheet" href="/application/files/swissunihockey-webcomponents/swissunihockey-webcomponents.css">
<script type="module" src="/application/files/swissunihockey-webcomponents/swissunihockey-webcomponents.js"></script>

<uniho-games mode="current"></uniho-games>
```

Wichtig: Verwende nicht den normalen Text/WYSIWYG-Block, falls Concrete5 unbekannte Tags entfernt. Verwende einen HTML-Block, Custom Block oder Theme-Template.

## Beispiele

### Aktuelle Spiele

```html
<uniho-games mode="current"></uniho-games>
```

### Spiele eines Teams

```html
<uniho-games mode="team" team-id="12345" season="2025"></uniho-games>
```

### Spiele eines Clubs

```html
<uniho-games mode="club" club-id="12345" season="2025"></uniho-games>
```

### Rangliste

```html
<uniho-ranking season="2025" league="1" game-class="11" group="1" view="full"></uniho-ranking>
```

### Teamliste

```html
<uniho-teams league="1" game-class="11"></uniho-teams>
```

### Teams nach Club

```html
<uniho-teams mode="by_club" season="2025" club-id="12345"></uniho-teams>
```

### Teamdetails

```html
<uniho-team team-id="12345"></uniho-team>
```

### Kaderliste

```html
<uniho-team-players team-id="12345"></uniho-team-players>
```

### Teamstatistik

```html
<uniho-team-statistics team-id="12345"></uniho-team-statistics>
```

### Zuschauerstatistik

```html
<uniho-team-visitors season="2025" league="1" game-class="11"></uniho-team-visitors>
```

## Verfügbare Web Components

- `<uniho-games>`
- `<uniho-ranking>`
- `<uniho-teams>`
- `<uniho-team>`
- `<uniho-team-players>`
- `<uniho-team-statistics>`
- `<uniho-team-visitors>`

## Hinweise

- Attribute werden in HTML mit Bindestrich geschrieben, z. B. `team-id` statt `teamId`.
- Das Design ist bewusst an das bestehende swissunihockey-Webcomponent-Projekt angelehnt: rote Akzentlinie, kompakte Tabellen, neutrale Kartenoptik.
- Die API wird direkt im Browser aufgerufen. Falls Concrete5 oder der Server eine Content-Security-Policy verwendet, muss `https://api-v2.swissunihockey.ch` für `connect-src` erlaubt sein.
