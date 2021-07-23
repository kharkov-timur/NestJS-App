const config = {
  name: 'default',
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: JSON.parse(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: JSON.parse(process.env.PORSTRES_SYNCHRONIZE),
  entities: [
    'dist/**/*.entity{.ts,.js}'
  ],
  migrations: [
    'database/migration/seed/**/*.js'
  ],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'database/migration/seed',
  }
};

if (JSON.parse(process.env.POSTGRES_SSL_ENABLED)) {
  config.ssl = { rejectUnauthorized: false };
}

module.exports = config;
