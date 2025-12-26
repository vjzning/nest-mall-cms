import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('member/address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async findAll(@Request() req) {
    return this.addressService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.addressService.findOne(+id, req.user.sub);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.sub, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(+id, req.user.sub, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.addressService.remove(+id, req.user.sub);
  }

  @Patch(':id/default')
  async setDefault(@Param('id') id: string, @Request() req) {
    return this.addressService.setDefault(+id, req.user.sub);
  }
}
