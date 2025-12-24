// src/post/post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const post = this.postRepository.create({
      ...createPostDto,
      user: { id: createPostDto.userId },
    });
    const savedPost = await this.postRepository.save(post);
    return this.mapToResponseDto(savedPost);
  }

  async findAll(): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.find({
      relations: ['user'],
    });
    return posts.map(post => this.mapToResponseDto(post));
  }

  async findOne(id: number): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.mapToResponseDto(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostResponseDto> {
    const post = await this.postRepository.preload({
      id,
      ...updatePostDto,
      ...(updatePostDto.userId && { user: { id: updatePostDto.userId } }),
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const updatedPost = await this.postRepository.save(post);
    return this.mapToResponseDto(updatedPost);
  }

  async remove(id: number): Promise<void> {
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  private mapToResponseDto(post: PostEntity): PostResponseDto {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.user.id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
