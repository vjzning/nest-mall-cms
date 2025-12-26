import {
    IsString,
    IsOptional,
    IsInt,
    IsEnum,
    IsNotEmpty,
} from 'class-validator';

export class CreateAddressDto {
    @IsString()
    @IsNotEmpty()
    receiverName: string;

    @IsString()
    @IsNotEmpty()
    receiverPhone: string;

    @IsString()
    @IsNotEmpty()
    countryCode: string;

    @IsString()
    @IsOptional()
    countryName?: string;

    @IsString()
    @IsOptional()
    stateProvince?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    districtCounty?: string;

    @IsString()
    @IsNotEmpty()
    addressLine1: string;

    @IsString()
    @IsOptional()
    addressLine2?: string;

    @IsString()
    @IsOptional()
    postalCode?: string;

    @IsInt()
    @IsOptional()
    isDefault?: number;

    @IsString()
    @IsOptional()
    tag?: string;
}

export class UpdateAddressDto {
    @IsString()
    @IsOptional()
    receiverName?: string;

    @IsString()
    @IsOptional()
    receiverPhone?: string;

    @IsString()
    @IsOptional()
    countryCode?: string;

    @IsString()
    @IsOptional()
    countryName?: string;

    @IsString()
    @IsOptional()
    stateProvince?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    districtCounty?: string;

    @IsString()
    @IsOptional()
    addressLine1?: string;

    @IsString()
    @IsOptional()
    addressLine2?: string;

    @IsString()
    @IsOptional()
    postalCode?: string;

    @IsInt()
    @IsOptional()
    isDefault?: number;

    @IsString()
    @IsOptional()
    tag?: string;
}
