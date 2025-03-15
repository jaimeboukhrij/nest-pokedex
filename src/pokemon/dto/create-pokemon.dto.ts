import { IsInt, IsString, MinLength, IsPositive } from 'class-validator'
export class CreatePokemonDto {
    @IsString()
    @MinLength(1)
      name:string

    @IsInt()
    @IsPositive()
      no:number
}
