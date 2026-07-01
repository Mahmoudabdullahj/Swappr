import type { CatalogItem, UserSession } from './types';

export const CATALOG: CatalogItem[] = [
  // ── existing ──────────────────────────────────────────────────────────────
  { id:'c1',  user_id:'karim_a',  title:'Fujifilm X-T30 II',          category:'Cameras',      condition:'like-new', price:510, img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', seller:'Karim A.',  sellerAvatar:'https://i.pravatar.cc/60?img=12', rating:4.9, city:'Abdali',       dist:8  },
  { id:'c2',  user_id:'sara_m',   title:'Apple iPad Pro 11" M2',      category:'Electronics',  condition:'good',     price:485, img:'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80', seller:'Sara M.',   sellerAvatar:'https://i.pravatar.cc/60?img=47', rating:4.7, city:'Sweifieh',     dist:14 },
  { id:'c3',  user_id:'omar_k',   title:'MacBook Air M1',             category:'Laptops',      condition:'good',     price:500, img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', seller:'Omar K.',   sellerAvatar:'https://i.pravatar.cc/60?img=59', rating:5.0, city:'Jabal Amman',  dist:6  },
  { id:'c4',  user_id:'lara_t',   title:"Fender Stratocaster '72",   category:'Instruments',  condition:'good',     price:470, img:'https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?w=600&q=80', seller:'Lara T.',   sellerAvatar:'https://i.pravatar.cc/60?img=22', rating:4.8, city:'Tlaa Al-Ali',  dist:11 },
  { id:'c5',  user_id:'nadia_r',  title:'Pioneer DDJ-400',            category:'Instruments',  condition:'like-new', price:205, img:'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&q=80', seller:'Nadia R.',  sellerAvatar:'https://i.pravatar.cc/60?img=33', rating:4.6, city:'Shmeisani',    dist:4  },
  { id:'c6',  user_id:'bilal_h',  title:'Apple Watch Ultra',          category:'Watches',      condition:'like-new', price:450, img:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80', seller:'Bilal H.',  sellerAvatar:'https://i.pravatar.cc/60?img=68', rating:4.5, city:'Dabouq',       dist:19 },
  { id:'c7',  user_id:'rania_s',  title:'ASUS ROG Zephyrus G14',     category:'Gaming',       condition:'good',     price:975, img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', seller:'Rania S.',  sellerAvatar:'https://i.pravatar.cc/60?img=44', rating:4.9, city:'Khalda',       dist:9  },
  { id:'c8',  user_id:'ziad_f',   title:'Seiko Presage SPB167',      category:'Watches',      condition:'new',      price:230, img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80', seller:'Ziad F.',   sellerAvatar:'https://i.pravatar.cc/60?img=51', rating:4.7, city:'Abdoun',       dist:5  },
  { id:'c9',  user_id:'dima_k',   title:'Sony WH-1000XM5',           category:'Headphones',   condition:'like-new', price:300, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', seller:'Dima K.',   sellerAvatar:'https://i.pravatar.cc/60?img=29', rating:4.8, city:'Mecca St.',    dist:3  },
  { id:'c10', user_id:'tariq_m',  title:'Polaroid OneStep+',          category:'Cameras',      condition:'good',     price:105, img:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80', seller:'Tariq M.',  sellerAvatar:'https://i.pravatar.cc/60?img=15', rating:4.4, city:'Gardens',      dist:7  },
  { id:'c11', user_id:'hana_y',   title:'iPad Mini 6 (256 GB)',       category:'Electronics',  condition:'good',     price:320, img:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', seller:'Hana Y.',   sellerAvatar:'https://i.pravatar.cc/60?img=38', rating:4.6, city:'Rabieh',       dist:15 },
  { id:'c12', user_id:'firas_n',  title:'DJI Mini 3 Drone',          category:'Cameras',      condition:'like-new', price:580, img:'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&q=80', seller:'Firas N.',  sellerAvatar:'https://i.pravatar.cc/60?img=62', rating:4.9, city:'Jubaiha',      dist:22 },
  { id:'c13', user_id:'maya_a',   title:'Gibson Les Paul Standard',  category:'Instruments',  condition:'good',     price:840, img:'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&q=80', seller:'Maya A.',   sellerAvatar:'https://i.pravatar.cc/60?img=25', rating:5.0, city:'Sweifieh',     dist:13 },
  { id:'c14', user_id:'sami_r',   title:'Nintendo Switch OLED',      category:'Gaming',       condition:'like-new', price:280, img:'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80', seller:'Sami R.',   sellerAvatar:'https://i.pravatar.cc/60?img=55', rating:4.7, city:'Al Bayader',   dist:10 },
  { id:'c15', user_id:'lina_q',   title:'Sony A6400 Camera Body',    category:'Cameras',      condition:'good',     price:390, img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', seller:'Lina Q.',   sellerAvatar:'https://i.pravatar.cc/60?img=41', rating:4.5, city:'Marj Al-Hamam',dist:18 },

  // ── Electronics — phones & smart devices ──────────────────────────────────
  { id:'c16', user_id:'ahmad_b',  title:'iPhone 14 Pro Max 256 GB',  category:'Electronics',  condition:'like-new', price:620, img:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80', seller:'Ahmad B.',  sellerAvatar:'https://i.pravatar.cc/60?img=70', rating:4.8, city:'7th Circle',   dist:7  },
  { id:'c17', user_id:'reem_a',   title:'Samsung Galaxy S23 Ultra',  category:'Electronics',  condition:'good',     price:540, img:'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600&q=80', seller:'Reem A.',   sellerAvatar:'https://i.pravatar.cc/60?img=5',  rating:4.6, city:'Webdeh',       dist:5  },
  { id:'c18', user_id:'yousef_k', title:'Google Pixel 7 Pro',        category:'Electronics',  condition:'good',     price:390, img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', seller:'Yousef K.', sellerAvatar:'https://i.pravatar.cc/60?img=67', rating:4.5, city:'Shmeisani',    dist:6  },
  { id:'c19', user_id:'nour_h',   title:'iPad Air 5th Gen Wi-Fi',    category:'Electronics',  condition:'like-new', price:410, img:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80', seller:'Nour H.',   sellerAvatar:'https://i.pravatar.cc/60?img=18', rating:4.7, city:'Khalda',       dist:9  },
  { id:'c20', user_id:'wael_n',   title:'AirPods Pro 2nd Generation',category:'Headphones',   condition:'new',      price:195, img:'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80', seller:'Wael N.',   sellerAvatar:'https://i.pravatar.cc/60?img=48', rating:4.9, city:'Abdali',       dist:3  },
  { id:'c21', user_id:'sana_f',   title:'Samsung Galaxy Buds2 Pro',  category:'Headphones',   condition:'like-new', price:120, img:'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80', seller:'Sana F.',   sellerAvatar:'https://i.pravatar.cc/60?img=31', rating:4.4, city:'Luweibdeh',    dist:8  },
  { id:'c22', user_id:'ramzi_j',  title:'Amazon Echo Show 10',       category:'Electronics',  condition:'good',     price:145, img:'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80', seller:'Ramzi J.',  sellerAvatar:'https://i.pravatar.cc/60?img=3',  rating:4.3, city:'Jabal Amman',  dist:11 },
  { id:'c23', user_id:'hiba_t',   title:'GoPro Hero 11 Black',       category:'Cameras',      condition:'like-new', price:290, img:'https://images.unsplash.com/photo-1530088349038-6b16e26b41f3?w=600&q=80', seller:'Hiba T.',   sellerAvatar:'https://i.pravatar.cc/60?img=57', rating:4.7, city:'Sweifieh',     dist:12 },
  { id:'c24', user_id:'jad_w',    title:'Xiaomi 13 Pro 512 GB',      category:'Electronics',  condition:'good',     price:480, img:'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80', seller:'Jad W.',    sellerAvatar:'https://i.pravatar.cc/60?img=42', rating:4.5, city:'Gardens',      dist:9  },
  { id:'c25', user_id:'fadi_o',   title:'OnePlus 11 5G',             category:'Electronics',  condition:'like-new', price:360, img:'https://images.unsplash.com/photo-1536329583941-14287ec6fc4e?w=600&q=80', seller:'Fadi O.',   sellerAvatar:'https://i.pravatar.cc/60?img=9',  rating:4.6, city:'Abdoun',       dist:4  },
  { id:'c26', user_id:'karim_a',  title:'Logitech MX Master 3S',     category:'Electronics',  condition:'new',      price:85,  img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80', seller:'Karim A.',  sellerAvatar:'https://i.pravatar.cc/60?img=12', rating:4.9, city:'Abdali',       dist:8  },
  { id:'c27', user_id:'reem_a',   title:'Dell 27" 4K USB-C Monitor', category:'Electronics',  condition:'good',     price:310, img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', seller:'Reem A.',   sellerAvatar:'https://i.pravatar.cc/60?img=5',  rating:4.5, city:'Webdeh',       dist:6  },
  { id:'c28', user_id:'yousef_k', title:'Samsung Galaxy Tab S8+',    category:'Electronics',  condition:'good',     price:440, img:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80', seller:'Yousef K.', sellerAvatar:'https://i.pravatar.cc/60?img=67', rating:4.6, city:'Shmeisani',    dist:7  },
  { id:'c29', user_id:'nour_h',   title:'Apple TV 4K (3rd Gen)',     category:'Electronics',  condition:'like-new', price:140, img:'https://images.unsplash.com/photo-1593642532559-0c6d3fc62b89?w=600&q=80', seller:'Nour H.',   sellerAvatar:'https://i.pravatar.cc/60?img=18', rating:4.7, city:'Khalda',       dist:5  },
  { id:'c30', user_id:'wael_n',   title:'Anker 737 Power Bank 140W', category:'Electronics',  condition:'new',      price:75,  img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', seller:'Wael N.',   sellerAvatar:'https://i.pravatar.cc/60?img=48', rating:4.8, city:'Abdali',       dist:2  },

  // ── Laptops ────────────────────────────────────────────────────────────────
  { id:'c31', user_id:'ahmad_b',  title:'MacBook Pro 14" M2 Pro',    category:'Laptops',      condition:'like-new', price:1450,img:'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?w=600&q=80', seller:'Ahmad B.',  sellerAvatar:'https://i.pravatar.cc/60?img=70', rating:4.9, city:'7th Circle',   dist:7  },
  { id:'c32', user_id:'rania_s',  title:'Dell XPS 15 9530 OLED',     category:'Laptops',      condition:'good',     price:980, img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', seller:'Rania S.',  sellerAvatar:'https://i.pravatar.cc/60?img=44', rating:4.8, city:'Khalda',       dist:9  },
  { id:'c33', user_id:'yousef_k', title:'Lenovo ThinkPad X1 Carbon', category:'Laptops',      condition:'good',     price:750, img:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80', seller:'Yousef K.', sellerAvatar:'https://i.pravatar.cc/60?img=67', rating:4.7, city:'Shmeisani',    dist:6  },
  { id:'c34', user_id:'nour_h',   title:'HP Spectre x360 14"',       category:'Laptops',      condition:'like-new', price:870, img:'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80', seller:'Nour H.',   sellerAvatar:'https://i.pravatar.cc/60?img=18', rating:4.6, city:'Khalda',       dist:10 },
  { id:'c35', user_id:'sana_f',   title:'ASUS ZenBook 14 OLED',      category:'Laptops',      condition:'good',     price:620, img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80', seller:'Sana F.',   sellerAvatar:'https://i.pravatar.cc/60?img=31', rating:4.5, city:'Luweibdeh',    dist:8  },
  { id:'c36', user_id:'ramzi_j',  title:'Microsoft Surface Pro 9',   category:'Laptops',      condition:'like-new', price:790, img:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80', seller:'Ramzi J.',  sellerAvatar:'https://i.pravatar.cc/60?img=3',  rating:4.7, city:'Jabal Amman',  dist:11 },
  { id:'c37', user_id:'hiba_t',   title:'Razer Blade 15 2023',       category:'Laptops',      condition:'good',     price:1100,img:'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80', seller:'Hiba T.',   sellerAvatar:'https://i.pravatar.cc/60?img=57', rating:4.8, city:'Sweifieh',     dist:12 },
  { id:'c38', user_id:'jad_w',    title:'MacBook Air M2 8/256 GB',   category:'Laptops',      condition:'like-new', price:920, img:'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&q=80', seller:'Jad W.',    sellerAvatar:'https://i.pravatar.cc/60?img=42', rating:4.9, city:'Gardens',      dist:9  },
  { id:'c39', user_id:'fadi_o',   title:'Acer Swift 5 Intel Evo',    category:'Laptops',      condition:'good',     price:560, img:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', seller:'Fadi O.',   sellerAvatar:'https://i.pravatar.cc/60?img=9',  rating:4.4, city:'Abdoun',       dist:5  },
  { id:'c40', user_id:'lina_q',   title:'LG Gram 17" Ultra-Light',   category:'Laptops',      condition:'good',     price:830, img:'https://images.unsplash.com/photo-1504194104404-433180773017?w=600&q=80', seller:'Lina Q.',   sellerAvatar:'https://i.pravatar.cc/60?img=41', rating:4.6, city:'Marj Al-Hamam',dist:17 },
  { id:'c41', user_id:'sara_m',   title:'Alienware m16 RTX 4070',    category:'Laptops',      condition:'good',     price:1380,img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80', seller:'Sara M.',   sellerAvatar:'https://i.pravatar.cc/60?img=47', rating:4.7, city:'Sweifieh',     dist:14 },

  // ── Cameras ────────────────────────────────────────────────────────────────
  { id:'c42', user_id:'karim_a',  title:'Canon EOS R6 Mark II',      category:'Cameras',      condition:'like-new', price:1650,img:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80', seller:'Karim A.',  sellerAvatar:'https://i.pravatar.cc/60?img=12', rating:4.9, city:'Abdali',       dist:8  },
  { id:'c43', user_id:'lara_t',   title:'Nikon Z6 II Body',          category:'Cameras',      condition:'good',     price:1100,img:'https://images.unsplash.com/photo-1568772585407-9f217a5e38ef?w=600&q=80', seller:'Lara T.',   sellerAvatar:'https://i.pravatar.cc/60?img=22', rating:4.8, city:'Tlaa Al-Ali',  dist:11 },
  { id:'c44', user_id:'bilal_h',  title:'Sony ZV-E10 Vlog Camera',   category:'Cameras',      condition:'like-new', price:440, img:'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600&q=80', seller:'Bilal H.',  sellerAvatar:'https://i.pravatar.cc/60?img=68', rating:4.6, city:'Dabouq',       dist:19 },
  { id:'c45', user_id:'ziad_f',   title:'Canon EOS 5D Mark IV',      category:'Cameras',      condition:'good',     price:1300,img:'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&q=80', seller:'Ziad F.',   sellerAvatar:'https://i.pravatar.cc/60?img=51', rating:4.7, city:'Abdoun',       dist:5  },
  { id:'c46', user_id:'tariq_m',  title:'Canon RF 50mm f/1.8 STM',   category:'Cameras',      condition:'new',      price:170, img:'https://images.unsplash.com/photo-1606986628264-a68e8e5a3f0a?w=600&q=80', seller:'Tariq M.',  sellerAvatar:'https://i.pravatar.cc/60?img=15', rating:4.4, city:'Gardens',      dist:7  },
  { id:'c47', user_id:'hana_y',   title:'Sony FX3 Full-Frame Cinema',category:'Cameras',      condition:'like-new', price:2900,img:'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80', seller:'Hana Y.',   sellerAvatar:'https://i.pravatar.cc/60?img=38', rating:5.0, city:'Rabieh',       dist:15 },
  { id:'c48', user_id:'firas_n',  title:'DJI Osmo Pocket 3',         category:'Cameras',      condition:'new',      price:360, img:'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&q=80', seller:'Firas N.',  sellerAvatar:'https://i.pravatar.cc/60?img=62', rating:4.8, city:'Jubaiha',      dist:22 },
  { id:'c49', user_id:'maya_a',   title:'Instax Mini 12 + 20 Films', category:'Cameras',      condition:'new',      price:65,  img:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80', seller:'Maya A.',   sellerAvatar:'https://i.pravatar.cc/60?img=25', rating:4.7, city:'Sweifieh',     dist:13 },
  { id:'c50', user_id:'ahmad_b',  title:'Sigma 35mm f/1.4 Art',      category:'Cameras',      condition:'good',     price:480, img:'https://images.unsplash.com/photo-1617896848219-86e5da1d879d?w=600&q=80', seller:'Ahmad B.',  sellerAvatar:'https://i.pravatar.cc/60?img=70', rating:4.6, city:'7th Circle',   dist:7  },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  { id:'c51', user_id:'reem_a',   title:'PlayStation 5 Console',     category:'Gaming',       condition:'like-new', price:490, img:'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=600&q=80', seller:'Reem A.',   sellerAvatar:'https://i.pravatar.cc/60?img=5',  rating:4.8, city:'Webdeh',       dist:5  },
  { id:'c52', user_id:'yousef_k', title:'Xbox Series X 1 TB',        category:'Gaming',       condition:'good',     price:400, img:'https://images.unsplash.com/photo-1640955014216-75201056c829?w=600&q=80', seller:'Yousef K.', sellerAvatar:'https://i.pravatar.cc/60?img=67', rating:4.7, city:'Shmeisani',    dist:6  },
  { id:'c53', user_id:'nour_h',   title:'PS5 DualSense Controller',  category:'Gaming',       condition:'new',      price:75,  img:'https://images.unsplash.com/photo-1609941882009-ab90f0dfd1e9?w=600&q=80', seller:'Nour H.',   sellerAvatar:'https://i.pravatar.cc/60?img=18', rating:4.6, city:'Khalda',       dist:9  },
  { id:'c54', user_id:'wael_n',   title:'Xbox Elite Controller S2',  category:'Gaming',       condition:'good',     price:140, img:'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80', seller:'Wael N.',   sellerAvatar:'https://i.pravatar.cc/60?img=48', rating:4.5, city:'Abdali',       dist:3  },
  { id:'c55', user_id:'sana_f',   title:'SteelSeries Arctis Nova Pro',category:'Gaming',      condition:'like-new', price:220, img:'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=600&q=80', seller:'Sana F.',   sellerAvatar:'https://i.pravatar.cc/60?img=31', rating:4.7, city:'Luweibdeh',    dist:8  },
  { id:'c56', user_id:'ramzi_j',  title:'Secretlab TITAN Evo Chair', category:'Gaming',       condition:'good',     price:380, img:'https://images.unsplash.com/photo-1598550476439-6a967081ae8b?w=600&q=80', seller:'Ramzi J.',  sellerAvatar:'https://i.pravatar.cc/60?img=3',  rating:4.8, city:'Jabal Amman',  dist:11 },
  { id:'c57', user_id:'hiba_t',   title:'SteelSeries Apex Pro TKL',  category:'Gaming',       condition:'like-new', price:165, img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80', seller:'Hiba T.',   sellerAvatar:'https://i.pravatar.cc/60?img=57', rating:4.9, city:'Sweifieh',     dist:12 },
  { id:'c58', user_id:'jad_w',    title:'Logitech G502 X Plus',      category:'Gaming',       condition:'new',      price:95,  img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80', seller:'Jad W.',    sellerAvatar:'https://i.pravatar.cc/60?img=42', rating:4.6, city:'Gardens',      dist:9  },
  { id:'c59', user_id:'fadi_o',   title:'ASUS ROG Swift 27" 240Hz',  category:'Gaming',       condition:'good',     price:430, img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', seller:'Fadi O.',   sellerAvatar:'https://i.pravatar.cc/60?img=9',  rating:4.7, city:'Abdoun',       dist:5  },
  { id:'c60', user_id:'omar_k',   title:'Elgato Stream Deck MK.2',   category:'Gaming',       condition:'like-new', price:115, img:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80', seller:'Omar K.',   sellerAvatar:'https://i.pravatar.cc/60?img=59', rating:4.8, city:'Jabal Amman',  dist:6  },

  // ── Watches ────────────────────────────────────────────────────────────────
  { id:'c61', user_id:'dima_k',   title:'Garmin Fenix 7 Solar',      category:'Watches',      condition:'good',     price:530, img:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80', seller:'Dima K.',   sellerAvatar:'https://i.pravatar.cc/60?img=29', rating:4.8, city:'Mecca St.',    dist:3  },
  { id:'c62', user_id:'tariq_m',  title:'Samsung Galaxy Watch 5 Pro',category:'Watches',      condition:'like-new', price:240, img:'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80', seller:'Tariq M.',  sellerAvatar:'https://i.pravatar.cc/60?img=15', rating:4.5, city:'Gardens',      dist:7  },
  { id:'c63', user_id:'hana_y',   title:'Casio G-Shock GA-2100',     category:'Watches',      condition:'new',      price:90,  img:'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80', seller:'Hana Y.',   sellerAvatar:'https://i.pravatar.cc/60?img=38', rating:4.6, city:'Rabieh',       dist:15 },
  { id:'c64', user_id:'firas_n',  title:'Orient Bambino V4',         category:'Watches',      condition:'new',      price:135, img:'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&q=80', seller:'Firas N.',  sellerAvatar:'https://i.pravatar.cc/60?img=62', rating:4.7, city:'Jubaiha',      dist:22 },
  { id:'c65', user_id:'maya_a',   title:'Tissot PRX Powermatic 80',  category:'Watches',      condition:'like-new', price:440, img:'https://images.unsplash.com/photo-1533139502658-0198f920d8e7?w=600&q=80', seller:'Maya A.',   sellerAvatar:'https://i.pravatar.cc/60?img=25', rating:5.0, city:'Sweifieh',     dist:13 },
  { id:'c66', user_id:'sami_r',   title:'Hamilton Khaki Field Auto', category:'Watches',      condition:'good',     price:370, img:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80', seller:'Sami R.',   sellerAvatar:'https://i.pravatar.cc/60?img=55', rating:4.7, city:'Al Bayader',   dist:10 },
  { id:'c67', user_id:'lina_q',   title:'Fossil Gen 6 Smartwatch',   category:'Watches',      condition:'good',     price:160, img:'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80', seller:'Lina Q.',   sellerAvatar:'https://i.pravatar.cc/60?img=41', rating:4.4, city:'Marj Al-Hamam',dist:17 },

  // ── Headphones ─────────────────────────────────────────────────────────────
  { id:'c68', user_id:'ahmad_b',  title:'Bose QuietComfort 45',       category:'Headphones',   condition:'like-new', price:260, img:'https://images.unsplash.com/photo-1618042164219-62c820f20b0a?w=600&q=80', seller:'Ahmad B.',  sellerAvatar:'https://i.pravatar.cc/60?img=70', rating:4.8, city:'7th Circle',   dist:7  },
  { id:'c69', user_id:'reem_a',   title:'Audio-Technica ATH-M50x',   category:'Headphones',   condition:'good',     price:120, img:'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80', seller:'Reem A.',   sellerAvatar:'https://i.pravatar.cc/60?img=5',  rating:4.7, city:'Webdeh',       dist:5  },
  { id:'c70', user_id:'yousef_k', title:'Sennheiser Momentum 4',      category:'Headphones',   condition:'like-new', price:280, img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', seller:'Yousef K.', sellerAvatar:'https://i.pravatar.cc/60?img=67', rating:4.9, city:'Shmeisani',    dist:6  },
  { id:'c71', user_id:'nour_h',   title:'Apple AirPods Max Silver',  category:'Headphones',   condition:'good',     price:380, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', seller:'Nour H.',   sellerAvatar:'https://i.pravatar.cc/60?img=18', rating:4.6, city:'Khalda',       dist:9  },
  { id:'c72', user_id:'wael_n',   title:'Jabra Evolve2 85 UC',       category:'Headphones',   condition:'like-new', price:330, img:'https://images.unsplash.com/photo-1618042164219-62c820f20b0a?w=600&q=80', seller:'Wael N.',   sellerAvatar:'https://i.pravatar.cc/60?img=48', rating:4.7, city:'Abdali',       dist:3  },
  { id:'c73', user_id:'sana_f',   title:'Marshall Major IV On-Ear',  category:'Headphones',   condition:'good',     price:95,  img:'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80', seller:'Sana F.',   sellerAvatar:'https://i.pravatar.cc/60?img=31', rating:4.5, city:'Luweibdeh',    dist:8  },
  { id:'c74', user_id:'ramzi_j',  title:'Beats Studio Pro',          category:'Headphones',   condition:'new',      price:210, img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80', seller:'Ramzi J.',  sellerAvatar:'https://i.pravatar.cc/60?img=3',  rating:4.6, city:'Jabal Amman',  dist:11 },

  // ── Instruments ────────────────────────────────────────────────────────────
  { id:'c75', user_id:'hiba_t',   title:'Yamaha P-125 Digital Piano',category:'Instruments',  condition:'good',     price:380, img:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80', seller:'Hiba T.',   sellerAvatar:'https://i.pravatar.cc/60?img=57', rating:4.8, city:'Sweifieh',     dist:12 },
  { id:'c76', user_id:'jad_w',    title:'Taylor 114ce Acoustic',     category:'Instruments',  condition:'good',     price:560, img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80', seller:'Jad W.',    sellerAvatar:'https://i.pravatar.cc/60?img=42', rating:4.9, city:'Gardens',      dist:9  },
  { id:'c77', user_id:'fadi_o',   title:'Roland TD-27 Drum Module',  category:'Instruments',  condition:'like-new', price:740, img:'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&q=80', seller:'Fadi O.',   sellerAvatar:'https://i.pravatar.cc/60?img=9',  rating:4.7, city:'Abdoun',       dist:5  },
  { id:'c78', user_id:'lina_q',   title:'Ibanez SR500E Bass Guitar', category:'Instruments',  condition:'good',     price:420, img:'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600&q=80', seller:'Lina Q.',   sellerAvatar:'https://i.pravatar.cc/60?img=41', rating:4.6, city:'Marj Al-Hamam',dist:17 },
  { id:'c79', user_id:'sara_m',   title:'Shure SM58 Microphone',     category:'Instruments',  condition:'like-new', price:95,  img:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&q=80', seller:'Sara M.',   sellerAvatar:'https://i.pravatar.cc/60?img=47', rating:4.5, city:'Sweifieh',     dist:14 },
  { id:'c80', user_id:'karim_a',  title:'Focusrite Scarlett 2i2 4th',category:'Instruments',  condition:'new',      price:145, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', seller:'Karim A.',  sellerAvatar:'https://i.pravatar.cc/60?img=12', rating:4.9, city:'Abdali',       dist:8  },
  { id:'c81', user_id:'lara_t',   title:'Korg B2 88-Key Digital Piano',category:'Instruments',condition:'good',     price:320, img:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80', seller:'Lara T.',   sellerAvatar:'https://i.pravatar.cc/60?img=22', rating:4.7, city:'Tlaa Al-Ali',  dist:11 },
  { id:'c82', user_id:'nadia_r',  title:'Meinl Cajon Box Drum',      category:'Instruments',  condition:'like-new', price:130, img:'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&q=80', seller:'Nadia R.',  sellerAvatar:'https://i.pravatar.cc/60?img=33', rating:4.5, city:'Shmeisani',    dist:4  },

  // ── Sports ─────────────────────────────────────────────────────────────────
  { id:'c83', user_id:'bilal_h',  title:'Trek FX 3 Disc Hybrid Bike',category:'Sports',       condition:'good',     price:580, img:'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80', seller:'Bilal H.',  sellerAvatar:'https://i.pravatar.cc/60?img=68', rating:4.7, city:'Dabouq',       dist:19 },
  { id:'c84', user_id:'ziad_f',   title:'Wilson Pro Staff Tennis',   category:'Sports',       condition:'like-new', price:160, img:'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600&q=80', seller:'Ziad F.',   sellerAvatar:'https://i.pravatar.cc/60?img=51', rating:4.6, city:'Abdoun',       dist:5  },
  { id:'c85', user_id:'tariq_m',  title:'Nike Air Zoom Pegasus 40',  category:'Sports',       condition:'new',      price:120, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', seller:'Tariq M.',  sellerAvatar:'https://i.pravatar.cc/60?img=15', rating:4.8, city:'Gardens',      dist:7  },
  { id:'c86', user_id:'hana_y',   title:'Molten Elite Basketball',   category:'Sports',       condition:'like-new', price:55,  img:'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80', seller:'Hana Y.',   sellerAvatar:'https://i.pravatar.cc/60?img=38', rating:4.5, city:'Rabieh',       dist:15 },
  { id:'c87', user_id:'firas_n',  title:'Adidas Predator Football Boots',category:'Sports',   condition:'new',      price:105, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', seller:'Firas N.',  sellerAvatar:'https://i.pravatar.cc/60?img=62', rating:4.6, city:'Jubaiha',      dist:22 },
  { id:'c88', user_id:'maya_a',   title:'Manduka PRO Yoga Mat',      category:'Sports',       condition:'like-new', price:80,  img:'https://images.unsplash.com/photo-1601925228880-96e748e86d6a?w=600&q=80', seller:'Maya A.',   sellerAvatar:'https://i.pravatar.cc/60?img=25', rating:4.9, city:'Sweifieh',     dist:13 },
  { id:'c89', user_id:'sami_r',   title:'TRX GO Suspension Trainer', category:'Sports',       condition:'good',     price:70,  img:'https://images.unsplash.com/photo-1601925228880-96e748e86d6a?w=600&q=80', seller:'Sami R.',   sellerAvatar:'https://i.pravatar.cc/60?img=55', rating:4.5, city:'Al Bayader',   dist:10 },
  { id:'c90', user_id:'lina_q',   title:'Bowflex SelectTech 552',    category:'Sports',       condition:'good',     price:290, img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', seller:'Lina Q.',   sellerAvatar:'https://i.pravatar.cc/60?img=41', rating:4.7, city:'Marj Al-Hamam',dist:17 },

  // ── Fashion ────────────────────────────────────────────────────────────────
  { id:'c91', user_id:'ahmad_b',  title:'The North Face Puffer 700', category:'Fashion',      condition:'like-new', price:175, img:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80', seller:'Ahmad B.',  sellerAvatar:'https://i.pravatar.cc/60?img=70', rating:4.7, city:'7th Circle',   dist:7  },
  { id:'c92', user_id:'reem_a',   title:'Ray-Ban Aviator Classics',  category:'Fashion',      condition:'new',      price:145, img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', seller:'Reem A.',   sellerAvatar:'https://i.pravatar.cc/60?img=5',  rating:4.8, city:'Webdeh',       dist:5  },
  { id:'c93', user_id:'yousef_k', title:'Nike Air Force 1 \'07 White',category:'Fashion',     condition:'new',      price:90,  img:'https://images.unsplash.com/photo-1542219550-37153d387c27?w=600&q=80', seller:'Yousef K.', sellerAvatar:'https://i.pravatar.cc/60?img=67', rating:4.6, city:'Shmeisani',    dist:6  },
  { id:'c94', user_id:'nour_h',   title:'Adidas Ultraboost 22',      category:'Fashion',      condition:'like-new', price:115, img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', seller:'Nour H.',   sellerAvatar:'https://i.pravatar.cc/60?img=18', rating:4.5, city:'Khalda',       dist:9  },
  { id:'c95', user_id:'wael_n',   title:'Herschel Little America Backpack',category:'Fashion', condition:'good',    price:60,  img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', seller:'Wael N.',   sellerAvatar:'https://i.pravatar.cc/60?img=48', rating:4.4, city:'Abdali',       dist:3  },
  { id:'c96', user_id:'sana_f',   title:'Levi\'s 501 Original Jeans',category:'Fashion',      condition:'good',     price:55,  img:'https://images.unsplash.com/photo-1542219550-37153d387c27?w=600&q=80', seller:'Sana F.',   sellerAvatar:'https://i.pravatar.cc/60?img=31', rating:4.3, city:'Luweibdeh',    dist:8  },
  { id:'c97', user_id:'ramzi_j',  title:'Timberland 6" Premium Boot',category:'Fashion',      condition:'like-new', price:130, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', seller:'Ramzi J.',  sellerAvatar:'https://i.pravatar.cc/60?img=3',  rating:4.6, city:'Jabal Amman',  dist:11 },

  // ── Books ──────────────────────────────────────────────────────────────────
  { id:'c98',  user_id:'hiba_t',  title:'Atomic Habits — James Clear',category:'Books',       condition:'like-new', price:12,  img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80', seller:'Hiba T.',   sellerAvatar:'https://i.pravatar.cc/60?img=57', rating:4.9, city:'Sweifieh',     dist:12 },
  { id:'c99',  user_id:'jad_w',   title:'Harry Potter Box Set (7 books)',category:'Books',    condition:'good',     price:28,  img:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', seller:'Jad W.',    sellerAvatar:'https://i.pravatar.cc/60?img=42', rating:4.7, city:'Gardens',      dist:9  },
  { id:'c100', user_id:'fadi_o',  title:'Design Patterns — GoF',     category:'Books',        condition:'good',     price:18,  img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', seller:'Fadi O.',   sellerAvatar:'https://i.pravatar.cc/60?img=9',  rating:4.5, city:'Abdoun',       dist:5  },
  { id:'c101', user_id:'omar_k',  title:'Dune — Frank Herbert',      category:'Books',        condition:'like-new', price:9,   img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80', seller:'Omar K.',   sellerAvatar:'https://i.pravatar.cc/60?img=59', rating:4.8, city:'Jabal Amman',  dist:6  },
  { id:'c102', user_id:'dima_k',  title:'The Alchemist — Arabic Ed.',category:'Books',        condition:'good',     price:7,   img:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', seller:'Dima K.',   sellerAvatar:'https://i.pravatar.cc/60?img=29', rating:4.6, city:'Mecca St.',    dist:3  },

  // ── Furniture ──────────────────────────────────────────────────────────────
  { id:'c103', user_id:'lina_q',  title:'IKEA KALLAX 4×4 Shelf',    category:'Furniture',    condition:'good',     price:85,  img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', seller:'Lina Q.',   sellerAvatar:'https://i.pravatar.cc/60?img=41', rating:4.4, city:'Marj Al-Hamam',dist:17 },
  { id:'c104', user_id:'sara_m',  title:'Herman Miller Aeron Chair B',category:'Furniture',   condition:'good',     price:490, img:'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&q=80', seller:'Sara M.',   sellerAvatar:'https://i.pravatar.cc/60?img=47', rating:4.9, city:'Sweifieh',     dist:14 },
  { id:'c105', user_id:'karim_a', title:'IKEA MARKUS Swivel Chair',  category:'Furniture',    condition:'like-new', price:75,  img:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', seller:'Karim A.',  sellerAvatar:'https://i.pravatar.cc/60?img=12', rating:4.7, city:'Abdali',       dist:8  },
  { id:'c106', user_id:'lara_t',  title:'FlexiSpot E7 Standing Desk',category:'Furniture',    condition:'good',     price:320, img:'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80', seller:'Lara T.',   sellerAvatar:'https://i.pravatar.cc/60?img=22', rating:4.8, city:'Tlaa Al-Ali',  dist:11 },

  // ── Toys ───────────────────────────────────────────────────────────────────
  { id:'c107', user_id:'nadia_r', title:'LEGO Technic Bugatti Chiron',category:'Toys',        condition:'new',      price:140, img:'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80', seller:'Nadia R.',  sellerAvatar:'https://i.pravatar.cc/60?img=33', rating:4.9, city:'Shmeisani',    dist:4  },
  { id:'c108', user_id:'bilal_h', title:'LEGO Star Wars Falcon 75192',category:'Toys',        condition:'new',      price:195, img:'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80', seller:'Bilal H.',  sellerAvatar:'https://i.pravatar.cc/60?img=68', rating:4.8, city:'Dabouq',       dist:19 },
  { id:'c109', user_id:'ziad_f',  title:'Catan Board Game',          category:'Toys',         condition:'like-new', price:30,  img:'https://images.unsplash.com/photo-1611329695318-28a8e1f1b51b?w=600&q=80', seller:'Ziad F.',   sellerAvatar:'https://i.pravatar.cc/60?img=51', rating:4.7, city:'Abdoun',       dist:5  },
  { id:'c110', user_id:'tariq_m', title:'DJI Tello Mini Drone',      category:'Toys',         condition:'good',     price:50,  img:'https://images.unsplash.com/photo-1535223289429-462ea9301a83?w=600&q=80', seller:'Tariq M.',  sellerAvatar:'https://i.pravatar.cc/60?img=15', rating:4.5, city:'Gardens',      dist:7  },
];

const EXACT_MATCH_ITEMS: CatalogItem[] = [
  { id:'e1', user_id:'karim_a', title:'Fujifilm X-T30 II',   category:'Cameras',     condition:'like-new', price:510, img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', seller:'Karim A.', sellerAvatar:'https://i.pravatar.cc/60?img=12', rating:4.9, city:'Abdali',    dist:8  },
  { id:'e2', user_id:'sara_m',  title:'Polaroid OneStep+',    category:'Cameras',     condition:'good',     price:105, img:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80', seller:'Sara M.',  sellerAvatar:'https://i.pravatar.cc/60?img=47', rating:4.7, city:'Sweifieh', dist:14 },
  { id:'e3', user_id:'omar_k',  title:'Seiko Presage SPB167', category:'Fashion',     condition:'new',      price:230, img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80', seller:'Omar K.',  sellerAvatar:'https://i.pravatar.cc/60?img=59', rating:5.0, city:'Jabal Amman', dist:6 },
  { id:'e4', user_id:'dima_k',  title:'Sony WH-1000XM5',     category:'Electronics', condition:'like-new', price:300, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', seller:'Dima K.',  sellerAvatar:'https://i.pravatar.cc/60?img=29', rating:4.8, city:'Mecca St.', dist:3  },
];

export function getItemById(id: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.id === id) ?? EXACT_MATCH_ITEMS.find((i) => i.id === id);
}

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/);
  return CATALOG.filter((item) => {
    const hay = `${item.title} ${item.category} ${item.condition} ${item.seller}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}

export const Feed = {
  generate(session: UserSession, limit = 8): CatalogItem[] {
    const alreadyViewed = new Set(session.views.slice(0, 20).map((v) => v.itemId));
    const pool = CATALOG.filter(
      (item) => item.user_id !== session.userId && !alreadyViewed.has(item.id),
    );

    const { topCategories, topKeywords, medianPrice } = session.profile;
    const isNewUser = !topCategories.length && !topKeywords.length;

    if (isNewUser) {
      return pool.sort((a, b) => a.dist - b.dist).slice(0, limit);
    }

    const priceFloor   = medianPrice ? medianPrice * 0.6 : 0;
    const priceCeiling = medianPrice ? medianPrice * 1.4 : Infinity;

    const scored = pool.map((item) => {
      let score = 0;
      if (topCategories.includes(item.category)) score += 30;
      const tokens = item.title.toLowerCase().split(/\s+/);
      if (topKeywords.some((kw) => tokens.some((t) => t.includes(kw)))) score += 20;
      if (item.price >= priceFloor && item.price <= priceCeiling) score += 15;
      score += Math.max(0, 10 - Math.floor(item.dist / 5));
      return { item, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.item);
  },

  isPersonalised(session: UserSession): boolean {
    const { topCategories, topKeywords } = session.profile;
    return topCategories.length > 0 || topKeywords.length > 0;
  },
};
