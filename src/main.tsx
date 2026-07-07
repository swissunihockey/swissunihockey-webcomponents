import './style.css'
import { registerReactWebComponent } from './registerWebComponent'
import {
  UnihoClubGames,
  UnihoMobiliarTopscorer,
  UnihoRanking,
  UnihoTeam,
  UnihoTeamGames,
  UnihoTeamPlayers,
  UnihoTeamStatistics,
  UnihoTeamVisitors,
  UnihoTeams,
  UnihoClubTeamGames,
  UnihoLeagueGames,
} from './widgets'

registerReactWebComponent('uniho-club-games', UnihoClubGames, {
  clubId: 'string',
  season: 'string',
})

registerReactWebComponent('uniho-club-team-games', UnihoClubTeamGames, {
  clubId: 'number',
  season: 'string',
  pageSize: 'number',
})

registerReactWebComponent('uniho-team-games', UnihoTeamGames, {
  teamId: 'string',
  season: 'string',
  pageSize: 'number',
})

registerReactWebComponent('uniho-league-games', UnihoLeagueGames, {
  gameClass: 'string',
  league: 'string',
  season: 'string',
  group: 'string',
})

registerReactWebComponent('uniho-ranking', UnihoRanking, {
  season: 'string',
  league: 'string',
  gameClass: 'string',
  group: 'string',
  view: 'string',
})

registerReactWebComponent('uniho-mobiliar-topscorer', UnihoMobiliarTopscorer, {
  season: 'string',
  clubId: 'string',
  viewType: 'string',
})

registerReactWebComponent('uniho-teams', UnihoTeams, {
  mode: 'string',
  season: 'string',
  clubId: 'string',
  league: 'string',
  gameClass: 'string',
})

registerReactWebComponent('uniho-team', UnihoTeam, {
  teamId: 'string',
})

registerReactWebComponent('uniho-team-players', UnihoTeamPlayers, {
  teamId: 'string',
})

registerReactWebComponent('uniho-team-statistics', UnihoTeamStatistics, {
  teamId: 'string',
})

registerReactWebComponent('uniho-team-visitors', UnihoTeamVisitors, {
  season: 'string',
  league: 'string',
  gameClass: 'string',
})