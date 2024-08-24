const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache TTL of 5 minutes

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0NDk2NDE1LCJpYXQiOjE3MjQ0OTYxMTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjQ4MjI5NDU1LWMwY2ItNDkxNi1hNzRlLTU3OTRlZTBjZWZlZCIsInN1YiI6InNhaGlsYzc0MTFAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiI0ODIyOTQ1NS1jMGNiLTQ5MTYtYTc0ZS01Nzk0ZWUwY2VmZWQiLCJjbGllbnRTZWNyZXQiOiJ0YkVXVW5McENld2tJcmpqIiwib3duZXJOYW1lIjoiU2FoaWwiLCJvd25lckVtYWlsIjoic2FoaWxjNzQxMUBnbWFpbC5jb20iLCJyb2xsTm8iOiIxMDUxODAwMjcyMSJ9.rTBDAh9Oxoy3ENKsGyGEqMemOoAAYGqB2f3aX7J5x5w'; // Replace with your actual token
const BASE_URL = 'http://20.244.56.144/test/companies';

// Fetch products from the e-commerce API
async function fetchProductsFromAPI(company, category, top, minPrice, maxPrice) {
  const url = `${BASE_URL}/${company}/categories/${category}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    // Log the entire response for debugging
    console.log('Full API Response:', response);

    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    } else {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Error fetching products from API:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch products');
  }
}


// Generate a unique ID for a product
function generateUniqueId(companyId, productId) {
  return `${companyId}-${productId}`;
}

// Retrieve products with sorting and pagination
async function getProducts(category, n, page, sort) {
  const cacheKey = `${category}-${n}-${page}-${sort}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  let products = await fetchProductsFromAPI('AMZ', category, n, 1, 10000); // Assuming company 'AMZ' for example

  // Generate unique IDs for each product
  products = products.map((product, index) => ({
    ...product,
    id: generateUniqueId(index, product.id)
  }));

  // Sorting logic
  if (sort) {
    const [field, order] = sort.split(':');
    products.sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }

  // Pagination logic
  const startIndex = (page - 1) * n;
  const paginatedProducts = products.slice(startIndex, startIndex + n);

  cache.set(cacheKey, paginatedProducts);
  return paginatedProducts;
}

// Retrieve details of a specific product
async function getProductById(category, productId) {
  const products = await getProducts(category, 10, 1, '');
  return products.find(product => product.id === productId);
}

module.exports = {
  getProducts,
  getProductById
};
