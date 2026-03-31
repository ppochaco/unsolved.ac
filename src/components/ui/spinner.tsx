export const Spinner = () => {
  return (
    <div className="flex w-full justify-center pt-4">
      <div
        className="text-primary inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
        role="status"
        aria-label="loading"
      />
    </div>
  )
}
