import { useEffect, useState } from "react";
import { getFullPokedexNumber, getPokedexNumber } from "../utils/index.js";
import TypeCard from "./TypeCard.jsx";
import Modal from "./Modal.jsx";

export default function PokeCard(props) {
    const { selectedPokemon } = props
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [skill, setSkill] = useState(null)
    const [loadingSkill, setLoadingSkill] = useState(false)

    const { name, height, abilities, stats, types, moves, sprites } = data || {}

    const imgList = Object.keys(sprites || {}).filter(value => {
        return !(!sprites[value] || ["versions", "other"].includes(value))

    })

    async function fetchMoveData(move, moveURL) {
        if (loadingSkill || !localStorage || !moveURL) return
        let c = {}
        let pokemonMovesData = localStorage.getItem("pokemon-moves")
        if (pokemonMovesData) c = JSON.parse(pokemonMovesData)
        if (move in c)  {
            setSkill(c[move])
            console.log("Found pokemon in cache")
            return
        }

        try {
            setLoadingSkill(true)
            const response = await fetch(moveURL)
            const moveData = await response.json()
            console.log("Fetched move from API", moveData)
            const description = moveData?.flavor_text_entries.find(value => value.version_group.name === 'firered-leafgreen')?.flavor_text
            const skillData = {
                name: move,
                description: description
            }
            setSkill(skillData)
            c[move] = skillData
            localStorage.setItem("pokemon-moves", JSON.stringify(c))
        } catch (error) {
            console.log(error.message)
        } finally {
            setLoadingSkill(false)
        }
    }

    useEffect(() => {
        if (loading) {
            return
        }

        let cache = {}
        const savedCache = localStorage.getItem("pokedex")
        if (savedCache) {
            cache = JSON.parse(savedCache)
        }

        if(selectedPokemon in cache) {
            setData(cache[selectedPokemon])
            console.log("Found pokemon in cache")
            return
        }

        async function fetchPokemonData() {
            setLoading(true)
            try {
                const baseURL = "https://pokeapi.co/api/v2/"
                const suffix = "pokemon/" + getPokedexNumber(selectedPokemon)
                const finalURL = `${baseURL}${suffix}`
                const response = await fetch(finalURL)
                const pokemonData = await response.json()
                setData(pokemonData)
                console.log("Fetched pokemon data")

                cache[selectedPokemon] = pokemonData
                localStorage.setItem("pokedex", JSON.stringify(cache))
            } catch(err) {
                console.log(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPokemonData()

    }, [selectedPokemon])

    if (loading || !data) {
        return (
            <div>
                <h4>Loading...</h4>
            </div>
        )
    }

    return (
        <div className="poke-card">
            {
                skill && (
                    <Modal handleCloseModal={() => { setSkill(null) }}>
                        <div>
                            <h5>Name</h5>
                            <h2 className="skill-name">{skill.name.replaceAll('-', ' ')}</h2>
                        </div>
                        <div>
                            <h6>Description</h6>
                            <p>{skill.description}</p>
                        </div>
                    </Modal>
                )
            }
            <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
            <h2>{name.charAt(0).toUpperCase() + name.slice(1)}</h2>
            <div className="type-container">
                {
                    types.map((typeObj, typeIndex) => {
                        return (
                            <TypeCard key={typeIndex} type={typeObj?.type?.name} />
                        )
                    })
                }
            </div>
            <img src={"/pokemon/" + getFullPokedexNumber(selectedPokemon) + ".png"} alt={`${name}-large-im`} className="default-img"/>
            <h3>Sprites</h3>
            <div className="img-container">
                {
                    imgList.map((spriteURL, spriteIndex) => {
                        const imgURL = sprites[spriteURL]
                        return (
                            <img key={spriteIndex} src={imgURL} alt={`${name}-img-${spriteURL}`} />
                        )
                    })
                }
            </div>
            <h3>Stats</h3>
            <div className="stats-card">
                {
                    stats.map((statObj, statIndex) => {
                        const { stat, base_stat } = statObj
                        return (
                            <div key={statIndex} className="stat-item">
                                <p>
                                    {stat?.name.replaceAll('-', ' ')}
                                </p>
                                <h4>
                                    {base_stat}
                                </h4>
                            </div>
                        )
                    })
                }
            </div>
            <h3>Moves</h3>
            <div className="pokemon-move-grid">
                {
                    moves.map((moveObj, moveIndex) => {
                        return (
                            <button className="button-card pokemon-move" key={moveIndex} onClick={async () => {
                                await fetchMoveData(moveObj?.move?.name, moveObj?.move?.url)
                            }}>
                                <p>
                                    {moveObj?.move?.name.replaceAll('-', ' ')}
                                </p>
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )
}