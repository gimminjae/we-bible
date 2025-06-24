const browserUtil = {
  makeSearchParam(object: Record<string, string>) {
    return object
  },
  // postMessage(type: string, data: unknown) {
    // if (!('ReactNativeWebView' in window)) {
      // 이 값이 없는 경우 모바일이 아니다.
      // return
    // }
    // (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type, data }))
  // },
  copyContent(content: string) {
    // if (!(window as unknown)?.ReactNativeWebView) {
      navigator.clipboard.writeText(content).then(
        // () => console.log("Text copied to clipboard successfully!"),
        (err) => console.error("Could not copy text: ", err)
      )
    // } else {
      // this.postMessage("copy", content)
      // window?.ReactNativeWebView?.postMessage(
      //   JSON.stringify({ type: "copy", data: content })
      // )
    // }
  },
  updateUrl: (inputParams: any) => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(inputParams).forEach(([key, value]) => {
      params.set(key, value as string)
    })
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, "", newUrl)
  }
}
export default browserUtil