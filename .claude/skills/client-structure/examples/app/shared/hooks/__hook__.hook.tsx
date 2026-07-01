import { useEffect, useState } from 'react'

// use<Hook>
export const use<Hook> = (input: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // … effect …
    setMatches(true)
  }, [input])

  return matches
}
