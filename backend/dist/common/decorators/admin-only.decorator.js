"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOnly = exports.ADMIN_ONLY_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ADMIN_ONLY_KEY = 'adminOnly';
const AdminOnly = () => (0, common_1.SetMetadata)(exports.ADMIN_ONLY_KEY, true);
exports.AdminOnly = AdminOnly;
//# sourceMappingURL=admin-only.decorator.js.map