# Permalist

## Modified Version Screenshots

![permalist modified version screenshot #1 - main page](screenshots/permalist-modified-screenshot1.jpg)
![permalist modified version screenshot #2 - main page responsive](screenshots/permalist-modified-screenshot1-responsive.jpg)
![permalist modified version screenshot #3 - auth page](screenshots/permalist-modified-screenshot3-responsive2.jpg)
![permalist modified version screenshot #2 - auth page responsive](screenshots/permalist-modified-screenshot2-responsive.jpg)

## Original Version Screenshot

![permalist original version screenshot](screenshots/permalist-original-screenshot.jpg)

## About the App

To-do list app which, upon logging in or registering (with email or OAuth 2.0),\
saves and loads items using database (PostgreSQL).\

This project came from a Udemy course by Angela Yu, The Complete 2024 Web Development Bootcamp.\
I modified it the following way:

1. Add authentication
   - Bcrypt with email and password
   - OAuth 2.0 with Discord, GitHub, and Google
2. Add new features
   - Date and day
   - Autofocus on input when editing an item
   - Reload on clicking outside the to-do list or pressing esc
   - Prevent ejs crash from having 0 items by adding "<%= locals.items && ..."
3. Rework UX
4. Minimize codes (most notably css)
