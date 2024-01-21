from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import functionality
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track connected clients and available IDs
connected_clients = {}
available_ids = [0, 1]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Check if we have available IDs
    if not available_ids:
        await websocket.close(code=1003)  # Close connection if full
        return

    # Assign an ID and accept the connection
    player_id = available_ids.pop(0)
    await websocket.accept()

    await websocket.send_json({"id": player_id})
    
    connected_clients[player_id] = websocket

    try:
        while True:
            data = await websocket.receive_text()

            # Assuming the data is JSON-formatted
            try:
                json_data = json.loads(data)
                print("Received data from client:", json_data)
                # Check for a specific request property in the JSON
                if json_data.get("request") == "get_data":
                    response_data = load_cards()  # Call load_cards function
                    await websocket.send_text(response_data)  # Send response back to client

            except json.JSONDecodeError:
                # Handle case where data is not valid JSON
                print("Received non-JSON data:", data)

            # Continue with your logic...
    except Exception as e:
        # Handle disconnection or errors
        print(f"Error: {e}")
    finally:
        # Remove client and make ID available again
        del connected_clients[player_id]
        available_ids.append(player_id)  # Make this ID available again


def read_root():
    print('hi')
    
    return {"Hello": "World"}


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
