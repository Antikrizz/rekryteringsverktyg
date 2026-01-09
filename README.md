# Rekryteringsverktyg

Ett AI-drivet verktyg för att genomföra, dokumentera och bedöma rekryteringsintervjuer.

## Funktioner

- **Skapa roller** - AI genererar automatiskt 6 intervjufrågor baserat på rollbeskrivningen
- **CV-analys** - Ladda upp CV och få 4 personliga frågor genererade
- **Ljudtranskribering** - Ladda upp intervjuinspelning för automatisk transkribering
- **AI-analys** - Varje svar bedöms med poäng (1-5), sammanfattning och citat
- **Word-rapport** - Generera professionell intervjurapport
- **Jämför kandidater** - Se alla kandidater rankade efter totalpoäng

## Teknisk stack

- **Backend:** Python, Flask, SQLite
- **Frontend:** React
- **AI:** Claude API (Anthropic) för analys, Whisper API (OpenAI) för transkribering

## Installation

### Förutsättningar

- Python 3.12
- Node.js
- API-nycklar från [Anthropic](https://console.anthropic.com) och [OpenAI](https://platform.openai.com)

### Steg 1: Klona repot

```bash
git clone https://github.com/Antikrizz/rekryteringsverktyg.git
cd rekryteringsverktyg
```

### Steg 2: Skapa .env-fil

Skapa en fil `.env` i rotmappen med dina API-nycklar:

```
ANTHROPIC_API_KEY=din-anthropic-nyckel
OPENAI_API_KEY=din-openai-nyckel
```

### Steg 3: Installera backend

```bash
cd backend
pip install -r requirements.txt
```

### Steg 4: Installera frontend

```bash
cd frontend
npm install
```

## Starta applikationen

### Terminal 1 - Backend

```bash
cd backend
python app.py
```

Backend körs på http://localhost:5000

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

Frontend körs på http://localhost:3000

## Användning

1. **Skapa/välj roll** - Ange rollnamn och beskrivning, eller välj en befintlig roll
2. **Ladda upp CV** - PDF, Word eller klistra in text
3. **Granska frågor** - Redigera de genererade frågorna om du vill
4. **Genomför intervju** - Läs upp frågorna och spela in intervjun
5. **Ladda upp ljud** - Eller klistra in transkription manuellt
6. **Analysera** - AI bedömer varje svar
7. **Ladda ner rapport** - Generera Word-dokument

## Poängsättning

| Poäng | Beskrivning |
|-------|-------------|
| 5 | Exceptionellt - djup förståelse, konkreta exempel |
| 4 | Starkt - tydlig kompetens, relevanta exempel |
| 3 | Acceptabelt - grundläggande förståelse |
| 2 | Svagt - vag eller bristfällig |
| 1 | Mycket svagt - ingen relevant förståelse |

**Totalpoäng:** Max 50 poäng (10 frågor × 5 poäng)

## Licens

MIT
