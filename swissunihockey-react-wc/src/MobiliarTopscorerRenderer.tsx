import type { SwissTableResponse } from './types'
import topscorerLogo from './assets/topscorer-logo-de.png'

type Player = {
    name: string
    club: string
    points: string
    image?: string
}

function text(value: unknown): string {
    if (Array.isArray(value)) return value.map(String).join(' ')
    if (value === undefined || value === null) return ''
    return String(value)
}

function imageUrl(value: any): string | undefined {
    return (
        value?.image?.url ||
        value?.image ||
        value?.url ||
        value?.picture?.url ||
        value?.photo?.url ||
        value?.portrait?.url ||
        value?.media?.url
    )
}

function parsePlayers(data?: SwissTableResponse): Player[] {
    const rows =
        data?.regions?.flatMap((region) => region.rows ?? []) ??
        data?.rows ??
        []

    if (!rows.length) return []

    const imageCells = rows[0]?.cells ?? []
    const nameCells = rows[1]?.cells ?? []
    const clubCells = rows[2]?.cells ?? []
    const pointsCells = rows[3]?.cells ?? []

    const maxPlayers = Math.max(
        imageCells.length,
        nameCells.length,
        clubCells.length,
        pointsCells.length,
    )

    const players: Player[] = []

    for (let index = 0; index < maxPlayers; index++) {
        const player: Player = {
            image: imageUrl(imageCells[index]),
            name: text(nameCells[index]?.text ?? nameCells[index]?.value),
            club: text(clubCells[index]?.text ?? clubCells[index]?.value),
            points: text(pointsCells[index]?.text ?? pointsCells[index]?.value),
        }

        if (player.image || player.name || player.club || player.points) {
            players.push(player)
        }
    }

    return players
}

export function MobiliarTopscorerRenderer({ data }: { data?: SwissTableResponse }) {
    const players = parsePlayers(data)

    if (!players.length) {
        return <p className="su-empty">Keine Mobiliar Topscorer gefunden.</p>
    }

    return (
        <div className="mobi-high-simple">
            <div className="mobi-high-simple__headline">
                <img
                    className="mobi-high-simple__headline-logo"
                    src={topscorerLogo}
                    alt="Die Mobiliar Topscorer"
                />
            </div>

            <div className="mobi-high-simple__list">
                {players.map((player, index) => (
                    <article className="mobi-high-simple__item" key={`${player.name}-${index}`}>
                        <div className="mobi-high-simple__image">
                            {player.image ? <img src={player.image} alt={player.name} /> : null}
                        </div>

                        <div className="mobi-high-simple__info">
                            <h3>{player.name}</h3>
                            {player.club && <p>{player.club}</p>}
                        </div>

                        <div className="mobi-high-simple__points">
                            <strong>{player.points || '-'}</strong>
                            <span>Punkte</span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}