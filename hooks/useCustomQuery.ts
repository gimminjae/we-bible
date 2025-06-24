import { useQuery } from "@tanstack/react-query"

interface Props {
  key: string
  queryFn: () => any
}
function useCustomQuery<T, R>({ key, queryFn }: Props) {
  const { error, data, refetch, isError, isLoading } = useQuery<T, R>({
    queryKey: [key],
    queryFn,
  })

  return {
    error,
    data,
    refetch,
    isError,
    isLoading,
  }
}
export { useCustomQuery }
