module.exports = {
  sdeConnectionString: process.env.DB_CONNECTION_STRING || require('./databaseCredentials'),
  crestEndPoint: process.env.CREST_END_POINT || 'https://public-crest.eveonline.com/',
  primalistURL: process.env.PRIMALIST_URL || 'http://primalist.herokuapp.com/api/',
  limiter: process.env.LIMITER || 5,
  crestDelay: process.env.CREST_DELAY || 200,
}