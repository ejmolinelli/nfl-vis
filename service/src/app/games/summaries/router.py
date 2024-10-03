'''
Game Summaries
'''
import os

from fastapi import APIRouter
from pandas import read_parquet
from numpy import int64
from src import DATA_DIRECTORY

summaries = APIRouter(prefix="/summaries")

# get all games by year
@summaries.get('/games/')
def get_all_games_by_year():
    # read data
    data_filepath = os.path.join(DATA_DIRECTORY, f'game_drive_summary_2024.pq')
    df = read_parquet(data_filepath, engine='fastparquet')
    
    return df[['game_id','team_1','team_2']].drop_duplicates().to_dict(orient='records')
    

# get drive summary for a single game
@summaries.get('/{game_id}/drive_summary')
def get_single_game_drive_summary(game_id:int):
    # read data
    data_filepath = os.path.join(DATA_DIRECTORY, f'game_drive_summary_2024.pq')
    df = read_parquet(data_filepath, engine='fastparquet')
    
    # filter by game id
    df = df[df['game_id'] == game_id]
    
    # serialize as records
    return df.to_dict(orient='records')


# get drive summary for every week in a single game week e.g. week 1 week 17
@summaries.get('/year/{year}/gameweek/{gameweek}/drive_summary')
def get_gameweek_drive_summaries():
    pass


# get drive summary for a single team for a year
@summaries.get('/year/{year}/team/{team}')
def get_team_drive_summary():
    pass