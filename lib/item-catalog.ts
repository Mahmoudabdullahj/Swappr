export interface SpecField {
  key: string;
  label: string;
  type: 'select' | 'text';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  brands?: string[]; // if set, only show this field when selectedBrand is in this list
}

export interface BrandEntry {
  name: string;
  models: string[];
}

export interface CategoryConfig {
  slug: string;
  name: string;
  emoji: string;
  brands?: BrandEntry[];
  types?: string[];
  specs: SpecField[];
}

export const CATALOG: CategoryConfig[] = [
  {
    slug: 'phones',
    name: 'Phones',
    emoji: '📱',
    brands: [
      { name: 'Apple', models: ['iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17 Air', 'iPhone 17', 'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro Max', 'iPhone 12', 'iPhone 11', 'iPhone SE (3rd gen)'] },
      { name: 'Samsung', models: ['Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy S26', 'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy A56', 'Galaxy A55', 'Galaxy A35', 'Galaxy A25', 'Galaxy A15', 'Galaxy Z Fold 7', 'Galaxy Z Flip 7', 'Galaxy Z Fold 6', 'Galaxy Z Flip 6'] },
      { name: 'Huawei', models: ['Pura 80 Pro', 'Pura 70 Pro+', 'Pura 70 Pro', 'Mate 70 Pro', 'Mate 60 Pro', 'Nova 13 Pro', 'Nova 12 Pro'] },
      { name: 'Xiaomi', models: ['Xiaomi 15 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 15', 'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Redmi Note 14 Pro+', 'Redmi Note 14 Pro', 'Redmi Note 13 Pro', 'Poco X7 Pro', 'Poco F7', 'Poco M6 Pro'] },
      { name: 'OnePlus', models: ['OnePlus 13', 'OnePlus 13R', 'OnePlus 12', 'OnePlus 11', 'OnePlus Open', 'OnePlus Nord 4', 'OnePlus Nord CE 4'] },
      { name: 'Google', models: ['Pixel 9a', 'Pixel 9 Pro XL', 'Pixel 9 Pro Fold', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 8a', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7'] },
      { name: 'Sony', models: ['Xperia 1 VII', 'Xperia 5 VII', 'Xperia 1 VI', 'Xperia 5 VI', 'Xperia 10 VI'] },
      { name: 'Oppo', models: ['Find X8 Ultra', 'Find X8 Pro', 'Find X8', 'Reno 13 Pro', 'Reno 12 Pro', 'A60'] },
      { name: 'Honor', models: ['Magic7 Pro', 'Magic7', 'Magic6 Pro', 'Honor 300 Pro', 'Honor 200 Pro', 'Honor 200', 'X9c'] },
      { name: 'Motorola', models: ['Edge 60 Pro', 'Edge 60', 'Edge 50 Pro', 'Moto G85', 'Moto G75', 'Moto G54'] },
      { name: 'Nokia', models: ['Nokia XR21', 'Nokia G42', 'Nokia G22'] },
      { name: 'Nothing', models: ['Nothing Phone (3)', 'Nothing Phone (2a) Plus', 'Nothing Phone (2a)', 'Nothing Phone (2)', 'Nothing Phone (1)'] },
    ],
    specs: [
      { key: 'storage', label: 'Storage', type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB'], required: true },
      { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Blue', 'Pink', 'Purple', 'Gold', 'Silver', 'Red', 'Green', 'Yellow', 'Natural Titanium', 'Black Titanium', 'Desert Titanium', 'White Titanium', 'Other'] },
    ],
  },
  {
    slug: 'laptops',
    name: 'Laptops',
    emoji: '💻',
    brands: [
      { name: 'Apple', models: ['MacBook Air 13" (M4)', 'MacBook Air 15" (M4)', 'MacBook Air 13" (M3)', 'MacBook Air 15" (M3)', 'MacBook Air 13" (M2)', 'MacBook Air 13" (M1)', 'MacBook Pro 14" (M4 Pro)', 'MacBook Pro 14" (M4 Max)', 'MacBook Pro 16" (M4 Pro)', 'MacBook Pro 16" (M4 Max)', 'MacBook Pro 14" (M3)', 'MacBook Pro 16" (M3)', 'MacBook Pro 13" (M2)'] },
      { name: 'Dell', models: ['XPS 13 (2024)', 'XPS 14', 'XPS 15', 'XPS 16', 'XPS 17', 'Inspiron 14', 'Inspiron 15', 'Inspiron 16', 'Latitude 5440', 'G15 Gaming', 'G16 Gaming', 'Alienware m16 R2', 'Alienware x16'] },
      { name: 'HP', models: ['Spectre x360 14"', 'Spectre x360 16"', 'Envy x360 13"', 'Envy x360 15"', 'Pavilion Plus 14', 'Pavilion 15', 'EliteBook 840 G11', 'Omen 16 (2024)', 'Victus 16 (2024)'] },
      { name: 'Lenovo', models: ['ThinkPad X1 Carbon Gen 12', 'ThinkPad E14 Gen 5', 'IdeaPad Slim 5', 'IdeaPad Pro 5', 'Legion 5i Gen 9', 'Legion 5 Gen 9', 'Legion 5 Pro Gen 9', 'Legion 7i Gen 9', 'Yoga 9i Gen 9', 'Yoga 7i Gen 9', 'LOQ 15i Gen 9'] },
      { name: 'ASUS', models: ['ZenBook 14 OLED (2024)', 'ZenBook S 13 OLED', 'VivoBook S 15', 'VivoBook 16', 'ROG Zephyrus G14 (2024)', 'ROG Zephyrus G16', 'TUF Gaming A15 (2024)', 'TUF Gaming F15 (2024)', 'ProArt StudioBook 16 (2024)'] },
      { name: 'Acer', models: ['Swift 14 AI', 'Swift Go 14', 'Aspire 5 (2024)', 'Nitro V 15', 'Predator Helios Neo 16', 'Predator Helios 18', 'Predator Triton Neo 16'] },
      { name: 'MSI', models: ['Prestige 13 AI', 'Modern 15 AI', 'Katana 15 B13', 'Stealth 16 AI Studio', 'Raider GE78 HX', 'Creator Z16 HX'] },
      { name: 'Samsung', models: ['Galaxy Book 5 Pro 360', 'Galaxy Book 5 Pro', 'Galaxy Book 5', 'Galaxy Book 4 Ultra', 'Galaxy Book 4 Pro', 'Galaxy Book 4', 'Galaxy Book 3 Pro'] },
      { name: 'Microsoft', models: ['Surface Pro 11', 'Surface Pro 10', 'Surface Laptop 7', 'Surface Laptop 6', 'Surface Laptop Studio 2'] },
      { name: 'Huawei', models: ['MateBook X Pro (2024)', 'MateBook D14 (2024)', 'MateBook D16 (2024)', 'MateBook 14s', 'MateBook 16s'] },
      { name: 'LG', models: ['gram 14 (2024)', 'gram 15 (2024)', 'gram 16 (2024)', 'gram 17 (2024)', 'gram SuperSlim'] },
      { name: 'Razer', models: ['Razer Blade 14 (2024)', 'Razer Blade 16 (2024)', 'Razer Blade 18 (2024)'] },
    ],
    specs: [
      { key: 'processor', label: 'Processor', type: 'select', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9', 'Apple M1', 'Apple M2', 'Apple M2 Pro', 'Apple M2 Max', 'Apple M3', 'Apple M3 Pro', 'Apple M3 Max', 'Apple M4', 'Apple M4 Pro', 'Apple M4 Max', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Qualcomm Snapdragon X'] },
      { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '24GB', '32GB', '48GB', '64GB', '128GB'], required: true },
      { key: 'storage', label: 'Storage', type: 'select', options: ['128GB', '256GB', '512GB', '1TB', '2TB', '4TB'], required: true },
      { key: 'screen_size', label: 'Screen Size', type: 'select', options: ['11"', '12"', '13"', '13.3"', '13.5"', '14"', '15"', '15.6"', '16"', '17"', '17.3"', '18"'] },
      { key: 'gpu', label: 'GPU', type: 'select', options: ['Integrated / None', 'NVIDIA RTX 5090', 'NVIDIA RTX 5080', 'NVIDIA RTX 5070', 'NVIDIA RTX 5060', 'NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA RTX 4070', 'NVIDIA RTX 4060', 'NVIDIA RTX 3060', 'NVIDIA GTX 1650', 'AMD Radeon RX 7900M', 'AMD Radeon RX 7600M', 'AMD Radeon RX 6700M', 'Apple GPU'] },
      { key: 'color', label: 'Color', type: 'select', options: ['Space Gray', 'Silver', 'Gold', 'Midnight', 'Starlight', 'Black', 'White', 'Blue', 'Green', 'Pink', 'Other'] },
    ],
  },
  {
    slug: 'tablets',
    name: 'Tablets',
    emoji: '🗒️',
    brands: [
      { name: 'Apple', models: ['iPad Pro 11" (M4)', 'iPad Pro 13" (M4)', 'iPad Air 11" (M3)', 'iPad Air 13" (M3)', 'iPad Air 11" (M2)', 'iPad Air 13" (M2)', 'iPad mini 7th gen', 'iPad mini 6th gen', 'iPad 10th gen', 'iPad 9th gen'] },
      { name: 'Samsung', models: ['Galaxy Tab S10 FE', 'Galaxy Tab S10 Ultra', 'Galaxy Tab S10+', 'Galaxy Tab S10', 'Galaxy Tab S9 FE', 'Galaxy Tab A9+', 'Galaxy Tab A9'] },
      { name: 'Lenovo', models: ['Tab P12 Pro', 'Tab P12', 'Tab P11 Pro Gen 2', 'Tab P11 Gen 2', 'Tab M10 Plus Gen 3'] },
      { name: 'Microsoft', models: ['Surface Pro 11', 'Surface Pro 10', 'Surface Pro 9', 'Surface Go 4'] },
      { name: 'Huawei', models: ['MatePad Pro 13.2"', 'MatePad Pro 12.6"', 'MatePad 12 X', 'MatePad 11.5"', 'MatePad SE 10.4"'] },
      { name: 'Amazon', models: ['Fire Max 11 (2023)', 'Fire HD 10 (2023)', 'Fire HD 8 (2022)', 'Fire 7 (2022)'] },
    ],
    specs: [
      { key: 'storage', label: 'Storage', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], required: true },
      { key: 'connectivity', label: 'Connectivity', type: 'select', options: ['Wi-Fi Only', 'Wi-Fi + Cellular'], required: true },
      { key: 'color', label: 'Color', type: 'select', options: ['Space Gray', 'Silver', 'Gold', 'Blue', 'Purple', 'Pink', 'Black', 'White', 'Other'] },
    ],
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    emoji: '🎮',
    brands: [
      { name: 'Sony (PlayStation)', models: ['PlayStation 5 Pro', 'PlayStation 5 Slim', 'PlayStation 5', 'PlayStation 4 Pro', 'PlayStation 4 Slim', 'PlayStation 4', 'PlayStation 3', 'PlayStation VR2', 'PSP', 'PS Vita'] },
      { name: 'Microsoft (Xbox)', models: ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox One'] },
      { name: 'Nintendo', models: ['Nintendo Switch 2', 'Nintendo Switch OLED', 'Nintendo Switch', 'Nintendo Switch Lite', 'Nintendo 3DS XL', 'Nintendo 2DS XL'] },
      { name: 'Controllers', models: ['DualSense (PS5)', 'DualShock 4 (PS4)', 'Xbox Wireless Controller', 'Xbox Elite Controller Series 2', 'Nintendo Pro Controller', 'Nintendo Joy-Con Pair', 'Razer Wolverine', 'Other Controller'] },
      { name: 'Gaming Accessories', models: ['Gaming Headset', 'Gaming Mouse', 'Gaming Keyboard', 'Gaming Monitor', 'Gaming Chair', 'Racing Wheel', 'VR Headset', 'Other'] },
    ],
    specs: [
      { key: 'storage', label: 'Storage', type: 'select', options: ['N/A', '250GB', '500GB', '1TB', '2TB'], brands: ['Sony (PlayStation)', 'Microsoft (Xbox)', 'Nintendo'] },
      { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Red', 'Blue', 'Purple', 'Gold', 'Other'] },
      { key: 'bundle', label: "What's Included", type: 'select', options: ['Console Only', 'Console + 1 Controller', 'Console + 2 Controllers', 'Console + Game(s)', 'Full Bundle'], brands: ['Sony (PlayStation)', 'Microsoft (Xbox)', 'Nintendo'] },
    ],
  },
  {
    slug: 'cameras',
    name: 'Cameras',
    emoji: '📷',
    brands: [
      { name: 'Canon', models: ['EOS R1', 'EOS R5 Mark II', 'EOS R5', 'EOS R5C', 'EOS R6 Mark II', 'EOS R7', 'EOS R8', 'EOS R10', 'EOS R50', 'EOS 90D', 'PowerShot G7X III'] },
      { name: 'Nikon', models: ['Z9', 'Z8', 'Z7 II', 'Z6 III', 'Z6 II', 'Z5 II', 'Zf', 'Z50 II', 'Z30', 'D850', 'D780'] },
      { name: 'Sony', models: ['Alpha A1 II', 'Alpha A1', 'Alpha A7R V', 'Alpha A7 IV', 'Alpha A7C II', 'Alpha A7CR', 'Alpha A6700', 'Alpha A6400', 'ZV-E1 II', 'ZV-1 II', 'ZV-E10 II', 'Cyber-shot RX100 VII'] },
      { name: 'Fujifilm', models: ['X-H2S', 'X-H2', 'X-T5', 'X-T4', 'X-S20', 'X-M5', 'X100VI', 'X-E4', 'GFX 100S II', 'GFX 50S II'] },
      { name: 'Panasonic', models: ['Lumix S5D', 'Lumix S5 II', 'Lumix S5 IIX', 'Lumix G9 II', 'Lumix GH7', 'Lumix GH6'] },
      { name: 'GoPro', models: ['GoPro Hero 13 Black', 'GoPro Hero 12 Black', 'GoPro Hero 11 Black', 'GoPro Hero 10 Black', 'GoPro Max'] },
      { name: 'DJI', models: ['Osmo Action 5 Pro', 'Osmo Action 4', 'DJI Pocket 3', 'DJI Mini 4 Pro', 'DJI Air 3S', 'DJI Air 3'] },
      { name: 'Leica', models: ['Leica Q3 43', 'Leica Q3', 'Leica M11-P', 'Leica M11', 'Leica SL3', 'Leica D-Lux 8'] },
    ],
    specs: [
      { key: 'type', label: 'Camera Type', type: 'select', options: ['Mirrorless', 'DSLR', 'Point & Shoot', 'Action Camera', 'Drone', 'Film Camera', 'Instant Camera'], required: true },
      { key: 'kit', label: "What's Included", type: 'select', options: ['Body Only', 'Body + Kit Lens', 'Body + Multiple Lenses', 'Full Kit with Accessories'] },
    ],
  },
  {
    slug: 'smartwatches',
    name: 'Smartwatches',
    emoji: '⌚',
    brands: [
      { name: 'Apple', models: ['Apple Watch Ultra 3', 'Apple Watch Series 11 46mm', 'Apple Watch Series 11 42mm', 'Apple Watch Ultra 2', 'Apple Watch Series 10 46mm', 'Apple Watch Series 10 42mm', 'Apple Watch Series 9 45mm', 'Apple Watch Series 9 41mm', 'Apple Watch SE (2nd gen) 44mm', 'Apple Watch SE (2nd gen) 40mm'] },
      { name: 'Samsung', models: ['Galaxy Watch 8 Ultra', 'Galaxy Watch 8 Classic 47mm', 'Galaxy Watch 8 Classic 43mm', 'Galaxy Watch 8 44mm', 'Galaxy Watch 8 40mm', 'Galaxy Watch 7 44mm', 'Galaxy Watch 7 40mm', 'Galaxy Watch Ultra', 'Galaxy Watch 6 Classic 47mm', 'Galaxy Watch 6 44mm'] },
      { name: 'Garmin', models: ['Fenix 8 Solar', 'Fenix 8', 'Forerunner 970', 'Forerunner 265', 'Venu 3', 'Venu 3S', 'Vivoactive 5', 'Epix Pro Gen 2'] },
      { name: 'Fitbit', models: ['Fitbit Sense 2', 'Fitbit Versa 4', 'Fitbit Charge 6', 'Fitbit Inspire 3'] },
      { name: 'Huawei', models: ['Watch GT 5 Pro', 'Watch GT 5 46mm', 'Watch GT 4 Pro', 'Watch GT 4 46mm', 'Watch 4 Pro', 'Band 9', 'Band 8 Pro'] },
      { name: 'Xiaomi', models: ['Xiaomi Watch S4', 'Xiaomi Watch S3', 'Xiaomi Watch 2 Pro', 'Redmi Watch 5', 'Redmi Watch 4', 'Mi Band 9 Pro'] },
      { name: 'Fossil', models: ['Fossil Gen 6', 'Fossil Hybrid HR'] },
    ],
    specs: [
      { key: 'connectivity', label: 'Connectivity', type: 'select', options: ['GPS + Cellular', 'GPS Only', 'Bluetooth Only'] },
      { key: 'color', label: 'Case / Band Color', type: 'select', options: ['Black', 'Silver', 'Gold', 'Rose Gold', 'White', 'Blue', 'Green', 'Red', 'Orange', 'Graphite', 'Starlight', 'Midnight', 'Titanium', 'Other'] },
    ],
  },
  {
    slug: 'headphones',
    name: 'Headphones',
    emoji: '🎧',
    brands: [
      { name: 'Apple', models: ['AirPods Max (USB-C)', 'AirPods Pro (2nd gen)', 'AirPods (4th gen) ANC', 'AirPods (4th gen)', 'AirPods (3rd gen)'] },
      { name: 'Sony', models: ['WH-1000XM6', 'WH-1000XM5', 'WH-1000XM4', 'WF-1000XM5', 'WF-1000XM4', 'WH-CH720N', 'LinkBuds Open', 'LinkBuds S'] },
      { name: 'Bose', models: ['QuietComfort Ultra Headphones', 'QuietComfort Ultra Earbuds', 'QuietComfort 45', 'QuietComfort Earbuds II'] },
      { name: 'Samsung', models: ['Galaxy Buds 3 Pro', 'Galaxy Buds 3', 'Galaxy Buds 2 Pro', 'Galaxy Buds 2', 'Galaxy Buds FE'] },
      { name: 'JBL', models: ['Tour Pro 3', 'Tour Pro 2', 'Tour One M2', 'Tune 770NC', 'Live Free 2'] },
      { name: 'Beats', models: ['Beats Powerbeats Pro 2', 'Beats Studio Pro', 'Beats Fit Pro', 'Beats Studio Buds+', 'Beats Solo 4'] },
      { name: 'Sennheiser', models: ['Momentum 4 Wireless', 'Momentum True Wireless 4', 'Momentum True Wireless 3', 'IE 200', 'IE 300', 'HD 560S'] },
      { name: 'Audio-Technica', models: ['ATH-M50xBT2', 'ATH-M50x', 'ATH-M40x', 'ATH-TWX9', 'ATH-CKS50TW'] },
      { name: 'Jabra', models: ['Evolve2 85', 'Elite 10 Gen 2', 'Elite 10', 'Elite 8 Active Gen 2', 'Elite 4'] },
      { name: 'Anker / Soundcore', models: ['Liberty 4 Pro', 'Liberty 4 NC', 'Space One Pro', 'Q45', 'A3i NC'] },
    ],
    specs: [
      { key: 'type', label: 'Type', type: 'select', options: ['True Wireless (TWS)', 'Over-ear', 'On-ear', 'In-ear (wired)', 'Neckband'], required: true },
      { key: 'anc', label: 'Noise Cancelling', type: 'select', options: ['Yes', 'No'] },
      { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Silver', 'Blue', 'Pink', 'Green', 'Red', 'Gold', 'Beige', 'Other'] },
    ],
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    emoji: '🔌',
    types: ['TV', 'Monitor', 'Speaker / Soundbar', 'Router / Networking', 'Projector', 'Printer / Scanner', 'Smart Home Device', 'Keyboard', 'Mouse', 'External Storage / SSD', 'Power Bank', 'Charger / Adapter', 'Cables & Accessories', 'Other Electronics'],
    specs: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Samsung, LG, Xiaomi' },
      { key: 'model_name', label: 'Model', type: 'text', placeholder: 'e.g. 55" QLED Q80C' },
    ],
  },
  {
    slug: 'furniture',
    name: 'Furniture',
    emoji: '🛋️',
    types: ['Sofa / Couch', 'Armchair', 'Dining Table', 'Coffee Table', 'Desk', 'Office Chair', 'Bed Frame', 'Mattress', 'Wardrobe / Closet', 'Bookshelf', 'TV Stand', 'Nightstand', 'Drawer Unit', 'Outdoor Furniture', 'Other Furniture'],
    specs: [
      { key: 'material', label: 'Material', type: 'select', options: ['Wood', 'Metal', 'Fabric', 'Leather', 'Plastic', 'Glass', 'Rattan', 'Mixed', 'Other'] },
      { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Brown', 'Grey', 'Beige', 'Blue', 'Green', 'Red', 'Wood Tone', 'Other'] },
    ],
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    emoji: '👗',
    types: ["Men's Clothing", "Women's Clothing", "Boys' Clothing", "Girls' Clothing", "Men's Shoes", "Women's Shoes", "Kids' Shoes", 'Bags & Handbags', 'Sunglasses', 'Jewelry & Accessories', 'Sportswear', 'Other Fashion'],
    specs: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Zara, H&M, Nike, Adidas' },
      { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'One Size', 'Other'] },
      { key: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'Grey', 'Brown', 'Blue', 'Navy', 'Red', 'Pink', 'Green', 'Yellow', 'Orange', 'Purple', 'Multicolor', 'Other'] },
    ],
  },
  {
    slug: 'sports',
    name: 'Sports',
    emoji: '⚽',
    types: ['Football / Soccer', 'Basketball', 'Tennis', 'Padel', 'Gym Equipment', 'Cycling / Bike', 'Running Gear', 'Swimming', 'Boxing / Martial Arts', 'Skiing / Snowboarding', 'Golf', 'Outdoor / Hiking', 'Other Sports'],
    specs: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Adidas, Wilson, Decathlon' },
      { key: 'size', label: 'Size / Specs', type: 'text', placeholder: 'e.g. Size M, 26", 15kg' },
    ],
  },
  {
    slug: 'instruments',
    name: 'Instruments',
    emoji: '🎸',
    types: ['Acoustic Guitar', 'Electric Guitar', 'Bass Guitar', 'Classical Guitar', 'Oud', 'Piano / Keyboard', 'Digital Piano', 'Drums / Percussion', 'Violin', 'Cello', 'Flute', 'Saxophone', 'Trumpet', 'Microphone', 'DJ Equipment', 'Other Instrument'],
    specs: [
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Yamaha, Roland, Fender, Gibson' },
      { key: 'model_name', label: 'Model', type: 'text', placeholder: 'e.g. Yamaha P-45, Fender Stratocaster' },
    ],
  },
  {
    slug: 'books',
    name: 'Books',
    emoji: '📚',
    types: ['Novel / Fiction', 'Non-Fiction', 'Self-Help', 'Business', 'Science & Technology', 'History', 'Religion & Spirituality', 'Textbook / Academic', "Children's Book", 'Comics / Manga', 'Art & Design', 'Cooking', 'Other'],
    specs: [
      { key: 'language', label: 'Language', type: 'select', options: ['Arabic', 'English', 'French', 'Other'] },
      { key: 'author', label: 'Author', type: 'text', placeholder: 'Author name (optional)' },
    ],
  },
  {
    slug: 'toys',
    name: 'Toys',
    emoji: '🧸',
    types: ['Action Figures', 'Dolls', 'Building Sets (LEGO etc)', 'Board Games', 'Card Games', 'Remote Control Toys', 'Educational Toys', 'Outdoor Toys', 'Puzzles', 'Stuffed Animals', 'Vehicles & Cars', 'Other Toys'],
    specs: [
      { key: 'age_range', label: 'Suitable Age', type: 'select', options: ['0–2 years', '3–5 years', '6–9 years', '10–12 years', '13+ / Teen', 'All Ages'] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. LEGO, Hasbro, Mattel (optional)' },
    ],
  },
  {
    slug: 'cars',
    name: 'Cars',
    emoji: '🚗',
    brands: [
      { name: 'Toyota', models: ['Camry', 'Corolla', 'Land Cruiser', 'Prado', 'RAV4', 'Yaris', 'Hilux', 'Fortuner', 'Avalon', 'CHR', 'Rush', 'Highlander'] },
      { name: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Creta', 'i10', 'i20', 'i30', 'Accent', 'Azera', 'Palisade', 'Kona'] },
      { name: 'Kia', models: ['Sportage', 'Sorento', 'Cerato', 'Optima / K5', 'Carnival', 'Picanto', 'Rio', 'Stinger', 'Telluride', 'Niro', 'EV6'] },
      { name: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Odyssey', 'Jazz / Fit', 'City'] },
      { name: 'Nissan', models: ['Sunny', 'Sentra', 'Altima', 'Maxima', 'X-Trail', 'Qashqai', 'Patrol', 'Navara', 'Murano', 'Juke', 'Kicks', 'Armada'] },
      { name: 'Mitsubishi', models: ['Lancer', 'Galant', 'Eclipse Cross', 'Outlander', 'ASX', 'Pajero', 'L200'] },
      { name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'A-Class', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'G-Class', 'AMG GT', 'EQS'] },
      { name: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6', 'X7', '2 Series', '4 Series', 'M3', 'M5', 'iX'] },
      { name: 'Audi', models: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'A5', 'TT', 'e-tron GT'] },
      { name: 'Volkswagen', models: ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Jetta', 'Polo', 'T-Roc', 'T-Cross', 'ID.4', 'Arteon'] },
      { name: 'Mazda', models: ['Mazda 3', 'Mazda 6', 'CX-3', 'CX-5', 'CX-9', 'CX-30', 'MX-5 Miata'] },
      { name: 'Chevrolet', models: ['Malibu', 'Camaro', 'Silverado', 'Blazer', 'Tahoe', 'Suburban', 'Traverse', 'Colorado', 'Captiva', 'Equinox'] },
      { name: 'Ford', models: ['Mustang', 'F-150', 'Explorer', 'Edge', 'Escape', 'Bronco', 'Ranger', 'Focus', 'Fusion'] },
      { name: 'Lexus', models: ['IS', 'ES', 'LS', 'RX', 'GX', 'LX', 'NX', 'UX', 'LC'] },
      { name: 'Jeep', models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Commander'] },
      { name: 'Land Rover', models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Freelander'] },
      { name: 'Porsche', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
      { name: 'Other', models: ['Other Make / Model'] },
    ],
    specs: [
      { key: 'year',         label: 'Year',          type: 'select', options: ['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009','2008','2007','2006','2005','2004','2003','2002','2001','2000','Older'], required: true },
      { key: 'mileage',      label: 'Mileage (km)',  type: 'select', options: ['Under 10,000','10,000–30,000','30,000–60,000','60,000–100,000','100,000–150,000','150,000–200,000','Over 200,000'], required: true },
      { key: 'fuel',         label: 'Fuel Type',     type: 'select', options: ['Petrol','Diesel','Hybrid','Electric','Plug-in Hybrid'], required: true },
      { key: 'transmission', label: 'Transmission',  type: 'select', options: ['Automatic','Manual','CVT','Semi-Automatic'], required: true },
      { key: 'color',        label: 'Color',         type: 'select', options: ['Black','White','Silver','Grey','Red','Blue','Green','Brown','Beige','Gold','Orange','Yellow','Other'] },
      { key: 'engine',       label: 'Engine Size',   type: 'select', options: ['1.0L','1.2L','1.4L','1.5L','1.6L','1.8L','2.0L','2.4L','2.5L','3.0L','3.5L','4.0L','4.6L','5.0L+','Electric'] },
    ],
  },
  {
    slug: 'other',
    name: 'Other',
    emoji: '📦',
    specs: [],
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATALOG.find(c => c.slug === slug);
}

export const CATEGORY_NAMES = CATALOG.map(c => c.name);
