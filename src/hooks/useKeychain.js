import { useEffect, useState } from 'react'
import { getKeychain } from '../services/api.js'

/** Estado de carga del llavero: { status: 'loading' | 'success' | 'error', data, error } */
export function useKeychain(slug) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let active = true
    setState({ status: 'loading', data: null, error: null })

    getKeychain(slug)
      .then((data) => active && setState({ status: 'success', data, error: null }))
      .catch((error) => active && setState({ status: 'error', data: null, error }))

    return () => {
      active = false
    }
  }, [slug])

  return state
}
