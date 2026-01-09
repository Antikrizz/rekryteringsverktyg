import requests

role_data = {
    "name": "Avdchef konstruktion",
    "description": """Om tjänsten

Som avdelningschef hos oss på Tyréns kommer du arbeta inom vårt affärsområde Building and Urban Design och kompetensområde konstruktion.

I denna roll kommer du exempelvis jobba med att:
- Leda avdelningens operativa och strategiska verksamhet med uppföljning och resultatansvar.
- Tillsammans med marknadsansvarig arbeta med att bygga upp avdelningen under kommande år med målbilden om en hög tillväxthastighet.
- Utveckla kundkontakter, anbud och marknadsföring/marknadspositionering.

Avdelningen har flera spännande projekt igång inom disciplinerna konstruktion och fukt. Som chef på Tyréns ingår hela företaget, din avdelning och du själv i ett större sammanhang och det sker en aktiv samverkan med motsvarande avdelningar runt om i landet för att utveckla konstruktion som affär på Tyréns som helhet.

Vi söker:
- Civilingenjörsexamen inom konstruktion
- Arbetat som chef med personal-, verksamhets- och resultatansvar under några år
- Starka marknadskontakter på den lokala marknaden
- Förmåga att arbeta tvärdiciplinärt och förstå helheten av projekt
- 10 års erfarenhet som konstruktör, varav minst 5 år som uppdragsledare

Meriterande är erfarenhet/kunskap inom:
- Tillämpning av AI-teknologi
- Aktivt klimatarbete kopplat till husbyggnad
- Bygga team med en hög tillväxthastighet"""
}

response = requests.post("http://localhost:5000/api/roles", json=role_data)
print(response.json())
