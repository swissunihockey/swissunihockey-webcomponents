# Einbetten der Web Component auf einer Webseite
**1.	Dateien auf Website/Webserver hochladen (JavaScript und CSS files)**

Sie haben zwei Dateien erhalten:
-	eine **CSS-Datei** (für das Design)
-	eine **JavaScript-Datei (JS)** (für die Funktionalität)

Diese beiden Dateien müssen auf Ihre Webseite hochgeladen werden. Sie finden die Dateien in diesem Projekt mit den Namen "swissunihockey-webcomponents.css" und "swissunihockey-webcomponents.js".

**Beispiel WordPress**
1.	Melden Sie sich im WordPress-Backend an.
2.	Öffnen Sie Medien → Mediathek.
      ![img.png](img.png)
3. Ziehen Sie die beiden Dateien per Drag & Drop in die Mediathek.
4.	Öffnen Sie jede hochgeladene Datei.
5.	Kopieren Sie die jeweilige Datei-URL und speichern Sie diese ab. Sie benötigen die URLs später.
      ![img_1.png](img_1.png)


**2.	Web Components auf der Webseite aktivieren**

Bevor Sie Spielpläne, Ranglisten oder andere Inhalte anzeigen können, müssen Sie folgenden Code einmal auf der gewünschten Seite einfügen:
```js
<link
  rel="stylesheet"
  href="PATH_TO_CSS_FILE">
<script
  type="module"
  src="PATH_TO_JS_FILE">
</script>
```
Ersetzen Sie:
- URL_ZUR_CSS_DATEI durch die kopierte URL der CSS-Datei
- URL_ZUR_JS_DATEI durch die kopierte URL der JavaScript-Datei

**3.	Benötigte IDs finden**

Für viele Komponenten benötigen Sie Vereins-, Team- oder Liga-IDs.

Diese finden Sie hier:
https://www.swissunihockey.ch/de/administration/services/vereins-ids-finder-fuer-web-component/

Dort erhalten Sie unter anderem:
- Club-ID
- Team-ID
- League-ID
- GameClass-ID
- Gruppenname

**4.	Verfügbare Web Components auf Seiten einbetten**

Nun kann man auf einzelnen Seiten die Web-Component-Blöcke hinzufügen. Für jedes Web Component benötigst du die IDs aus Punkt 3.

1. **Ligaspiele anzeigen**


Zeigt die Spiele einer bestimmten Liga und Gruppe an.

**<u>Vorlage</u>**
```js
<uniho-league-games 
    game-class="CLASS_ID" 
    league="LEAGUE_ID"
    season="Jahr in dem die Saison beginnt"
    group="Group_Name">
<uniho-league-games>
```
**<u>Beispiel</u>**
```js
<uniho-league-games
    game-class="21"
    league="3"
    season="2025" 
    group="Gruppe 1">
</uniho-league-games>
```
**Wichtig:** Bei der Saison immer das Jahr angeben, in dem die Saison beginnt.
![img_2.png](img_2.png)

2. **Teamspiele nach Verein**

Zeigt sämtliche Teams eines Vereins in einer gemeinsamen Übersicht an.

**<u>Vorlage</u>**

```js
<uniho-club-team-games
    club-id="CLUB_ID"
    season="Jahr in dem die Saison beginnt"
    page-size="Anzahl Spiele pro Seite">
</uniho-club-team-games>
```
**<u>Beispiel:</u>**
```js
<uniho-club-team-games
    club-id="372"
    season="2025"
    page-size="6">
</uniho-club-team-games>
```
**Erklärung**
- **club-id** = Vereins-ID
- **season** = Startjahr der Saison
- **page-size** = Anzahl Spiele pro Seite

![img_3.png](img_3.png)

3. **Spiele eines einzelnen Teams anzeigen**

**<u>Vorlage</u>**

```js
<uniho-team-games
    season="Jahr in dem die Saison beginnt"
    team-id="TEAM_ID"
    page-size="Anzahl Spiele pro Seite">
</uniho-team-games>
```
**<u>Beispiel</u>**
```js
<uniho-team-games
    season="2025"
    team-id="429626"
    page-size="5">
</uniho-team-games>
```
**Erklärung**
- **team-id** = Team-ID
- **page-size** = Anzahl Spiele pro Seite

![img_4.png](img_4.png)

4. **Vereinsspiele anzeigen**

Zeigt die Spiele eines Vereins wochenweise an.

**<u>Vorlage</u>**
```js
<uniho-club-games
    season="Jahr in dem die Saison beginnt"
    club-id="CLUB_ID">
</uniho-club-games>
```
**<u>Beispiel</u>**
```js
<uniho-club-games
    season="2025"
    club-id="467">
</uniho-club-games>
```
![img_5.png](img_5.png)

5. **Rangliste anzeigen**

Zeigt die aktuelle Rangliste einer Liga oder Gruppe an.

**<u>Vorlage</u>**
```js
<uniho-ranking
    season="Jahr in dem die Saison beginnt"
    league="LEAGUE_ID"
    game-class="CLASS_ID"
    group="Group_Name">
</uniho-ranking>
```
**<u>Beispiel</u>**
```js
<uniho-ranking
    season="2025"
    league="3"
    game-class="21"
    group="Gruppe 1">
</uniho-ranking>
```
![img_6.png](img_6.png)

6. **Mobiliar Topscorer anzeigen**

Für Vereine, die ihre Mobiliar Topscorer auf der Webseite präsentieren möchten.

**<u>Vorlage</u>**
```js
<uniho-mobiliar-topscorer
    season="Jahr in dem die Saison beginnt"
    club-id="CLUB_ID">
</uniho-mobiliar-topscorer>
```
**<u>Beispiel</u>**
```js
<uniho-mobiliar-topscorer
    season="2025"
    club-id="463845">
</uniho-mobiliar-topscorer>
```
![img_7.png](img_7.png)