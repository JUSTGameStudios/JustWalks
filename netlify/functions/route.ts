import { Handler } from '@netlify/functions'

interface RouteRequest {
  start: [number, number]
  waypoints?: [number, number][]
  profile: string
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { start, waypoints = [], profile = 'foot-walking' }: RouteRequest = JSON.parse(event.body || '{}')
    
    if (!start || start.length !== 2) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid start coordinates' }),
      }
    }

    const orsApiKey = process.env.ORS_API_KEY
    if (!orsApiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'ORS API key not configured' }),
      }
    }

    // Build coordinates array: start -> waypoints -> start
    const coordinates = [start, ...waypoints, start]

    const requestBody = {
      coordinates,
      profile,
      format: 'geojson',
      geometry_simplify: false,
      instructions: true,
      elevation: false
    }

    const response = await fetch('https://api.openrouteservice.org/v2/directions/' + profile + '/geojson', {
      method: 'POST',
      headers: {
        'Authorization': orsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ORS API error:', response.status, errorText)
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Routing service error',
          details: errorText.substring(0, 200)
        }),
      }
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }

  } catch (error) {
    console.error('Route function error:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export { handler }