import { useRouter as useNextRouter } from "next/router"
import { useCallback } from "react"

interface RouterProps {
  path: string
  query?: { [key: string]: string }
}

const useCRouter = () => {
  const router = useNextRouter()

  const push = useCallback(
    ({ path, query }: RouterProps) => {
      router.push({
        pathname: path,
        query,
      })
    },
    [router]
  )

  const back = useCallback(() => {
    router.back()
  }, [router])

  return {
    push,
    back,
    query: router.query,
    pathname: router.pathname,
  }
}

export default useCRouter
