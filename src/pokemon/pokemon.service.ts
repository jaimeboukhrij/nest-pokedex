import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CreatePokemonDto } from './dto/create-pokemon.dto'
import { UpdatePokemonDto } from './dto/update-pokemon.dto'
import { isValidObjectId, Model } from 'mongoose'
import { Pokemon } from './entities/pokemon.entity'
import { InjectModel } from '@nestjs/mongoose'
import { PaginationDto } from 'src/common/dto/pagination.dto'

@Injectable()
export class PokemonService {
  constructor (
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>
  ) {

  }

  async create (createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon
    } catch (error) { this.handleExceptions(error) }
  }

  async findAll ({ limit = 10, offset = 0 }: PaginationDto) {
    return await this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
  }

  async findOne (term: string) {
    let pokemon: Pokemon

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }
    if (!pokemon) throw new NotFoundException(`Pokemon width id, name or no "${term}" not found `)

    return pokemon
  }

  async update (term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term)
      await pokemon.updateOne(updatePokemonDto)

      return { ...pokemon.toJSON(), ...updatePokemonDto }
    } catch (error) { this.handleExceptions(error) }
  }

  async remove (id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if (deletedCount === 0) throw new BadRequestException(`Pokemon width ${id} not found`)
  }

  private handleExceptions (error:any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exits en bd ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error)
    throw new InternalServerErrorException(' Check servers logs')
  }
}
