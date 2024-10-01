
/*
Possible Yards: A drive summary statistic that tracks the yards earned by an offensive team and the maximum yards they could have earned on a single drive.

    "game_id": 2024090500,
    "team_1": "KC",
    "team_2": "BAL",
    "game_date": "2024-09-05",
    "team": "KC",
    "drive": 1,
    "possible_yards": 67,
    "drive_outcome": "TOUCHDOWN",
    "gained_yards": 67

*/


interface PossibleYardageDriveRecord{
    game_id: string;
    team_1: string;
    team_2: string;
    game_date: string;
    team: string;
    drive: number;
    possible_yards: number;
    drive_outcome: string;
    gained_yards: number
}

export {
    PossibleYardageDriveRecord
}