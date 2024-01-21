import pandas as pd
import random
import requests


def get_data(year = 2015):
    # print('in get_data')
    if year > 2020 or year < 2015:
        print('invalid year')
        year = 2015
    df=pd.read_csv(f"data/statistics/players_{year - 2000}.csv")


    
    return df[['long_name','short_name', 'nationality', 'club', 'age', 'height_cm', 'overall', 'potential', 'pace', 'shooting', 'dribbling']]

def get_cards(data: pd.DataFrame, k = 10):
    # print('in get_cards')
    if k % 2 == 1:
        print('invalid number of cards')
        k+=1

    data = data[data['overall'] >= 80]
    data =data.dropna()

    sampled_data = data.sample(10, replace=False)



    return sampled_data.iloc[:int(k/2)], sampled_data.iloc[int(k/2):]
    
# def print_card(card: pd.Series):

    
#     for i, attribute in enumerate(card):
#         if card.index[i]     == 'short_name' or card.index[i] == 'nationality' or card.index[i] == 'club':
#             print(f"{card.index[i]}: {attribute}")
#             continue
#         print(f'{i}) {card.index[i]}: {attribute}')

# def download_player_image(player_name, filename):
#     with open(filename, 'r', encoding='utf-8') as file:  # Specify UTF-8 encoding
#         for line in file:
#             name, url = line.strip().split(', ')
#             if player_name in name:
#                 response = requests.get(url)
#                 if response.status_code == 200:
#                     with open(player_name.replace(' ', '_') + '.png', 'wb') as img_file:
#                         img_file.write(response.content)
#                     print(f"Image of {player_name} downloaded successfully.")
#                     return
#     print(f"No image found for {player_name}.")


def get_url(card: pd.Series, filename):
    print('in get_url')

    player_name = card.short_name
    with open(filename, 'r', encoding='utf-8') as file:  # Specify UTF-8 encoding
        for line in file:
            name, url = line.strip().split(', ')
            if player_name in name:
                return url
    return 'https://fifastatic.fifaindex.com/FIFA15/images/players/5/0.png'


# def main():
#     data = get_data()

#     for index in range(len(data)):
#         print(get_url(data.iloc[index], 'players_data.txt'))
#     exit()

    user_1_cards, user_2_cards, _ = get_cards(data)


    current_turn = random.randint(0, 1)


    player_cards = [user_1_cards, user_2_cards]
    game_over = False
    while not game_over:
        print('--User_1--')
        print_card(user_1_cards.iloc[0])
        print('--User_2--')
        print_card(user_2_cards.iloc[0])
        

        print('\n\n')
        if current_turn == 0:
            print("Player 1 turn")
        else:
            print("Player 2 turn")
        choice = -1
        while choice < 0:
            choice = int(input("Enter the number of your choice:  "))

        print(f'You chose: {player_cards[current_turn].iloc[0].index[choice]}')
        value_player_1 = player_cards[0].iloc[0].index[choice]
        value_player_2 = player_cards[1].iloc[0].index[choice]
        print(f"Player 1: {value_player_1} VS Player 2: {value_player_2}")
        winner_index = -1
        if value_player_1 > value_player_2:
            winner_index = 0
        else:
            winner_index = 1
        print(f"Player {winner_index + 1} wins this turn:")
        print(player_cards[winner_index].iloc[0])
        if winner_index == 0:
            current_turn = 0
            # Move first row of df1 to the end of df1
            player_cards[0] = pd.concat([player_cards[0].iloc[1:], player_cards[0].iloc[:1]])
            # Move first row of df2 to the end of df1
            player_cards[0] = pd.concat([player_cards[0], player_cards[1].iloc[:1]])
            # Remove the first row from df2
            player_cards[1] = player_cards[1].iloc[1:]
        elif winner_index == 1:
            current_turn = 1
            # Move first row of df2 to the end of df2
            player_cards[1] = pd.concat([player_cards[1].iloc[1:], player_cards[1].iloc[:1]])
            # Move first row of df1 to the end of df2
            player_cards[1] = pd.concat([player_cards[1], player_cards[0].iloc[:1]])
            # Remove the first row from df1
            player_cards[0] = player_cards[0].iloc[1:]

        if player_cards[0].empty:
            print("player 2 wins")
            game_over = True
        if player_cards[1].empty:
            print("player 1 wins")
            game_over = True
        print('\n\n\n=======================================\n\n\n')
        

        


        



    
    
    





# if __name__ == "__main__":
#     main()