from fastapi import FastAPI
import functionality
import json


app = FastAPI()

@app.get("/")
def read_root():
    print('hi')
    
    return {"Hello": "World"}


@app.get("/get_data/")
def load_cards():
    data = functionality.get_data(2015)
    cards_u1, cars_u1, all_cards =  functionality.get_cards(data)
    json_df1 = cards_u1.to_json(orient='records')
    json_df2 = cars_u1.to_json(orient='records')

    data_df1 = json.loads(json_df1)
    data_df2 = json.loads(json_df2)

    urls = []
    for index in range(len(all_cards)):

        urls.append(functionality.get_url(all_cards.iloc[index], 'data/image_links/2015_images.txt'))

    combined_json = {
        "player_1": data_df1,
        "player_2": data_df2,
        "image_links": urls
    }


    return json.dumps(combined_json)
