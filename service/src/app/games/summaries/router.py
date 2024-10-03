'''
Game Summaries
'''
import os

from fastapi import APIRouter
from pandas import read_parquet, to_datetime
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
    
    
# get all games by year and team
@summaries.get('/games/team/{team}')
def get_all_games_by_year_team(team:str):
    # read data
    data_filepath = os.path.join(DATA_DIRECTORY, f'game_drive_summary_2024.pq')
    df = read_parquet(data_filepath, engine='fastparquet')
    
    # find games involving specified team
    team = team.upper()
    df = df[(df['team_1']==team) | (df['team_2']==team)]
    return df[['game_id','team_1','team_2']].drop_duplicates().to_dict(orient='records')


# get all games by year and gameweek
@summaries.get('/games/week/{week}')
def get_all_games_by_year_week(week:int):
    # read data
    data_filepath = os.path.join(DATA_DIRECTORY, f'game_drive_summary_2024.pq')
    df = read_parquet(data_filepath, engine='fastparquet')
    
    # convert to datetime
    df['game_date'] = to_datetime(df['game_date'])
    day1 = df['game_date'][0]
    
    # compute game week
    df['game_week'] = [(x-day1).days//7 + 1 for x in df['game_date'].values]
    
    return df[['game_id','team_1','team_2','game_week']][df['game_week']==week].drop_duplicates().to_dict(orient='records')

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


# get drive summary for every drive in a single game week e.g. week 1 week 17
@summaries.get('/year/{year}/gameweek/{gameweek}/drive_summary')
def get_gameweek_drive_summaries(year:int=2024, game_week:int=1):
    # read data
    data_filepath = os.path.join(DATA_DIRECTORY, f'game_drive_summary_2024.pq')
    df = read_parquet(data_filepath, engine='fastparquet')
    
    # convert to datetime
    df['game_date'] = to_datetime(df['game_date'])
    day1 = df['game_date'][0]
    
    # compute game week
    df['game_week'] = [(x-day1).days//7 + 1 for x in df['game_date'].values]
    
    return df[df['game_week']==game_week].to_dict(orient='records')
    


# get drive summary for a single team for a year
@summaries.get('/year/{year}/team/{team}')
def get_team_drive_summary(year:int, team:str):
    pass