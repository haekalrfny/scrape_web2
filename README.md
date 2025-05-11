# Scraper API

A simple API that scrapes products from **eBay** using **Node.js**, **Express**, and **Puppeteer**.
It fetches product names, prices, links, and descriptions directly from eBay product pages.

## Features

* Scrapes **Nike** products from the first 3 pages on eBay.
* Fetches detailed product specifications.
* Exposes the scraped data via a clean API endpoint.

## Tech Stack

* Node.js
* Express
* Puppeteer
* dotenv

---

## Installation & Running the Project

1. **Clone the repository**

   ```bash
   git clone https://github.com/haekalrfny/scrape_web2.git
   cd scrape_web2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup the `.env` file**

   Create a `.env` file in the root directory and add:

   ```env
   PORT=3000
   ```

4. **Run the server**

   ```bash
   node index.js
   ```
---

## API Endpoint

### `GET /scrape-ebay`

Scrapes product data (up to 3 pages) and returns a JSON response.

#### Request

```http
GET /scrape-ebay
```

#### Response

```json
{
  "data": [
    {
      "name": "Nike Air Max 270",
      "price": "IDR120.00",
      "link": "https://www.ebay.com/itm/1234567890",
      "description": {
        "Brand": "Nike",
        "Style": "Sneakers",
        "Department": "Men"
      }
    },
    ...
  ]
}
```

---

## Notes

* This API uses **web scraping** — so it may take around 20-30 minutes depending on network speed and response time.
* This API does not use any AI or machine learning

---
