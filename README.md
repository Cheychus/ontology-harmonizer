# Ontology-Harmonizer (Bachelorarbeit-Prototyp)

Der Ontology-Harmonizer ist im Rahmen einer Informatik-Bachelorarbeit entwickelt worden und ist eine Anwendung, um für Forschungsdatencontainer im ARC-Format wiederverwendbare Ontologiebegriffs-Verknüpfungen zu erstellen. 

## Screenshots / Demo

[Live-Demo](https://ontology-harmonizer.vercel.app/)

## Problem

Datenbanken verwenden nicht immer fachlich eindeutige Bezeichner wie Organism oder Species sondern bestehen häufig aus Abkürzungen wie ORIGCTY = Country of Origin oder ACC_NR = Accession Number. 
Zusätzlich können Bezeichner wie Row mehrere Bedeutungen haben (Plant row oder Database Row?).

In einem Anwendungsfall von FAIRagro geht es darum statt diesen abstrakten oder nicht eindeutigen Bezeichnern Ontologiebegriffe zu verwenden, die über eine eindeutige ID unter anderem eine Beschreibung und Beziehungen zu anderen Ontologiebegriffen enthalten. 
Eine manuelle Annotation dieser Bezeichner mit Ontologiebegriffen ist jedoch zeitaufwendig


Für die eindeutige Definition eines Bezeichners können daher Ontologiebegriffe verwendet werden, die über eine eindeutige ID zugeordnet werden können und unter anderem eine Beschreibung und weitere Metadaten enthalten. 
Zudem sind Ontologiebegriffe über 





Die Anwendung kann mit einem bestehenden DataHUB (GitLab-Instanz) konfiguriert werden und ermöglicht Zugriff auf persönliche ARC-Repositories. 
Anschließend werden verwendete Bezeichner (z.B. Organism, Species, Genus) extrahiert und können über angebundene API-Suchservices mit passenden Ontologiebegriffen verknüpft werden. 
Die Verknüpfung kann anschließend wiederverwendet werden für beliebig viele weitere ARCs. 

## Hintergrund 

In einem Anwendungsfall von FAIRagro werden Datensätze aus verschiedenen Datenbanken in das ARC-Format übertragen und sollen mit Ontologiebegriffen annotiert werden. 
Da innerhalb einer Datenbank mit einem Bezeichner wie Organism meist nur ein einziges Konzept in allen Datensätzen gemeint ist, kann diese Verknüpfung einmalig in einer Mapping Datei gespeichert werden.  

Da eine manuelle Annotation zeitaufwendig ist und innerhalb einer Datenbank ein Bezeichner meist konsistent für ein einziges Konzept verwendet wird. 

## Problem

Datenbankbezeichner verwenden häufig Abkürzungen für Fachbegriffe, oder meinen mit einem Begriff wie z.B. Reihe unterschiedliche Konzepte (Pflanzenreihe oder Tabellenreihe?).




> Ein Satz: Was löst das Projekt für wen?


[Live-Demo](https://…) · [Screenshots / kurze Demo](…)

![Screenshot der Kernfunktion](./docs/screenshot.png)

## Kontext
2–4 Sätze: Problem, Zielgruppe und Rahmen.


## Mein Beitrag
- Ich habe …
- Ich habe …
- Ich habe …

## Umsetzung
- **Stack:** SvelteKit, TypeScript, …
- **Wichtige Entscheidungen:** …
- **Ergebnis:** Was funktioniert bzw. was wurde messbar besser?

## Lokal starten



# Ontology Harmonizer
- Upload and identify ontologies in ARCs (Annotated Research Context)
- Map undefined or defined ontologies with new ontology identifiers
- Export updated ARC-Files

## Install
```sh
# Clone github project 
git clone https://github.com/Cheychus/ontology-harmonizer.git

# change directory
cd ontology-harmonizer

# install dependencies
npm install

# start development server
npm run dev

# open localhost
localhost:5173
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
