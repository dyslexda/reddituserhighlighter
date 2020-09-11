# Reddit User Highlighter

**Table of Contents**

 - [Installation](#installation)
 - [Key Features](#key-features)
 - [Usage](#usage)

## Installation

 - This extension must be manually loaded into Chrome (no Firefox support as of now)
 - Download this repository in a folder
 - Open 'chrome://extensions/'
 - Click 'Load unpacked'
 - Select the top level folder (holding `manifest.json`), and click 'Select folder'
 - Options can be accessed either through the extension icon (circled H) or on its Details page

## Key Features

 - Highlights users new to a subreddit (based on their earliest detected comment, checked against desired window set in options)
 ![Highlights users](https://i.imgur.com/gHFqz3C.png)
 - Optionally appends an infobox to each comment to quickly scan a user's aggregate comment history, including previous five comments, recent (last 50), and all comments
 ![Previous five](https://i.imgur.com/GjAyrso.png)
 
 ![All comments](https://i.imgur.com/uovACfo.png)

## Usage

All options are set through the Options menu.

 - 'Activate extension' - On by default. Whether or not extension is active (does not require disabling through extension menu).
 - 'Infobox everywhere' - Off by default. Normally the infobox is only displayed on selected subreddits; checking this causes it to appear in every comment thread.
 - 'Add or remove subreddits' - Enter a subreddit's name (capitalization must match what is displayed in the address bar!) and desired timeframe for highlighting. 'Off' never highlights; the integers are in days, e.g., 2 means 'first detected comment was less than two days ago.' Must hit 'Add' to add it to the list.
 - 'Current subreddits' - List of all subreddits and timeframes. Can be removed with the 'Remove' button.
 - 'Save' - All changes listed above must be saved to take effect.
