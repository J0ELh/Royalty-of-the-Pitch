import requests
from bs4 import BeautifulSoup
import time


base_url = 'https://www.fifaindex.com/players/fifa20_419/'
filename = 'data/image_links/2020_images.txt'  # File where data will be saved
page_number = 1

while True:
    current_page = f"{base_url}?page={page_number}"
    response = requests.get(current_page)
    html = response.content
    soup = BeautifulSoup(html, 'html.parser')

    figures = soup.find_all('figure', class_='player')
    if not figures:
        break  # Break the loop if no player data is found

    with open(filename, 'a', encoding='utf-8') as file:  # Open file in append mode with UTF-8 encoding
        for figure in figures:
            a_tag = figure.find('a', class_='link-player')
            img_tag = figure.find('img')

            if a_tag and img_tag:
                title = a_tag.get('title')
                img_src = img_tag.get('src')
                file.write(f"{title}, {img_src}\n")  # Write to file

    page_number += 1  # Increment the page number for the next iteration
    time.sleep(0.4)  # Sleep for 1 second to be polite with the server
