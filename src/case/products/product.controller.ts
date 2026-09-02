import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common/decorators";
import { Product } from "./product.entity";
import { HttpStatus, ParseUUIDPipe } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product";
import { UpdateProductDto } from "./dto/update-product";
import { ProductService } from "./product.service";

@Controller ('products')
export class ProductController {

    constructor(
        private readonly service: ProductService
    ){}

    @Get()
    findAll(): Promise<Product[]> {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe)
        id: string
    ): Promise<Product> {
        return this.service.findOne(id);
    }

    @Post()
    create(dto: CreateProductDto): Promise<Product> {
        return this.service.create(dto);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe)
        id: string, 
        @Body()
        dto: UpdateProductDto,): Promise<Product> {
            return this.service.update(id, dto);
        }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
        remove(
            @Param('id', ParseUUIDPipe)
            id: string
        ): Promise<void> {
            return this.service.remove(id);
        }

}