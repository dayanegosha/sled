import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

const avatarStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.users.getProfile(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.users.getStats(id);
  }

  @Get(':id/posts')
  getPosts(@Param('id') id: string) {
    return this.users.getPosts(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: { sub: string; id: string },
    @Body() dto: { display_name?: string; username?: string; bio?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.users.updateMe(userId, dto);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only images allowed'), false);
        }
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: { sub: string; id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('No file uploaded');
    const userId = user.id ?? user.sub;
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.users.updateAvatar(userId, avatarUrl);
  }
}
