"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const bucket = new Map();
let RateLimitMiddleware = class RateLimitMiddleware {
    use(req, res, next) {
        const key = req.ip ?? 'unknown';
        const now = Date.now();
        const windowMs = 60_000;
        const max = 120;
        const current = bucket.get(key);
        if (!current || now - current.ts > windowMs) {
            bucket.set(key, { count: 1, ts: now });
            return next();
        }
        if (current.count >= max) {
            return res
                .status(429)
                .json({ success: false, error: 'Too many requests' });
        }
        current.count += 1;
        next();
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map