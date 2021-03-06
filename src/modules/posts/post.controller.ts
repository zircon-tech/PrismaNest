import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Post as PostModel } from '@prisma/client';
import { Roles } from '../../decorators/roles.decorator';
import {RolesGuard} from '../../guards/roles.guard';
import {Role} from '../../enums/role.enum'

@Controller()
export class PostController {
  constructor(
    private readonly postService: PostService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  @UseGuards(JwtAuthGuard)
  async createDraft(
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostModel> {
    const { title, content, userId } = createPostDto;
    return this.postService.createPost({
      title,
      content,
      //owner: req.user.id
      user: {
        connect: { id: Number(userId) },
      },
    });
  }

  @Put('publish/:id')
  @UseGuards(JwtAuthGuard)
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(Role.ADMIN)
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    console.log('id deleted', id)
    return this.postService.deletePost({ id: Number(id) });
    
  }
}