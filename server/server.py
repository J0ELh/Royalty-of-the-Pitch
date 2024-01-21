from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import functionality
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    print('hi')
    
    return {"Hello": "World"}


@app.get("/get_data/")
def load_cards():
    data = functionality.get_data(2015)
    cards_1, cards_2, all_cards = functionality.get_cards(data)

    # Retrieve URLs for cards_1
    urls_1 = [functionality.get_url(card, 'data/image_links/2015_images.txt') for card in cards_1.itertuples(index=False)]

    # Retrieve URLs for cards_2
    urls_2 = [functionality.get_url(card, 'data/image_links/2015_images.txt') for card in cards_2.itertuples(index=False)]

    # Convert DataFrames to JSON and add URLs
    json_df1 = json.loads(cards_1.to_json(orient='records'))
    for index, url in enumerate(urls_1):
        json_df1[index]['url'] = url

    json_df2 = json.loads(cards_2.to_json(orient='records'))
    for index, url in enumerate(urls_2):
        json_df2[index]['url'] = url

    # Combine JSON data for both players
    combined_json = {
        "player_1": json_df1,
        "player_2": json_df2,
    }

    return json.dumps(combined_json)
