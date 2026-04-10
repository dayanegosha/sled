"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'rustrack',
    user: process.env.DB_USER ?? 'rustrack',
    password: process.env.DB_PASS ?? 'rustrack',
});
//# sourceMappingURL=database.config.js.map