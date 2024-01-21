from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import functionality
import json
import random


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


play = player_0_ready = player_1_ready = False
cards_1, cards_2, cur_turn = None, None, -1
combined_json = None

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global play, player_0_ready, player_1_ready, cur_turn

    print('something')

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
            print("test")
            # Assuming the data is JSON-formatted
            try:
                json_data = json.loads(data)
                print("Received data from client:", json_data)
                # Check for a specific request property in the JSON
                if not player_0_ready or not player_1_ready:
                    if json_data.get("ready_to_play") == True:
                        cur_id = json_data.get('id')
                        print(cur_id)
                        if cur_id == 0:
                            player_0_ready = True
                        if cur_id == 1:
                            player_1_ready = True
                        if player_1_ready and player_0_ready:
                            setup_game()
                            play = True
                            # first_player_response, second_player_response = load_cards()  # Call load_cards function
                            websocket.send_json({"something": "test"})
                            print(combined_json)
                            first_player_response  =  json.dumps([combined_json["player_0"][0]])
                            second_player_response = json.dumps([combined_json["player_1"][0]])
                            await connected_clients[0].send_json({"state": "both_ready", "data": first_player_response, "your_turn": cur_turn == 0})  # Send response back to client
                            await connected_clients[1].send_json({"state": "both_ready",  "data": second_player_response, "your_turn": cur_turn == 1})
                print(player_0_ready, player_1_ready, play)

                if play:    
                    choice = json_data.get("choice")
                    # response_data = execute_turn(choice)#some function that compares both data and sends 
                    # if not response_data: #if response data == false (one player won)
                    #     for i, ws in enumerate(connected_clients):
                    #         await ws.send_json(json.dumps({"state": "game_won" if cur_turn == i else "game_lost"}))
                    # else:
                    #     for i, ws in enumerate(connected_clients):
                    #         await ws.send_json(json.dumps({"state": "won" if cur_turn == i else "lost", "data": response_data[i]}))

            except json.JSONDecodeError:
                # Handle case where data is not valid JSON
                print("Received non-JSON data:", data)

    except Exception as e:
        # Handle disconnection or errors
        print(f"Error: {e}")
    finally:
        # Remove client and make ID available again
        del connected_clients[player_id]
        available_ids.append(player_id)  # Make this ID available again


def execute_turn(choice: int):
    global combined_json, cur_turn
    value_player_0 = combined_json['player_0'][0].index[choice]
    value_player_1 = combined_json['player_1'][0].index[choice]

    winner_index = -1
    if value_player_0 > value_player_1:
        winner_index = 0
    else:
        winner_index = 1

    # Transferring cards based on the winner
    if winner_index == 1:
        cur_turn = 1
        combined_json['player_1'].append(combined_json['player_0'].pop(0))
        combined_json['player_1'].append(combined_json['player_1'].pop(0))
    else:
        cur_turn = 0
        combined_json['player_0'].append(combined_json['player_1'].pop(0))
        combined_json['player_0'].append(combined_json['player_0'].pop(0))


    # if combined_json["player_0"][0] and combined_json["player_1"][0]:
    # return json.dumps([combined_json["player_0"][0]]), json.dumps([combined_json["player_1"][0]])
    # return False


def read_root():
    print('hi')
    
    return {"Hello": "World"}

def setup_game():
    global combined_json, cur_turn

    data = functionality.get_data(2015)
    cards_1, cards_2 = functionality.get_cards(data)

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

    # Set the current turn to a random number 0 or 1
    cur_turn = random.randint(0, 1)

    # Combine JSON data for both players
    global combined_json
    combined_json = {
        "player_0": json_df1,
        "player_1": json_df2,
    }






# def load_cards():
#     data = functionality.get_data(2015)
#     cards_1, cards_2, all_cards = functionality.get_cards(data)

#     # Retrieve URLs for cards_1
#     urls_1 = [functionality.get_url(card, 'data/image_links/2015_images.txt') for card in cards_1.itertuples(index=False)]

#     # Retrieve URLs for cards_2
#     urls_2 = [functionality.get_url(card, 'data/image_links/2015_images.txt') for card in cards_2.itertuples(index=False)]

#     # Convert DataFrames to JSON and add URLs
#     json_df1 = json.loads(cards_1.to_json(orient='records'))
#     for index, url in enumerate(urls_1):
#         json_df1[index]['url'] = url

#     json_df2 = json.loads(cards_2.to_json(orient='records'))
#     for index, url in enumerate(urls_2):
#         json_df2[index]['url'] = url

#     # Combine JSON data for both players
#     combined_json = {
#         "player_1": json_df1,
#         "player_2": json_df2,
#     }

#     return json.dumps(combined_json)
