import { Controller, Get, Query } from "@nestjs/common";
import { BaseTableListParams } from "apps/sem-api/src/common/dto/index";
import { OperationService } from "./operation.service";

@Controller('operation')
export class OperationController {
  constructor(private readonly opService: OperationService){}
  @Get('/list')
  getList(@Query() dto: BaseTableListParams) {
    return this.opService.getList(dto);
  }
}