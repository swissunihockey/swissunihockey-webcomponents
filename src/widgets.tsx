import { TableRenderer } from './TableRenderer'
import { ClubGamesWeekRenderer, PlayoffGamesAccordionRenderer, TeamGamesPagerRenderer } from './GameListRenderer'
import { useSwissData, useSwissPaginatedTable } from './hooks'
import type { SwissTableResponse } from './types'
import { MobiliarTopscorerRenderer } from './MobiliarTopscorerRenderer'
import { useMemo, useState } from 'react'

export function UnihoClubGames(props: { clubId?: string; season?: string }) {
    const enabled = !!props.clubId

    const { data, error } = useSwissPaginatedTable(
        '/games',
        {
            mode: 'club',
            club_id: props.clubId,
            season: props.season,
        },
        enabled,
    )

    if (!props.clubId) {
        return (
            <WidgetShell title="Clubspiele">
                <p className="su-error">Attribut club-id fehlt.</p>
            </WidgetShell>
        )
    }

    return (
        <WidgetShell title="Clubspiele" error={error} loading={!data}>
            <ClubGamesWeekRenderer data={data} />
        </WidgetShell>
    )
}

export function UnihoClubTeamGames(props: {
    clubId: number
    season?: string
    pageSize?: number
}) {
    const [teamId, setTeamId] = useState<string>('')

    const season = props.season ?? String(new Date().getFullYear())

    const { data: teamsData, error: teamsError } = useSwissData<SwissTableResponse>(
        '/teams',
        {
            club_id: props.clubId,
            season,
            mode: 'by_club',
        },
        !!props.clubId,
    )

    const teams = teamsData?.entries ?? []
    const firstTeamId = String(teams[0]?.set_in_context?.team_id ?? '')
    const selectedTeamId = teamId || firstTeamId
    const selectedTeam = teams.find(
        (team) => String(team.set_in_context?.team_id ?? '') === selectedTeamId,
    )

    const { data: teamGamesData } = useSwissData<SwissTableResponse>(
        '/games',
        {
            mode: 'team',
            team_id: selectedTeamId,
            season,
        },
        !!selectedTeamId,
    )

    const clubName = useMemo(() => {
        const title = teamGamesData?.title

        if (!title) return undefined

        const match = title.match(/^Spielübersicht\s+(.*?),\s+/)

        return match?.[1]
    }, [teamGamesData])

    return (
        <WidgetShell title="Teamspiele nach Verein" error={teamsError} loading={!teamsData}>
            <section className="su-card">
                {clubName && <h3>{clubName}</h3>}

                <label className="su-search-field">
                    <span>Team auswählen</span>
                    <select
                        value={selectedTeamId}
                        onChange={(event) => setTeamId(event.target.value)}
                    >
                        {teams.map((team) => {
                            const id = String(team.set_in_context?.team_id ?? '')

                            return (
                                <option key={id} value={id}>
                                    {team.text}
                                </option>
                            )
                        })}
                    </select>
                </label>

                {selectedTeamId && (
                    <UnihoTeamGames
                        teamId={selectedTeamId}
                        season={season}
                        pageSize={props.pageSize}
                        embedded
                        showTableTitle={false}
                    />
                )}
            </section>
        </WidgetShell>
    )
}

export function UnihoTeamGames(props: {
    teamId?: string
    season?: string
    pageSize?: number
    embedded?: boolean
    showTableTitle?: boolean
}) {
    const enabled = !!props.teamId

    const { data, error } = useSwissPaginatedTable(
        '/games',
        {
            mode: 'team',
            team_id: props.teamId,
            season: props.season,
        },
        enabled,
    )

    if (!props.teamId) {
        const errorMessage = <p className="su-error">Attribut team-id fehlt.</p>

        return props.embedded ? (
            errorMessage
        ) : (
            <WidgetShell title="Teamspiele">{errorMessage}</WidgetShell>
        )
    }

    const content = (
        <TeamGamesPagerRenderer
            data={data}
            pageSize={props.pageSize || 4}
            showTitle={props.showTableTitle ?? true}
        />
    )

    if (props.embedded) {
        return (
            <>
                {error && <p className="su-error">{error}</p>}
                {!data && !error && <p className="su-loading">Lade Daten...</p>}
                {data && !error && content}
            </>
        )
    }

    return (
        <WidgetShell title="Teamspiele" error={error} loading={!data}>
            {content}
        </WidgetShell>
    )
}

export function UnihoLeagueGames(props: {
    gameClass?: string
    league?: string
    season?: string
    group?: string
}) {
    const enabled = !!props.gameClass && !!props.league

    const baseKey = JSON.stringify([
        props.gameClass,
        props.league,
        props.season,
        props.group,
    ])

    const [navigation, setNavigation] = useState<{
        baseKey: string
        params: Record<string, string | number | boolean>
    }>({
        baseKey,
        params: {},
    })

    const contextParams = navigation.baseKey === baseKey ? navigation.params : {}

    const { data, error } = useSwissData<SwissTableResponse>(
        '/games',
        {
            mode: 'list',
            game_class: props.gameClass,
            league: props.league,
            season: props.season,
            group: props.group,
            ...contextParams,
        },
        enabled,
    )

    const cleanedData = useMemo(() => {
        if (!data) return data

        const lastHeader = data.headers?.[data.headers.length - 1]
        const removeLastColumn =
            lastHeader?.text === '📺'

        if (!removeLastColumn) return data

        return {
            ...data,
            headers: data.headers?.slice(0, -1),
            regions: data.regions?.map((region: any) => ({
                ...region,
                rows: region.rows?.map((row: any) => ({
                    ...row,
                    cells: row.cells?.slice(0, -1),
                })),
            })),
        }
    }, [data])

    const prevParams = (data?.slider as any)?.prev?.set_in_context
    const nextParams = (data?.slider as any)?.next?.set_in_context
    const sliderText = (data?.slider as any)?.text

    if (!props.gameClass || !props.league) {
        return (
            <WidgetShell title="Ligaspiele">
                <p className="su-error">Attribute game-class und league fehlen.</p>
            </WidgetShell>
        )
    }

    return (
        <WidgetShell title="Ligaspiele" error={error} loading={!data}>
            <div>
                <div className="su-controls">
                    <button
                        type="button"
                        disabled={!prevParams}
                        onClick={() => setNavigation({ baseKey, params: prevParams })}
                    >
                        ← Frühere Spiele
                    </button>

                    <span>{sliderText ?? 'Aktuelle Runde'}</span>

                    <button
                        type="button"
                        disabled={!nextParams}
                        onClick={() => setNavigation({ baseKey, params: nextParams })}
                    >
                        Weitere Spiele →
                    </button>
                </div>

                <PlayoffGamesAccordionRenderer
                    data={cleanedData}
                />
            </div>
        </WidgetShell>
    )
}

type RankingProps = {
  season?: string
  league?: string
  gameClass?: string
  group?: string
  view?: string
}

export function UnihoRanking(props: RankingProps) {
  const { data, error } = useSwissData<SwissTableResponse>('/rankings', {
    season: props.season,
    league: props.league,
    game_class: props.gameClass,
    group: props.group,
    view: props.view || 'full',
  })

  return (
      <WidgetShell title="Rangliste" error={error} loading={!data}>
        <TableRenderer data={data} />
      </WidgetShell>
  )
}

export function UnihoMobiliarTopscorer(props: {
    season?: string
    clubId?: string
    viewType?: string
}) {
    const enabled = !!props.clubId

    const { data, error } = useSwissData<SwissTableResponse>(
        '/topscorers/mobiliar-highlight',
        {
            season: props.season,
            club_id: props.clubId,
            view_type: 'table',
        },
        enabled,
    )

    if (!props.clubId) {
        return (
            <WidgetShell title="Mobiliar Topscorer">
                <p className="su-error">Attribut club-id fehlt.</p>
            </WidgetShell>
        )
    }

    return (
        <WidgetShell title="" error={error} loading={!data}>
            <MobiliarTopscorerRenderer data={data} />
        </WidgetShell>
    )
}

type TeamsProps = {
  mode?: string
  season?: string
  clubId?: string
  league?: string
  gameClass?: string
}

export function UnihoTeams(props: TeamsProps) {
  const { data, error } = useSwissData<SwissTableResponse>('/teams', {
    mode: props.mode,
    season: props.season,
    club_id: props.clubId,
    league: props.league,
    game_class: props.gameClass,
  })

  return (
      <WidgetShell title="Teams" error={error} loading={!data}>
        <TableRenderer data={data} />
      </WidgetShell>
  )
}

export function UnihoTeam({ teamId }: { teamId?: string }) {
  const { data, error } = useSwissData<SwissTableResponse>(
      `/teams/${teamId}`,
      {},
      !!teamId,
  )

  if (!teamId) {
    return (
        <WidgetShell title="Team">
          <p className="su-error">Attribut team-id fehlt.</p>
        </WidgetShell>
    )
  }

  return (
      <WidgetShell title="Team" error={error} loading={!data}>
        <TableRenderer data={data} />
      </WidgetShell>
  )
}

export function UnihoTeamPlayers({ teamId }: { teamId?: string }) {
  const { data, error } = useSwissData<SwissTableResponse>(
      `/teams/${teamId}/players`,
      {},
      !!teamId,
  )

  if (!teamId) {
    return (
        <WidgetShell title="Kader">
          <p className="su-error">Attribut team-id fehlt.</p>
        </WidgetShell>
    )
  }

  return (
      <WidgetShell title="Kader" error={error} loading={!data}>
        <TableRenderer data={data} />
      </WidgetShell>
  )
}

export function UnihoTeamStatistics({ teamId }: { teamId?: string }) {
  const { data, error } = useSwissData<SwissTableResponse>(
      `/teams/${teamId}/statistics`,
      {},
      !!teamId,
  )

  if (!teamId) {
    return (
        <WidgetShell title="Team Statistik">
          <p className="su-error">Attribut team-id fehlt.</p>
        </WidgetShell>
    )
  }

  return (
      <WidgetShell title="Team Statistik" error={error} loading={!data}>
        <TableRenderer data={data} />
      </WidgetShell>
  )
}

export function UnihoTeamVisitors(props: { season?: string; league?: string; gameClass?: string }) {
  const { data, error } = useSwissData<SwissTableResponse>('/teams/visitors', {
    season: props.season,
    league: props.league,
    game_class: props.gameClass,
  })

  return (
      <WidgetShell title="Zuschauer" error={error} loading={!data}>
        <TableRenderer data={data} />
      </WidgetShell>
  )
}

function WidgetShell({
                       title,
                       error,
                       loading,
                       children,
                     }: {
  title: string
  error?: string
  loading?: boolean
  children?: React.ReactNode
}) {
  return (
      <div className="su-widget" part="container">
        <div className="su-widget-header">
          <span className="su-kicker">swiss unihockey</span>
          <h2>{title}</h2>
        </div>
        {error && <p className="su-error">{error}</p>}
        {loading && !error && <p className="su-loading">Lade Daten...</p>}
        {!loading && !error && children}
      </div>
  )
}