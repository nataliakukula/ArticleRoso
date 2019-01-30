# Mongo Scraper

**App:** SoundCloud Mong Sraper \
**Created for:** Northwestern Coding Bootcamp \
**Developer:** Natalia Kukula \
**Deployment Date:**  February 1, 2019 \
**Published:** Heroku <https://lit-inlet-10505.herokuapp.com> \
**Built with:** Node.js, HTML5, CSS3, Javascript, jQuery & MongoDB \
**NPM:** express, express-handlebars, pupperteer, cheerio, mongoose \
**Browser enivironment for scraping:** Google Chrome

## Summary: 
* This app utilizes `puppeteer` and `cheerio` to scrape the SoundCloud website (https://soundcloud.com/)

  * Puppeteer reads the screen for dynamic data in headless Chrome
    
* The user can:

  * Scrape playlists
  * Save a playlist
  * Delete a saved playlist
  * Clear the scraped playlists
  * Add a note to any saved playlist
  * Update a note
  
## Web view:
![Playlists](/public/images/Screen1.png)
&nbsp;
![Scrapes](/public/images/Screen2.png)

## Future Development:

This is an MVP that utilizes CRUD functionality to save data in MongoDB, and therefore serves as a good example of a RESTful API and how to use the mongoose npm package and set up an express server in node.js. Otherwise, it could be developed to scrape playlists from the web and for users to save references to free music streaming in their accounts. However, I would reccommend to access API sources rather than scrape, not only because puppeteer is an inefficient compromise to scrape dynamic HTML, but also because it would minimize admin support.