export default () => ({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/telemedicine',
  },
  keycloak: {
    authServerUrl:
      process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080/auth',
    realm: process.env.KEYCLOAK_REALM || 'telemedicine',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'telemedicine-backend',
    secret: process.env.KEYCLOAK_SECRET || 'your-client-secret',
  },
});
