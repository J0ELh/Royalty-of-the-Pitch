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


player_0_ready = player_1_ready = False
cards_1, cards_2, cur_turn = None, None, -1
combined_json = None


def print_cards(cards, player):
    print(player)
    for i, card in enumerate(cards):
        print(card['long_name'])
    print('\n===================')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("ENTERING WEBSOCKET ENDPOINT")
    global player_0_ready, player_1_ready, cards_1, cards_2, cur_turn, combined_json
    # Check if we have available IDs
    if not available_ids:
        await websocket.close(code=1003)  # Close connection if full
        return

    # Assign an ID and accept the connection
    player_id = available_ids.pop(0)
    await websocket.accept()
    print(f"connected with websocket {player_id}")

    await websocket.send_json({"id": player_id})
    
    connected_clients[player_id] = websocket
    

    try:
        while True:
            print(f'websocket {player_id} waiting for data')
            data = await websocket.receive_text()
            print(f'websocket {player_id} received data')

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
                            first_player_response  =  json.dumps([combined_json["player_0"][0]])
                            second_player_response = json.dumps([combined_json["player_1"][0]])
                            await connected_clients[0].send_json({
                                "state": "both_ready", 
                                "current_card": first_player_response, 
                                "current_card_opponent": second_player_response, 
                                "your_turn": cur_turn == 0, 
                                "num_cards": len(combined_json["player_0"])
                                })  # Send response back to client
                            await connected_clients[1].send_json({
                                "state": "both_ready",  
                                "current_card": second_player_response, 
                                "current_card_opponent": first_player_response, 
                                "your_turn": cur_turn == 1, 
                                "num_cards": len(combined_json["player_1"])
                                })
                            # print_cards(combined_json["player_0"], "player 0:")
                            # print_cards(combined_json["player_1"], "player 1:")

                print(player_0_ready, player_1_ready)
                print(f"player_0_ready {player_0_ready} and player_1_ready {player_1_ready} and 'choice' in json_data {'choice' in json_data} and 'id' in json_data {'id' in json_data} and json_data['id'] == cur_turn {json_data['id'] == cur_turn if 'id' in json_data else ''}")
                if player_0_ready and player_1_ready and 'choice' in json_data and "id" in json_data and json_data["id"] == cur_turn:
                    choice = json_data.get("choice")
                    old_player_0_card = json.dumps([combined_json[f"player_{0}"][0]])
                    old_player_1_card = json.dumps([combined_json[f"player_{1}"][0]])
                    response_data = execute_turn(choice)#some function that compares both data and sends 
                    # print('response_data', response_data)
                    if not response_data: #if response data == false (one player won)
                        await connected_clients[0].send_json({"state": "game_won" if cur_turn == 0 else "game_lost"})
                        await connected_clients[1].send_json({"state": "game_won" if cur_turn == 1 else "game_lost"})

                    else:
                        await connected_clients[0].send_json({
                            "state": "round_won" if cur_turn == 0 else "round_lost", 
                            "current_card": json.dumps([combined_json[f"player_{0}"][0]]), 
                            "current_card_opponent": json.dumps([combined_json[f"player_{1}"][0]]),
                            "old_card": old_player_0_card,
                            "old_card_opponent": old_player_1_card,
                            "your_turn": cur_turn == 0,
                            "last_choice": choice,
                            })  # Send response back to client
                        await connected_clients[1].send_json({
                            "state": "round_won" if cur_turn == 1 else "round_lost", 
                            "current_card": json.dumps([combined_json[f"player_{1}"][0]]), 
                            "current_card_opponent": json.dumps([combined_json[f"player_{0}"][0]]), 
                            "old_card": old_player_1_card,
                            "old_card_opponent": old_player_0_card,
                            "your_turn": cur_turn == 1,
                            "last_choice": choice,
                            })
                        print('done with sending')
                        print(choice)
                        print_cards(combined_json["player_0"], "player 0:")
                        print_cards(combined_json["player_1"], "player 1:")
            except json.JSONDecodeError as e:
                traceback.print_exc()
                print(
                    'json error OCCURED'
                )
                # Handle case where data is not valid JSON
                print(f"Error: {e.with_traceback(traceback.print_exc())}")

    except Exception as e:
        print("EXCEPTION OCCURED")
        
        # Handle disconnection or errors
        print(f"Error: {e.with_traceback(traceback.print_exc())}")
    finally:
        cards_1, cards_2, cur_turn = None, None, -1
        # Remove client and make ID available again
        if player_id == 0:
            player_0_ready = False
        else:
            player_1_ready = False
        del connected_clients[player_id]

        print("LOST SOCKET")
        available_ids.append(player_id)  # Make this ID available again
        


def execute_turn(choice: str):
    global combined_json, cur_turn

    value_player_0 = combined_json['player_0'][0][choice]
    value_player_1 = combined_json['player_1'][0][choice]

    print(combined_json['player_0'][0], combined_json['player_1'][0])

    winner_index = -1
    if value_player_0 > value_player_1:
        winner_index = 0
    elif value_player_0 < value_player_1:
        winner_index = 1
    else:
        winner_index = 1-cur_turn

    # Transferring cards based on the winner
    if winner_index == 1:
        cur_turn = 1
        combined_json['player_1'].append(combined_json['player_0'].pop(0))
        combined_json['player_1'].append(combined_json['player_1'].pop(0))
    elif winner_index == 0:
        cur_turn = 0
        combined_json['player_0'].append(combined_json['player_1'].pop(0))
        combined_json['player_0'].append(combined_json['player_0'].pop(0))
    else:
        ValueError("Invalid winner_index")

    print('num cards 0' ,len(combined_json["player_0"]), 'num cards 1' ,len(combined_json["player_1"]))

    # print("FINISHED")
    if len(combined_json["player_0"]) > 0 and len(combined_json["player_1"]) >0:
        return True
    return False


def read_root():
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
    combined_json = {
        "player_0": json_df1,
        "player_1": json_df2,
    }





