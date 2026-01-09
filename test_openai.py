from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Test med ett enkelt API-anrop
response = client.chat.completions.create(
    model="gpt-4o-mini",
    max_tokens=50,
    messages=[
        {"role": "user", "content": "Säg 'OpenAI-nyckeln fungerar!' på svenska."}
    ]
)

print(response.choices[0].message.content)
