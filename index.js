import express from "express";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Base URL for eBay search
const BASE_URL =
  "https://www.ebay.com/sch/i.html?_from=R40&_nkw=nike&_sacat=0&rt=nc&_pgn=";

// Main function to scrape products from multiple pages
async function scrapeAllProducts() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let currentPage = 1;
  let allProducts = [];

  while (currentPage <= 3) {
    // Limit scraping to 3 pages
    const url = `${BASE_URL}${currentPage}`;
    console.log(`Scraping page: ${currentPage}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Scrape product info from current page
    const productsOnPage = await page.$$eval(".s-item", (items) =>
      items
        .filter((item) => {
          const title = item.querySelector(".s-item__title");
          const price = item.querySelector(".s-item__price");
          return title && price;
        })
        .map((item) => {
          const titleElement = item.querySelector(".s-item__title");
          const priceElement = item.querySelector(".s-item__price");
          const linkElement = item.querySelector(".s-item__link");

          return {
            name: titleElement ? titleElement.innerText : "-",
            price: priceElement ? priceElement.innerText : "-",
            link: linkElement ? linkElement.href : "-",
          };
        })
    );

    // Stop if no products found
    if (productsOnPage.length === 0) break;

    // For each product, scrape its description page
    for (let product of productsOnPage) {
      if (product.link !== "-") {
        const description = await scrapeProductDescription(
          browser,
          product.link
        );
        product.description = description;
      } else {
        product.description = "-";
      }
    }

    allProducts = allProducts.concat(productsOnPage); // Add products to final result
    currentPage++; // Move to next page
  }

  await browser.close();
  return allProducts;
}

// Function to scrape product details from product page
async function scrapeProductDescription(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2" }); // Wait until page loads

    // Scrape item specifics
    const itemSpecifics = await page.$$eval(
      'dl[data-testid="ux-labels-values"]',
      (items) => {
        const specs = {};
        items.forEach((item) => {
          const labelEl = item.querySelector("dt .ux-textspans");
          const valueEl = item.querySelector("dd .ux-textspans");
          const label = labelEl ? labelEl.innerText.trim() : null;
          const value = valueEl ? valueEl.innerText.trim() : null;

          if (label && value) {
            specs[label] = value;
          }
        });
        return specs;
      }
    );

    return Object.keys(itemSpecifics).length === 0 ? "-" : itemSpecifics;
  } catch (err) {
    console.error("Error scraping description:", err);
    return "-";
  } finally {
    await page.close();
  }
}

// API endpoint to trigger scraping
app.get("/scrape-ebay", async (req, res) => {
  try {
    const data = await scrapeAllProducts(); // Call scrape function
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
