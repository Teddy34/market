module.exports = {
  appUpdateInterval: process.env.APP_UPDATE_INTERVAL || (20*60*1000),
  sdeConnectionString: process.env.DB_CONNECTION_STRING || require('./sdeCredentials'),
  crestEndPoint: process.env.CREST_END_POINT || 'https://public-crest.eveonline.com/',
  crestCacheDuration: process.env.CREST_CACHE_DURATION || (20*60*1000),
  primalistURL: process.env.PRIMALIST_URL || 'http://flietmarket.herokuapp.com/api/',
  priceTresholdMultiplier: process.env.PRICE_TRESHOLD_MULTIPLIER || 1.18,
  priceRecommandedMultiplier: process.env.PRICE_TRESHOLD_MULTIPLIER || 1.15,
  maxSmallItemSize: process.env.MAX_ITEM_SIZE || 200,
  minBigItemSize: process.env.MIN_BIG_ITEM_SIZE || 1000,
  limiter: process.env.LIMITER || 200,
  crestDelay: process.env.CREST_DELAY || 200,
  eveCentralApiUrl: process.env.EVECENTRAL_API_URL || 'http://api.eve-central.com/api/marketstat/json',
  eveCentralCacheDuration: process.env.EVECENTRAL_CACHE_DURATION || (60*60*1000),
  eveCentralChunk: process.env.EVECENTRAL_CHUNK || 200,
  eveCentralDelay: process.env.EVECENTRAL_DELAY || 400,
  filteredItemList: (process.env.FILTEREDITEMLIST || '36913').split(','),
  appUrl: process.env.APP_URL || 'http://localhost:8080'
};