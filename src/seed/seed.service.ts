import { Injectable } from '@nestjs/common'
import { PokeResponse } from './interfaces/poke-response.interface'
import { InjectModel } from '@nestjs/mongoose'
import { Pokemon } from 'src/pokemon/entities/pokemon.entity'
import { Model } from 'mongoose'

@Injectable()
export class SeedService {
  constructor (
        @InjectModel(Pokemon.name)
        private readonly pokemonModel:Model<Pokemon>
  ) {}

  async executeSeed () {
    await this.pokemonModel.deleteMany({})

    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=650')
    const pokemons: PokeResponse = await response.json()

    const data = pokemons.results.map((pokemon, index) => (
      { name: pokemon.name, no: index + 1 }
    ))

    await this.pokemonModel.create(data)
    return 'seed exetuded'
  }
}
