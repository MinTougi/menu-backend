import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { GuestCheckStatus } from "../guest-checks/guest-check.entity";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order";
import { UpdateOrderStatusDto } from "./dto/update-order-status";
import { Order } from "./entities/order-entity";


@Controller('orders')
export class OrderController {

  constructor(
    private readonly service: OrderService
  ){}

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.service.create(dto);
  }
  
  @Get()
  findAll(@Query('guestCheckStatus') guestCheckStatus?: string): Promise<Order[]> {
    if (guestCheckStatus && !Object.values(GuestCheckStatus).includes(guestCheckStatus as GuestCheckStatus)) {
      throw new BadRequestException('Status de comanda inválido!');
    }
    return this.service.findAll(guestCheckStatus as GuestCheckStatus | undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.service.findOne(id);
  }

  //Cobrar a diferença de Patch e Put (será?)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto
  ): Promise<Order> {
    return this.service.updateStatus(id, dto);
  }

}