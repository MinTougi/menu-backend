import { IsNotEmpty, IsString, MaxLength,IsBoolean, IsOptional, IsNumber, Min, IsUUID, IsUrl } from "class-validator";

export class UpdateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 2})
    @Min(0)
    price?: number;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @IsOptional()
    @IsUrl({require_protocol: true})
    picture?: string;
}