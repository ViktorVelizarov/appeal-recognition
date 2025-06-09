const axios = require('axios');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const cheerio = require('cheerio');

class ShoppingService {
    constructor() {
        this.ebayAppId = process.env.EBAY_APP_ID;
        this.baseUrl = 'https://api.ebay.com/buy/browse/v1';
        // Initialize Google Cloud Vision client
        this.visionClient = new vision.ImageAnnotatorClient({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
    }

    async searchSimilarItems(imagePath) {
        try {
            // First, analyze the image to get product details
            const imageBuffer = fs.readFileSync(imagePath);
            const [imageAnalysis] = await this.visionClient.annotateImage({
                image: { content: imageBuffer.toString('base64') },
                features: [
                    { type: 'LABEL_DETECTION' },
                    { type: 'OBJECT_LOCALIZATION' },
                    { type: 'IMAGE_PROPERTIES' }
                ]
            });

            // Extract relevant labels and properties
            const labels = imageAnalysis.labelAnnotations.map(label => label.description);
            const dominantColors = imageAnalysis.imagePropertiesAnnotation.dominantColors.colors;
            
            // Search across multiple platforms
            const results = await Promise.all([
                this.searchAmazon(imageAnalysis, labels),
                this.searchZalando(imageAnalysis, labels),
                this.searchAsos(imageAnalysis, labels),
                this.searchHm(imageAnalysis, labels)
            ]);

            // Combine and sort results
            const combinedResults = results.flat().sort((a, b) => b.relevanceScore - a.relevanceScore);
            return combinedResults.slice(0, 10); // Return top 10 results
        } catch (error) {
            console.error('Error searching for similar items:', error);
            throw new Error('Failed to search for similar items');
        }
    }

    async searchAmazon(imageAnalysis, labels) {
        try {
            // Use Amazon Product Advertising API
            const response = await axios.get('https://webservices.amazon.com/paapi5/searchitems', {
                params: {
                    Keywords: labels.join(' '),
                    SearchIndex: 'Apparel',
                    ItemCount: 5,
                    Resources: ['ItemInfo.Title', 'Offers.Listings.Price', 'Images.Primary.Large']
                },
                headers: {
                    'X-Amz-Access-Token': process.env.AMAZON_ACCESS_TOKEN,
                    'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
                }
            });

            return response.data.SearchResult.Items.map(item => ({
                title: item.ItemInfo.Title.DisplayValue,
                price: item.Offers.Listings[0].Price.Amount,
                currency: item.Offers.Listings[0].Price.Currency,
                imageUrl: item.Images.Primary.Large.URL,
                itemUrl: item.DetailPageURL,
                platform: 'Amazon',
                relevanceScore: this.calculateRelevanceScore(item, imageAnalysis)
            }));
        } catch (error) {
            console.error('Amazon search error:', error);
            return [];
        }
    }

    async searchZalando(imageAnalysis, labels) {
        try {
            // Use Zalando API
            const response = await axios.get('https://api.zalando.com/articles', {
                params: {
                    q: labels.join(' '),
                    limit: 5
                },
                headers: {
                    'Authorization': `Bearer ${process.env.ZALANDO_API_KEY}`
                }
            });

            return response.data.content.map(item => ({
                title: item.name,
                price: item.units[0].price.value,
                currency: item.units[0].price.currency,
                imageUrl: item.media.images[0].largeUrl,
                itemUrl: item.shopUrl,
                platform: 'Zalando',
                relevanceScore: this.calculateRelevanceScore(item, imageAnalysis)
            }));
        } catch (error) {
            console.error('Zalando search error:', error);
            return [];
        }
    }

    async searchAsos(imageAnalysis, labels) {
        try {
            // Use ASOS API
            const response = await axios.get('https://api.asos.com/product/search/v1', {
                params: {
                    q: labels.join(' '),
                    limit: 5
                },
                headers: {
                    'X-ASOS-API-Key': process.env.ASOS_API_KEY
                }
            });

            return response.data.products.map(item => ({
                title: item.name,
                price: item.price.current.value,
                currency: item.price.current.currency,
                imageUrl: item.imageUrl,
                itemUrl: item.url,
                platform: 'ASOS',
                relevanceScore: this.calculateRelevanceScore(item, imageAnalysis)
            }));
        } catch (error) {
            console.error('ASOS search error:', error);
            return [];
        }
    }

    async searchHm(imageAnalysis, labels) {
        try {
            // Use H&M API
            const response = await axios.get('https://apidojo-hm-hennes-mauritz-v1.p.rapidapi.com/products/search', {
                params: {
                    query: labels.join(' '),
                    limit: 5
                },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'apidojo-hm-hennes-mauritz-v1.p.rapidapi.com'
                }
            });

            return response.data.results.map(item => ({
                title: item.name,
                price: item.price.value,
                currency: item.price.currency,
                imageUrl: item.images[0].url,
                itemUrl: item.link,
                platform: 'H&M',
                relevanceScore: this.calculateRelevanceScore(item, imageAnalysis)
            }));
        } catch (error) {
            console.error('H&M search error:', error);
            return [];
        }
    }

    calculateRelevanceScore(item, imageAnalysis) {
        // Implement a scoring algorithm based on:
        // - Visual similarity
        // - Color matching
        // - Price range
        // - Brand relevance
        // This is a simplified version
        let score = 0;
        
        // Check color similarity
        const itemColors = this.extractColors(item);
        const imageColors = imageAnalysis.imagePropertiesAnnotation.dominantColors.colors;
        score += this.compareColors(itemColors, imageColors);

        // Check label similarity
        const itemLabels = this.extractLabels(item);
        const imageLabels = imageAnalysis.labelAnnotations.map(label => label.description);
        score += this.compareLabels(itemLabels, imageLabels);

        return score;
    }

    extractColors(item) {
        // Extract color information from item data
        // This would need to be implemented based on the data structure
        return [];
    }

    extractLabels(item) {
        // Extract label information from item data
        // This would need to be implemented based on the data structure
        return [];
    }

    compareColors(itemColors, imageColors) {
        // Implement color comparison logic
        return 0;
    }

    compareLabels(itemLabels, imageLabels) {
        // Implement label comparison logic
        return 0;
    }

    // Enhanced reverse image search using SerpAPI Google Lens
    async searchSimilarItemsWeb(imageUrl) {
        try {
            console.log('🔍 Starting Google Lens reverse image search for:', imageUrl);
            
            // Use SerpAPI to get Google Lens results (real reverse image search)
            const serpApiKey = process.env.SERPAPI_API_KEY;
            
            if (!serpApiKey) {
                console.log('⚠️ SERPAPI_API_KEY not found, using fallback search');
                return await this.searchFashionFallback();
            }

            // Call SerpAPI Google Lens API for actual reverse image search
            const response = await axios.get('https://serpapi.com/search.json', {
                params: {
                    engine: 'google_lens',
                    url: imageUrl,
                    api_key: serpApiKey,
                    hl: 'en',
                    country: 'us'
                },
                timeout: 10000
            });

            console.log('📊 SerpAPI response status:', response.status);

            if (!response.data.visual_matches && !response.data.products) {
                console.log('⚠️ No visual matches or products found, using fallback');
                return await this.searchFashionFallback();
            }

            const results = [];

            // Process visual matches (similar looking items)
            if (response.data.visual_matches) {
                console.log(`👀 Found ${response.data.visual_matches.length} visual matches`);
                response.data.visual_matches.slice(0, 8).forEach(match => {
                    results.push({
                        title: match.title || 'Similar Item',
                        imageUrl: match.image || match.thumbnail,
                        itemUrl: match.link,
                        thumbnail: match.thumbnail,
                        source: match.source || 'Shopping Site',
                        price: match.price,
                        snippet: 'Visually similar item',
                        confidence: 0.9
                    });
                });
            }

            // Process product matches if available
            if (response.data.products) {
                console.log(`🛍️ Found ${response.data.products.length} product matches`);
                response.data.products.slice(0, 4).forEach(product => {
                    results.push({
                        title: product.title || 'Similar Product',
                        imageUrl: product.image || product.thumbnail,
                        itemUrl: product.link,
                        thumbnail: product.thumbnail,
                        source: product.source || 'Shopping',
                        price: product.price,
                        snippet: 'Related product',
                        confidence: 0.95
                    });
                });
            }

            console.log(`✅ Google Lens found ${results.length} visually similar items`);
            
            // If we got results, return them. Otherwise fallback
            if (results.length > 0) {
                return this.removeDuplicates(results);
            } else {
                return await this.searchFashionFallback();
            }

        } catch (error) {
            console.error('❌ Google Lens search failed:', error.message);
            console.log('🔄 Falling back to enhanced fashion search');
            return await this.searchFashionFallback();
        }
    }

    // TinEye reverse image search (if available)
    async searchWithTinEye(imageUrl) {
        try {
            // Note: TinEye API requires subscription - this is a placeholder
            // You would need to implement actual TinEye API calls
            console.log('TinEye search not implemented - requires API subscription');
            return [];
        } catch (error) {
            console.error('TinEye search failed:', error);
            return [];
        }
    }

    // Google Lens-style search using Vision API
    async searchWithGoogleLens(imageUrl) {
        try {
            // Use Google Vision API to analyze the image and extract labels
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                const labels = await this.analyzeImageWithVision(imageUrl);
                return this.searchWithLabels(labels);
            }
            return [];
        } catch (error) {
            console.error('Google Lens-style search failed:', error);
            return [];
        }
    }

    // Yandex reverse image search
    async searchWithYandex(imageUrl) {
        try {
            // Yandex has good reverse image search capabilities
            const response = await axios.get('https://yandex.com/images/search', {
                params: {
                    url: imageUrl,
                    format: 'json'
                },
                timeout: 5000
            });
            
            // Parse Yandex results (simplified)
            return this.parseYandexResults(response.data);
        } catch (error) {
            console.error('Yandex search failed:', error);
            return [];
        }
    }

    // Analyze image with Google Vision API
    async analyzeImageWithVision(imageUrl) {
        try {
            const vision = require('@google-cloud/vision');
            const client = new vision.ImageAnnotatorClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
            });

            const [result] = await client.labelDetection(imageUrl);
            const labels = result.labelAnnotations || [];
            
            // Extract clothing/fashion related labels
            const fashionLabels = labels
                .filter(label => this.isFashionRelated(label.description))
                .map(label => label.description)
                .slice(0, 3);

            return fashionLabels;
        } catch (error) {
            console.error('Vision API analysis failed:', error);
            return [];
        }
    }

    // Check if a label is fashion-related
    isFashionRelated(label) {
        const fashionKeywords = [
            'clothing', 'apparel', 'fashion', 'shirt', 'dress', 'pants', 'jeans',
            'jacket', 'coat', 'shoes', 'boots', 'sneakers', 'hat', 'cap',
            'skirt', 'blouse', 'sweater', 'hoodie', 'suit', 'tie', 'scarf',
            'handbag', 'purse', 'bag', 'accessories', 'jewelry', 'watch'
        ];
        
        return fashionKeywords.some(keyword => 
            label.toLowerCase().includes(keyword)
        );
    }

    // Search using extracted labels
    async searchWithLabels(labels) {
        if (!labels || labels.length === 0) return [];

        try {
            const searchQuery = labels.join(' ') + ' fashion clothing buy';
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: process.env.GOOGLE_API_KEY,
                    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
                    searchType: 'image',
                    q: searchQuery,
                    imgType: 'photo',
                    imgSize: 'large',
                    num: 5
                }
            });

            if (!response.data.items) return [];

            return response.data.items.map(item => ({
                title: item.title || 'Fashion Item',
                imageUrl: item.link,
                itemUrl: item.image?.contextLink || item.displayLink,
                thumbnail: item.image?.thumbnailLink || item.link,
                source: item.displayLink || 'Shopping Search',
                confidence: 0.8 // Higher confidence for label-based search
            }));
        } catch (error) {
            console.error('Label-based search failed:', error);
            return [];
        }
    }

    // Parse Yandex results (simplified implementation)
    parseYandexResults(data) {
        try {
            // This would need to be implemented based on Yandex API response format
            // Returning empty array as placeholder
            return [];
        } catch (error) {
            console.error('Error parsing Yandex results:', error);
            return [];
        }
    }

    // Fallback fashion search
    async searchFashionFallback() {
        try {
            const fashionTerms = [
                'trendy fashion clothing',
                'latest fashion trends',
                'designer apparel',
                'stylish clothing',
                'fashion accessories'
            ];
            
            const randomTerm = fashionTerms[Math.floor(Math.random() * fashionTerms.length)];
            
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: process.env.GOOGLE_API_KEY,
                    cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
                    searchType: 'image',
                    q: randomTerm,
                    imgType: 'photo',
                    imgSize: 'large',
                    num: 5
                }
            });

            if (!response.data.items) return [];

            return response.data.items.map(item => ({
                title: item.title || 'Fashion Item',
                imageUrl: item.link,
                itemUrl: item.image?.contextLink || item.displayLink,
                thumbnail: item.image?.thumbnailLink || item.link,
                source: item.displayLink || 'Fashion Search',
                confidence: 0.6 // Lower confidence for random search
            }));
        } catch (error) {
            console.error('Fashion fallback search failed:', error);
            return [];
        }
    }

    // Remove duplicate results
    removeDuplicates(results) {
        const seen = new Set();
        return results.filter(item => {
            const key = item.imageUrl || item.title;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Add more methods for other shopping platforms if needed
    async searchAmazonItems(itemName) {
        // Implement Amazon search if needed
    }

    async searchFashionItems(itemName) {
        // Implement fashion-specific API search if needed
    }
}

module.exports = new ShoppingService(); 