import { IsNotEmpty, IsString, MaxLength,IsBoolean, IsOptional } from "class-validator";

export class UpdateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    name: string;

    @IsOptional()
    @IsBoolean()
    active: boolean;
}