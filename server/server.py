from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import functionality
import json
import random
import traceback


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
    global play, player_0_ready, player_1_ready, cards_1, cards_2, cur_turn, combined_json
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
                if not player_0_ready or not player_1_ready:
                    if json_data.get("ready_to_play") == True:
                        cur_id = json_data.get('id')
                        if cur_id == 0:
                            player_0_ready = True
                        if cur_id == 1:
                            player_1_ready = True
                        if player_1_ready and player_0_ready:
                            setup_game()
                            play = True
                            # first_player_response, second_player_response = load_cards()  # Call load_cards function
                            first_player_response  =  json.dumps([combined_json["player_0"][0]])
                            second_player_response = json.dumps([combined_json["player_1"][0]])
                            await connected_clients[0].send_json({"state": "both_ready", "data": first_player_response, "your_turn": cur_turn == 0, "num_cards": len(combined_json["player_0"])})  # Send response back to client
                            await connected_clients[1].send_json({"state": "both_ready",  "data": second_player_response, "your_turn": cur_turn == 1, "num_cards": len(combined_json["player_1"])})
                print(player_0_ready, player_1_ready, play)

                if play and 'choice' in json_data:
                    choice = json_data.get("choice")
                    response_data = execute_turn(choice)#some function that compares both data and sends 
                    # print('response_data', response_data)
                    if not response_data: #if response data == false (one player won)
                        for player_id, websocket in connected_clients.items():
                            await websocket.send_json(json.dumps({"state": "game_won" if cur_turn == i else "game_lost"}))
                    else:
                        for player_id, websocket in connected_clients.items():
                            # if player_id == 1:
                            #     continue #NOTE: TEMPORARY
                            print(player_id)
                            player_data = json.dumps([combined_json[f"player_{player_id}"][0]])
                            await websocket.send_json(json.dumps({
                                "state": "round_won" if cur_turn == player_id else "round_lost",
                                "data": player_data,
                                "your_turn": json.dumps(cur_turn == player_id)  # Add this line
                            }))
                            print('done with sending')
            except json.JSONDecodeError as e:
                print(
                    'json error OCCURED'
                )
                # Handle case where data is not valid JSON
                # print(f"Error: {e.with_traceback()}")

    except Exception as e:
        print("EXCEPTION OCCURED")
        traceback.print_exc()
        # Handle disconnection or errors
        # print(f"Error: {e.with_traceback()}")
    finally:
        play = player_0_ready = player_1_ready = False
        cards_1, cards_2, cur_turn = None, None, -1
        # Remove client and make ID available again
        if player_id == 0:
            player_0_ready = False
        else:
            player_1_ready = False
        # play = False
        del connected_clients[player_id]

        print("LOST SOCKET")
        available_ids.append(player_id)  # Make this ID available again
        


def execute_turn(choice: str):
    global combined_json, cur_turn
    print(choice)
    print(combined_json['player_0'][0])
    value_player_0 = combined_json['player_0'][0][choice]
    value_player_1 = combined_json['player_1'][0][choice]

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


    # print("FINISHED")
    if combined_json["player_0"][0] and combined_json["player_1"][0]:
        return True
    return False
    # return json.dumps([combined_json["player_0"][0]]), json.dumps([combined_json["player_1"][0]])
    # return False



def read_root():
    return {"Hello": "World"}

def setup_game():
    global combined_json, cur_turn

    data = functionality.get_data(2015)
    cards_1, cards_2 = functionality.get_cards(data)

    # Retrieve URLs for cards_1
    urls_1 = [functionality.get_url(card, 'data/image_links/2015_images.txt') for card in cards_1.itertuples(index=False)]
    # urls_flags_1 = [functionality.get_country_url(card, 'data/country_flags.txt') for card in cards_1.itertuples(index=False)]

    # Retrieve URLs for cards_2
    urls_2 = [functionality.get_url(card, 'data/image_links/2015_images.txt') for card in cards_2.itertuples(index=False)]
    # urls_flags_2 = [functionality.get_country_url(card, 'data/country_flags.txt') for card in cards_2.itertuples(index=False)]



    # Convert DataFrames to JSON and add URLs
    json_df1 = json.loads(cards_1.to_json(orient='records'))
    for index, url in enumerate(urls_1):
        json_df1[index]['url'] = url
        # json_df1[index]['country_url'] = urls_flags_1[index]

    json_df2 = json.loads(cards_2.to_json(orient='records'))
    for index, url in enumerate(urls_2):
        json_df2[index]['url'] = url
        # json_df2[index]['country_url'] = urls_flags_2[index]


    # Set the current turn to a random number 0 or 1
    cur_turn = random.randint(0, 1)

    # Combine JSON data for both players
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


