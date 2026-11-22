import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto, CreateOrderItemDto } from "./dto/create-order";
import { Order, OrderStatus } from "./entities/order-entity";
import { OrderItem } from "./entities/order-item.entity";
import { GuestCheckService } from "../guest-checks/guest-check.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductService } from "../products/product.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status";
import { GuestCheckStatus } from "../guest-checks/guest-check.entity";

@Injectable()
export class OrderService {
  constructor(
    private readonly guestCheckService: GuestCheckService,
    private readonly productService: ProductService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>    
  ){}

  private async prepareItems(dto: CreateOrderItemDto): Promise<OrderItem> {
    const product = await this.productService.findOne(dto.productId);
    const subtotal = dto.quantity * Number(product.price);

    return this.orderItemRepository.create({
      product,
      quantity: dto.quantity,
      price: product.price,
      subtotal
    });
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // Regra #1: Verificar se tem comanda aberta para a mesa
    const guestCheck = await this.guestCheckService.findOrCreateOpened(dto.spotId);

    // Monta o totalizador do pedido
    const items: OrderItem[] = [];
    let total = 0;

    for (const itemDto of dto.items) {
      const item = await this.prepareItems(itemDto); // Prepara para inserir no banco
      items.push(item);
      total += Number(item.subtotal)
    }

    // Monta o pedido
    const order = this.orderRepository.create({
      guestCheck,
      status: OrderStatus.NEW,
      total,
      items
    })

    // Gravar no banco o pedido
    return this.orderRepository.save(order);    
  }

  findAll(guestCheckStatus?: GuestCheckStatus): Promise<Order[]> {
    return this.orderRepository.find({
      where: { ...(guestCheckStatus && { guestCheck: { status: guestCheckStatus } }) },
      relations: { guestCheck: { spot: true }, items: { product: true } },
      order: { createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { guestCheck: { spot: true }, items: { product: true } }
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado!');
    }

    return order;
  }

  async updateStatus(
    id: string, 
    dto: UpdateOrderStatusDto
  ): Promise<Order> {
    // Garante que o pedido existe (404 caso contrário)
    await this.findOne(id);

    // Transições livres: qualquer status -> qualquer status (validado pelo enum)
    if (!Object.values(OrderStatus).includes(dto.status)) {
      throw new BadRequestException('Status inválido!');
    }

    // Grava somente o status, sem regravar itens
    await this.orderRepository.update(id, { status: dto.status });

    return this.findOne(id);
  }
}