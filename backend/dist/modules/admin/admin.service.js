"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
let AdminService = class AdminService {
    stats() {
        return { users: 0, posts: 0, tracks: 0 };
    }
    users() {
        return { items: [] };
    }
    ban(id, reason) {
        return { id, banned: true, reason };
    }
    unban(id) {
        return { id, banned: false };
    }
    posts() {
        return { items: [] };
    }
    hidePost(id) {
        return { id, hidden: true };
    }
    audit() {
        return { items: [] };
    }
    heatmap() {
        return { type: 'FeatureCollection', features: [] };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)()
], AdminService);
//# sourceMappingURL=admin.service.js.map