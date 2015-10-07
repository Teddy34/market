module.exports = {
  sdeConnectionString: process.env.DB_CONNECTION_STRING || require('./databaseCredentials'),
  crestEndPoint: process.env.CREST_END_POINT || 'https://public-crest.eveonline.com/',
  primalistURL: process.env.PRIMALIST_URL || 'http://primalist.herokuapp.com/api/',
  priceTresholdMultiplier: process.env.PRICE_TRESHOLD_MULTIPLIER || 1.18,
  maxSmallItemSize: process.env.MAX_ITEM_SIZE || 200,
  minBigItemSize: process.env.MIN_BIG_ITEM_SIZE || 1000,
  limiter: process.env.LIMITER || 5,
  crestDelay: process.env.CREST_DELAY || 250,
  eveCentralApiUrl: process.env.EVECENTRAL_API_URL || 'http://api.eve-central.com/api/marketstat/json',
  eveCentralCacheDuration: process.env.EVECENTRAL_CACHE_DURATION || (60*60*1000),
  eveCentralDelay: process.env.EVECENTRAL_DELAY || 400,
};