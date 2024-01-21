import pandas as pd

# Replace 'your_file.csv' with the path to your CSV file
file_path = 'data/image_csvs/flags.csv'

# Load the CSV file into a DataFrame with the correct delimiter
data = pd.read_csv(file_path, delimiter=';')

# Specify the path for the text file where you want to write the data
output_file_path = 'output.txt'

# Write the 'name' and 'image' columns to a text file
data[['name', 'image']].dropna().to_csv(output_file_path, sep='\t', index=False, header=True)
